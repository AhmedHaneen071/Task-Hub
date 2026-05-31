import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { User } from '../../core/models/auth.models';
import {
  Category,
  CreateProjectRequest,
  Project,
  ProjectPriorityValue,
  ProjectStatusName,
  ProjectStatusValue
} from '../../core/models/project.models';
import { AuthService } from '../../core/services/auth.service';
import { CategoryService } from '../../core/services/category.service';
import { ProjectService } from '../../core/services/project.service';
import { UserService } from '../../core/services/user.service';
import { StatusHighlightDirective } from '../../shared/directives/status-highlight.directive';

interface SelectOption<T> {
  label: string;
  value: T;
}

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, StatusHighlightDirective],
  templateUrl: './projects.component.html'
})
export class ProjectsComponent implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly statusOptions: SelectOption<ProjectStatusValue>[] = [
    { label: 'Planning', value: ProjectStatusValue.Planning },
    { label: 'Active', value: ProjectStatusValue.Active },
    { label: 'Blocked', value: ProjectStatusValue.Blocked },
    { label: 'Completed', value: ProjectStatusValue.Completed }
  ];

  readonly priorityOptions: SelectOption<ProjectPriorityValue>[] = [
    { label: 'Low', value: ProjectPriorityValue.Low },
    { label: 'Medium', value: ProjectPriorityValue.Medium },
    { label: 'High', value: ProjectPriorityValue.High },
    { label: 'Critical', value: ProjectPriorityValue.Critical }
  ];

  readonly filterForm = this.fb.group({
    search: [''],
    status: ['All']
  });

  readonly projectForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    status: [ProjectStatusValue.Active, [Validators.required]],
    priority: [ProjectPriorityValue.Medium, [Validators.required]],
    dueDate: [''],
    categoryId: [0, [Validators.required, Validators.min(1)]],
    ownerId: [0]
  });

  projects: Project[] = [];
  categories: Category[] = [];
  owners: User[] = [];
  editingProject: Project | null = null;
  loading = true;
  saving = false;
  errorMessage = '';

  readonly isAdmin = this.auth.isAdmin();

  constructor(
    private readonly projectService: ProjectService,
    private readonly categoryService: CategoryService,
    private readonly userService: UserService,
    private readonly auth: AuthService
  ) {}

  get filteredProjects(): Project[] {
    const filters = this.filterForm.getRawValue();
    const search = filters.search.trim().toLowerCase();
    const status = filters.status as ProjectStatusName | 'All';

    return this.projects.filter((project) => {
      const matchesSearch = !search ||
        project.name.toLowerCase().includes(search) ||
        project.description.toLowerCase().includes(search) ||
        project.categoryName.toLowerCase().includes(search);
      const matchesStatus = status === 'All' || project.status === status;
      return matchesSearch && matchesStatus;
    });
  }

  ngOnInit(): void {
    this.loadProjects();
    this.loadCategories();
    if (this.isAdmin) {
      this.loadOwners();
    }
  }

  submitProject(): void {
    this.projectForm.markAllAsTouched();
    if (this.projectForm.invalid || this.saving) {
      return;
    }

    this.saving = true;
    const request = this.buildProjectRequest();
    const operation$ = this.editingProject
      ? this.projectService.updateProject(this.editingProject.id, request)
      : this.projectService.createProject(request);

    operation$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.saving = false;
        this.resetForm();
        this.loadProjects();
      },
      error: (error: HttpErrorResponse) => {
        this.saving = false;
        this.errorMessage = this.extractError(error, 'Project could not be saved.');
      }
    });
  }

  editProject(project: Project): void {
    this.editingProject = project;
    this.projectForm.patchValue({
      name: project.name,
      description: project.description,
      status: ProjectStatusValue[project.status],
      priority: ProjectPriorityValue[project.priority],
      dueDate: project.dueDate ? project.dueDate.substring(0, 10) : '',
      categoryId: project.categoryId,
      ownerId: project.ownerId
    });
  }

  resetForm(): void {
    this.editingProject = null;
    this.projectForm.reset({
      name: '',
      description: '',
      status: ProjectStatusValue.Active,
      priority: ProjectPriorityValue.Medium,
      dueDate: '',
      categoryId: this.categories[0]?.id ?? 0,
      ownerId: this.auth.currentUserValue?.id ?? 0
    });
  }

  deleteProject(project: Project): void {
    const confirmed = window.confirm(`Delete project "${project.name}"?`);
    if (!confirmed) {
      return;
    }

    this.projectService.deleteProject(project.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => this.loadProjects(),
      error: (error: HttpErrorResponse) => {
        this.errorMessage = this.extractError(error, 'Project could not be deleted.');
      }
    });
  }

  completion(project: Project): number {
    return project.taskCount === 0
      ? 0
      : Math.round((project.completedTaskCount / project.taskCount) * 100);
  }

  private loadProjects(): void {
    this.loading = true;
    this.projectService.getProjects().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (projects) => {
        this.projects = projects;
        this.loading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.loading = false;
        this.errorMessage = this.extractError(error, 'Projects could not be loaded.');
      }
    });
  }

  private loadCategories(): void {
    this.categoryService.getCategories().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (categories) => {
        this.categories = categories;
        if (categories.length > 0 && this.projectForm.controls.categoryId.value === 0) {
          this.projectForm.controls.categoryId.setValue(categories[0].id);
        }
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = this.extractError(error, 'Categories could not be loaded.');
      }
    });
  }

  private loadOwners(): void {
    this.userService.getUsers().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (users) => {
        this.owners = users.filter((user) => user.isActive);
        const currentUserId = this.auth.currentUserValue?.id ?? 0;
        this.projectForm.controls.ownerId.setValue(currentUserId);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = this.extractError(error, 'Users could not be loaded.');
      }
    });
  }

  private buildProjectRequest(): CreateProjectRequest {
    const value = this.projectForm.getRawValue();
    return {
      name: value.name.trim(),
      description: value.description.trim(),
      status: value.status,
      priority: value.priority,
      dueDate: value.dueDate || null,
      categoryId: value.categoryId,
      ownerId: value.ownerId > 0 ? value.ownerId : null
    };
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
