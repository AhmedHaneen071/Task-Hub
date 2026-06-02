import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { UserSummary } from '../../core/models/auth.models';
import {
  CommentItem,
  CreateTaskRequest,
  ProjectDetail,
  TaskItem,
  TaskStatusName,
  TaskStatusValue
} from '../../core/models/project.models';
import { ApiErrorService } from '../../core/services/api-error.service';
import { AuthService } from '../../core/services/auth.service';
import { CommentService } from '../../core/services/comment.service';
import { ProjectService } from '../../core/services/project.service';
import { TaskService } from '../../core/services/task.service';
import { UserService } from '../../core/services/user.service';
import { ValidationMessageService } from '../../core/services/validation-message.service';
import { StatusHighlightDirective } from '../../shared/directives/status-highlight.directive';
import { trimmedMaxLength, trimmedMinLength, trimmedRequired } from '../../shared/validators/form.validators';

interface SelectOption<T> {
  label: string;
  value: T;
}

type TaskControlName = 'title' | 'description';
type CommentControlName = 'message';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, StatusHighlightDirective],
  templateUrl: './project-detail.component.html'
})
export class ProjectDetailComponent implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly taskStatusOptions: SelectOption<TaskStatusValue>[] = [
    { label: 'To do', value: TaskStatusValue.ToDo },
    { label: 'In progress', value: TaskStatusValue.InProgress },
    { label: 'Review', value: TaskStatusValue.Review },
    { label: 'Done', value: TaskStatusValue.Done }
  ];

  readonly taskForm = this.fb.group({
    title: ['', [trimmedRequired, trimmedMinLength(2), trimmedMaxLength(160)]],
    description: ['', [trimmedRequired, trimmedMinLength(10), trimmedMaxLength(1000)]],
    status: [TaskStatusValue.ToDo, [Validators.required]],
    dueDate: [''],
    assigneeId: [0]
  });

  readonly commentForm = this.fb.group({
    message: ['', [trimmedRequired, trimmedMinLength(2), trimmedMaxLength(1200)]]
  });

  project: ProjectDetail | null = null;
  users: UserSummary[] = [];
  selectedTask: TaskItem | null = null;
  editingTask: TaskItem | null = null;
  comments: CommentItem[] = [];
  loading = true;
  savingTask = false;
  savingComment = false;
  errorMessage = '';

  readonly currentUser = this.auth.currentUserValue;

  get completion(): number {
    if (!this.project || this.project.tasks.length === 0) return 0;
    const completed = this.project.tasks.filter(t => t.status === 'Done').length;
    return Math.round((completed / this.project.tasks.length) * 100);
  }

  constructor(
    private readonly route: ActivatedRoute,
    private readonly projectService: ProjectService,
    private readonly taskService: TaskService,
    private readonly commentService: CommentService,
    private readonly userService: UserService,
    private readonly auth: AuthService,
    private readonly apiErrors: ApiErrorService,
    private readonly validationMessages: ValidationMessageService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadProject();
  }

  selectTask(task: TaskItem): void {
    this.selectedTask = task;
    this.loadComments(task.id);
  }

  submitTask(): void {
    try {
      this.taskForm.markAllAsTouched();
      if (!this.project || this.taskForm.invalid || this.savingTask) {
        this.errorMessage = this.project
          ? 'Please correct the highlighted task fields before saving.'
          : 'Project is still loading. Try again in a moment.';
        return;
      }

      this.savingTask = true;
      this.errorMessage = '';
      const request = this.buildTaskRequest(this.project.id);
      const operation$ = this.editingTask
        ? this.taskService.updateTask(this.editingTask.id, request)
        : this.taskService.createTask(request);

      operation$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => {
          this.savingTask = false;
          this.resetTaskForm();
          this.loadProject();
        },
        error: (error: unknown) => {
          this.savingTask = false;
          this.handleError(error, 'Task could not be saved.');
        }
      });
    } catch (error: unknown) {
      this.savingTask = false;
      this.handleError(error, 'Task could not be saved.');
    }
  }

  taskFieldError(controlName: TaskControlName, label: string): string {
    return this.validationMessages.controlError(this.taskForm.controls[controlName], label);
  }

  hasTaskFieldError(controlName: TaskControlName): boolean {
    const control = this.taskForm.controls[controlName];
    return control.invalid && (control.touched || control.dirty);
  }

  commentFieldError(controlName: CommentControlName, label: string): string {
    return this.validationMessages.controlError(this.commentForm.controls[controlName], label);
  }

  hasCommentFieldError(controlName: CommentControlName): boolean {
    const control = this.commentForm.controls[controlName];
    return control.invalid && (control.touched || control.dirty);
  }

  editTask(task: TaskItem): void {
    this.editingTask = task;
    this.taskForm.patchValue({
      title: task.title,
      description: task.description,
      status: this.toTaskStatusValue(task.status),
      dueDate: task.dueDate ? task.dueDate.substring(0, 10) : '',
      assigneeId: task.assigneeId ?? 0
    });
  }

  resetTaskForm(): void {
    this.editingTask = null;
    this.taskForm.reset({
      title: '',
      description: '',
      status: TaskStatusValue.ToDo,
      dueDate: '',
      assigneeId: 0
    });
  }

  deleteTask(task: TaskItem): void {
    try {
      if (!window.confirm(`Delete task "${task.title}"?`)) {
        return;
      }

      this.taskService.deleteTask(task.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => {
          if (this.selectedTask?.id === task.id) {
            this.selectedTask = null;
            this.comments = [];
          }
          this.loadProject();
        },
        error: (error: unknown) => {
          this.handleError(error, 'Task could not be deleted.');
        }
      });
    } catch (error: unknown) {
      this.handleError(error, 'Task could not be deleted.');
    }
  }

  submitComment(): void {
    try {
      this.commentForm.markAllAsTouched();
      if (!this.selectedTask || this.commentForm.invalid || this.savingComment) {
        this.errorMessage = this.selectedTask
          ? 'Please correct the highlighted comment before posting.'
          : 'Select a task before posting a comment.';
        return;
      }

      this.savingComment = true;
      this.errorMessage = '';
      const request = {
        message: this.commentForm.controls.message.value.trim(),
        taskId: this.selectedTask.id,
        authorId: null
      };

      this.commentService.createComment(request).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => {
          this.savingComment = false;
          this.commentForm.reset({ message: '' });
          this.loadComments(this.selectedTask!.id);
          this.loadProject();
        },
        error: (error: unknown) => {
          this.savingComment = false;
          this.handleError(error, 'Comment could not be saved.');
        }
      });
    } catch (error: unknown) {
      this.savingComment = false;
      this.handleError(error, 'Comment could not be saved.');
    }
  }

  deleteComment(comment: CommentItem): void {
    try {
      this.commentService.deleteComment(comment.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => {
          if (this.selectedTask) {
            this.loadComments(this.selectedTask.id);
          }
        },
        error: (error: unknown) => {
          this.handleError(error, 'Comment could not be deleted.');
        }
      });
    } catch (error: unknown) {
      this.handleError(error, 'Comment could not be deleted.');
    }
  }

  private loadProject(): void {
    try {
      const id = Number(this.route.snapshot.paramMap.get('id'));
      this.loading = true;

      this.projectService.getProject(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (project) => {
          this.project = project;
          this.loading = false;

          if (this.selectedTask) {
            const updated = project.tasks.find(t => t.id === this.selectedTask?.id);
            if (updated) {
              this.selectedTask = updated;
            } else {
              this.selectedTask = project.tasks.length > 0 ? project.tasks[0] : null;
            }
          } else if (project.tasks.length > 0) {
            this.selectTask(project.tasks[0]);
          }
        },
        error: (error: unknown) => {
          this.loading = false;
          this.handleError(error, 'Project could not be loaded.');
        }
      });
    } catch (error: unknown) {
      this.loading = false;
      this.handleError(error, 'Project could not be loaded.');
    }
  }

  private loadUsers(): void {
    try {
      this.userService.getActiveUsers().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (users) => {
          this.users = users;
        },
        error: (error: unknown) => {
          this.users = [];
          this.handleError(error, 'Users could not be loaded.');
        }
      });
    } catch (error: unknown) {
      this.users = [];
      this.handleError(error, 'Users could not be loaded.');
    }
  }

  private loadComments(taskId: number): void {
    try {
      this.commentService.getComments(taskId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (comments) => {
          this.comments = comments;
        },
        error: (error: unknown) => {
          this.handleError(error, 'Comments could not be loaded.');
        }
      });
    } catch (error: unknown) {
      this.handleError(error, 'Comments could not be loaded.');
    }
  }

  private buildTaskRequest(projectId: number): CreateTaskRequest {
    const value = this.taskForm.getRawValue();
    return {
      title: value.title.trim(),
      description: value.description.trim(),
      status: value.status,
      dueDate: value.dueDate || null,
      projectId,
      assigneeId: value.assigneeId > 0 ? value.assigneeId : null
    };
  }

  private toTaskStatusValue(status: TaskStatusName): TaskStatusValue {
    return TaskStatusValue[status as keyof typeof TaskStatusValue];
  }

  private handleError(error: unknown, fallback: string): void {
    this.errorMessage = this.apiErrors.toMessage(error, fallback);
  }
}
