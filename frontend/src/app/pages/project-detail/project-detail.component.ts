import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
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
import { AuthService } from '../../core/services/auth.service';
import { CommentService } from '../../core/services/comment.service';
import { ProjectService } from '../../core/services/project.service';
import { TaskService } from '../../core/services/task.service';
import { UserService } from '../../core/services/user.service';
import { StatusHighlightDirective } from '../../shared/directives/status-highlight.directive';

interface SelectOption<T> {
  label: string;
  value: T;
}

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
    title: ['', [Validators.required, Validators.minLength(2)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    status: [TaskStatusValue.ToDo, [Validators.required]],
    dueDate: [''],
    assigneeId: [0]
  });

  readonly commentForm = this.fb.group({
    message: ['', [Validators.required, Validators.minLength(2)]]
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

  constructor(
    private readonly route: ActivatedRoute,
    private readonly projectService: ProjectService,
    private readonly taskService: TaskService,
    private readonly commentService: CommentService,
    private readonly userService: UserService,
    private readonly auth: AuthService
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
    this.taskForm.markAllAsTouched();
    if (!this.project || this.taskForm.invalid || this.savingTask) {
      return;
    }

    this.savingTask = true;
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
      error: (error: HttpErrorResponse) => {
        this.savingTask = false;
        this.errorMessage = this.extractError(error, 'Task could not be saved.');
      }
    });
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
      error: (error: HttpErrorResponse) => {
        this.errorMessage = this.extractError(error, 'Task could not be deleted.');
      }
    });
  }

  submitComment(): void {
    this.commentForm.markAllAsTouched();
    if (!this.selectedTask || this.commentForm.invalid || this.savingComment) {
      return;
    }

    this.savingComment = true;
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
      error: (error: HttpErrorResponse) => {
        this.savingComment = false;
        this.errorMessage = this.extractError(error, 'Comment could not be saved.');
      }
    });
  }

  deleteComment(comment: CommentItem): void {
    this.commentService.deleteComment(comment.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        if (this.selectedTask) {
          this.loadComments(this.selectedTask.id);
        }
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = this.extractError(error, 'Comment could not be deleted.');
      }
    });
  }

  private loadProject(): void {
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
      error: (error: HttpErrorResponse) => {
        this.loading = false;
        this.errorMessage = this.extractError(error, 'Project could not be loaded.');
      }
    });
  }

  private loadUsers(): void {
    this.userService.getActiveUsers().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (users) => {
        this.users = users;
      },
      error: () => {
        this.users = [];
      }
    });
  }

  private loadComments(taskId: number): void {
    this.commentService.getComments(taskId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (comments) => {
        this.comments = comments;
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = this.extractError(error, 'Comments could not be loaded.');
      }
    });
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

  private extractError(error: HttpErrorResponse, fallback: string): string {
    if (error.status === 0) {
      return 'The API server is not reachable. Please ensure the backend is running.';
    }
    if (typeof error.error?.message === 'string') {
      return error.error.message;
    }
    return fallback;
  }
}
