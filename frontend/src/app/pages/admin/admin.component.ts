import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { User } from '../../core/models/auth.models';
import { Category, CreateCategoryRequest } from '../../core/models/project.models';
import { CategoryService } from '../../core/services/category.service';
import { UserService } from '../../core/services/user.service';

type AdminTab = 'users' | 'categories';
type RoleOption = 'Admin' | 'User';

interface AdminMetric {
  label: string;
  value: number;
  caption: string;
  tone: 'dark' | 'yellow' | 'cyan' | 'green';
}

interface CategoryChartRow {
  name: string;
  count: number;
  color: string;
  percent: number;
}

interface LegendItem {
  label: string;
  value: number;
  color: string;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin.component.html'
})
export class AdminComponent implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly userForm = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    role: ['User' as RoleOption, [Validators.required]],
    avatarUrl: [''],
    isActive: [true]
  });

  readonly categoryForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    color: ['#2563eb', [Validators.required, Validators.pattern(/^#[0-9a-fA-F]{6}$/)]],
    description: ['']
  });

  activeTab: AdminTab = 'users';
  users: User[] = [];
  categories: Category[] = [];
  editingUser: User | null = null;
  editingCategory: Category | null = null;
  loading = true;
  saving = false;
  errorMessage = '';

  readonly roles: RoleOption[] = ['User', 'Admin'];

  constructor(
    private readonly userService: UserService,
    private readonly categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadCategories();
  }

  setTab(tab: AdminTab): void {
    this.activeTab = tab;
    this.errorMessage = '';
  }

  get totalUsers(): number {
    return this.users.length;
  }

  get activeUsers(): number {
    return this.users.filter((user) => user.isActive).length;
  }

  get inactiveUsers(): number {
    return this.totalUsers - this.activeUsers;
  }

  get adminUsers(): number {
    return this.users.filter((user) => user.role === 'Admin').length;
  }

  get standardUsers(): number {
    return this.users.filter((user) => user.role === 'User').length;
  }

  get totalProjects(): number {
    return this.categories.reduce((total, category) => total + category.projectCount, 0);
  }

  get activeUserPercent(): number {
    return this.totalUsers === 0 ? 0 : Math.round((this.activeUsers / this.totalUsers) * 100);
  }

  get adminMetrics(): AdminMetric[] {
    return [
      {
        label: 'Total users',
        value: this.totalUsers,
        caption: `${this.activeUsers} active accounts`,
        tone: 'dark'
      },
      {
        label: 'Administrators',
        value: this.adminUsers,
        caption: `${this.standardUsers} standard users`,
        tone: 'yellow'
      },
      {
        label: 'Categories',
        value: this.categories.length,
        caption: 'Workspace taxonomy',
        tone: 'cyan'
      },
      {
        label: 'Tracked projects',
        value: this.totalProjects,
        caption: 'Across all categories',
        tone: 'green'
      }
    ];
  }

  get roleLegend(): LegendItem[] {
    return [
      { label: 'Admins', value: this.adminUsers, color: '#f5c542' },
      { label: 'Users', value: this.standardUsers, color: '#22d3ee' }
    ];
  }

  get statusLegend(): LegendItem[] {
    return [
      { label: 'Active', value: this.activeUsers, color: '#65a30d' },
      { label: 'Inactive', value: this.inactiveUsers, color: '#ef4444' }
    ];
  }

  get roleDonutGradient(): string {
    const adminPercent = this.totalUsers === 0 ? 0 : Math.round((this.adminUsers / this.totalUsers) * 100);
    return `conic-gradient(#f5c542 0 ${adminPercent}%, #22d3ee ${adminPercent}% 100%)`;
  }

  get categoryChartRows(): CategoryChartRow[] {
    const maxCount = Math.max(1, ...this.categories.map((category) => category.projectCount));
    return this.categories.map((category) => ({
      name: category.name,
      count: category.projectCount,
      color: category.color,
      percent: Math.max(6, Math.round((category.projectCount / maxCount) * 100))
    }));
  }

  submitUser(): void {
    this.userForm.markAllAsTouched();
    if (this.userForm.invalid || this.saving) {
      return;
    }

    this.saving = true;
    const value = this.userForm.getRawValue();
    const operation$ = this.editingUser
      ? this.userService.updateUser(this.editingUser.id, {
          fullName: value.fullName.trim(),
          role: value.role,
          avatarUrl: value.avatarUrl.trim() || null,
          isActive: value.isActive
        })
      : this.userService.createUser({
          fullName: value.fullName.trim(),
          email: value.email.trim(),
          password: value.password,
          role: value.role,
          avatarUrl: value.avatarUrl.trim() || null
        });

    operation$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.saving = false;
        this.resetUserForm();
        this.loadUsers();
      },
      error: (error: HttpErrorResponse) => {
        this.saving = false;
        this.errorMessage = this.extractError(error, 'User could not be saved.');
      }
    });
  }

  editUser(user: User): void {
    this.editingUser = user;
    this.userForm.patchValue({
      fullName: user.fullName,
      email: user.email,
      password: 'Password1!',
      role: user.role,
      avatarUrl: user.avatarUrl ?? '',
      isActive: user.isActive
    });
    this.userForm.controls.email.disable();
    this.userForm.controls.password.disable();
  }

  resetUserForm(): void {
    this.editingUser = null;
    this.userForm.reset({
      fullName: '',
      email: '',
      password: '',
      role: 'User',
      avatarUrl: '',
      isActive: true
    });
    this.userForm.controls.email.enable();
    this.userForm.controls.password.enable();
  }

  deleteUser(user: User): void {
    if (!window.confirm(`Delete or deactivate "${user.fullName}"?`)) {
      return;
    }

    this.userService.deleteUser(user.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => this.loadUsers(),
      error: (error: HttpErrorResponse) => {
        this.errorMessage = this.extractError(error, 'User could not be deleted.');
      }
    });
  }

  submitCategory(): void {
    this.categoryForm.markAllAsTouched();
    if (this.categoryForm.invalid || this.saving) {
      return;
    }

    this.saving = true;
    const request = this.buildCategoryRequest();
    const operation$ = this.editingCategory
      ? this.categoryService.updateCategory(this.editingCategory.id, request)
      : this.categoryService.createCategory(request);

    operation$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.saving = false;
        this.resetCategoryForm();
        this.loadCategories();
      },
      error: (error: HttpErrorResponse) => {
        this.saving = false;
        this.errorMessage = this.extractError(error, 'Category could not be saved.');
      }
    });
  }

  editCategory(category: Category): void {
    this.editingCategory = category;
    this.categoryForm.patchValue({
      name: category.name,
      color: category.color,
      description: category.description ?? ''
    });
  }

  resetCategoryForm(): void {
    this.editingCategory = null;
    this.categoryForm.reset({
      name: '',
      color: '#2563eb',
      description: ''
    });
  }

  deleteCategory(category: Category): void {
    if (!window.confirm(`Delete category "${category.name}"?`)) {
      return;
    }

    this.categoryService.deleteCategory(category.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => this.loadCategories(),
      error: (error: HttpErrorResponse) => {
        this.errorMessage = this.extractError(error, 'Category could not be deleted.');
      }
    });
  }

  private loadUsers(): void {
    this.loading = true;
    this.userService.getUsers().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.loading = false;
        this.errorMessage = this.extractError(error, 'Users could not be loaded.');
      }
    });
  }

  private loadCategories(): void {
    this.categoryService.getCategories().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = this.extractError(error, 'Categories could not be loaded.');
      }
    });
  }

  private buildCategoryRequest(): CreateCategoryRequest {
    const value = this.categoryForm.getRawValue();
    return {
      name: value.name.trim(),
      color: value.color,
      description: value.description.trim() || null
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
