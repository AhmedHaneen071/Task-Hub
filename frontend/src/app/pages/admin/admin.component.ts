import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { User } from '../../core/models/auth.models';
import { Category, CreateCategoryRequest } from '../../core/models/project.models';
import { ApiErrorService } from '../../core/services/api-error.service';
import { CategoryService } from '../../core/services/category.service';
import { UserService } from '../../core/services/user.service';
import { ValidationMessageService } from '../../core/services/validation-message.service';
import {
  optionalUrl,
  trimmedEmail,
  trimmedMaxLength,
  trimmedMinLength,
  trimmedRequired
} from '../../shared/validators/form.validators';

type AdminTab = 'users' | 'categories';
type RoleOption = 'Admin' | 'User';
type UserControlName = 'fullName' | 'email' | 'password' | 'avatarUrl';
type CategoryControlName = 'name' | 'color' | 'description';

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
    fullName: ['', [trimmedRequired, trimmedMinLength(2), trimmedMaxLength(120)]],
    email: ['', [trimmedRequired, trimmedEmail, trimmedMaxLength(180)]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(100)]],
    role: ['User' as RoleOption, [Validators.required]],
    avatarUrl: ['', [optionalUrl]],
    isActive: [true]
  });

  readonly categoryForm = this.fb.group({
    name: ['', [trimmedRequired, trimmedMinLength(2), trimmedMaxLength(80)]],
    color: ['#2563eb', [Validators.required, Validators.pattern(/^#[0-9a-fA-F]{6}$/)]],
    description: ['', [trimmedMaxLength(300)]]
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
    private readonly categoryService: CategoryService,
    private readonly apiErrors: ApiErrorService,
    private readonly validationMessages: ValidationMessageService
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
    try {
      this.userForm.markAllAsTouched();
      if (this.userForm.invalid || this.saving) {
        this.errorMessage = 'Please correct the highlighted user fields before saving.';
        return;
      }

      this.saving = true;
      this.errorMessage = '';
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
        error: (error: unknown) => {
          this.saving = false;
          this.handleError(error, 'User could not be saved.');
        }
      });
    } catch (error: unknown) {
      this.saving = false;
      this.handleError(error, 'User could not be saved.');
    }
  }

  userFieldError(controlName: UserControlName, label: string): string {
    return this.validationMessages.controlError(this.userForm.controls[controlName], label);
  }

  hasUserFieldError(controlName: UserControlName): boolean {
    const control = this.userForm.controls[controlName];
    return control.invalid && (control.touched || control.dirty);
  }

  categoryFieldError(controlName: CategoryControlName, label: string): string {
    return this.validationMessages.controlError(this.categoryForm.controls[controlName], label);
  }

  hasCategoryFieldError(controlName: CategoryControlName): boolean {
    const control = this.categoryForm.controls[controlName];
    return control.invalid && (control.touched || control.dirty);
  }

  editUser(user: User): void {
    this.editingUser = user;
    this.userForm.patchValue({
      fullName: user.fullName,
      email: user.email,
      password: '',
      role: user.role,
      avatarUrl: user.avatarUrl ?? '',
      isActive: user.isActive
    });
    this.userForm.controls.email.disable();
    this.userForm.controls.password.disable();
    this.errorMessage = '';
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
    this.errorMessage = '';
  }

  deleteUser(user: User): void {
    try {
      if (!window.confirm(`Delete or deactivate "${user.fullName}"?`)) {
        return;
      }

      this.userService.deleteUser(user.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => this.loadUsers(),
        error: (error: unknown) => {
          this.handleError(error, 'User could not be deleted.');
        }
      });
    } catch (error: unknown) {
      this.handleError(error, 'User could not be deleted.');
    }
  }

  submitCategory(): void {
    try {
      this.categoryForm.markAllAsTouched();
      if (this.categoryForm.invalid || this.saving) {
        this.errorMessage = 'Please correct the highlighted category fields before saving.';
        return;
      }

      this.saving = true;
      this.errorMessage = '';
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
        error: (error: unknown) => {
          this.saving = false;
          this.handleError(error, 'Category could not be saved.');
        }
      });
    } catch (error: unknown) {
      this.saving = false;
      this.handleError(error, 'Category could not be saved.');
    }
  }

  editCategory(category: Category): void {
    this.editingCategory = category;
    this.categoryForm.patchValue({
      name: category.name,
      color: category.color,
      description: category.description ?? ''
    });
    this.errorMessage = '';
  }

  resetCategoryForm(): void {
    this.editingCategory = null;
    this.categoryForm.reset({
      name: '',
      color: '#2563eb',
      description: ''
    });
    this.errorMessage = '';
  }

  deleteCategory(category: Category): void {
    try {
      if (!window.confirm(`Delete category "${category.name}"?`)) {
        return;
      }

      this.categoryService.deleteCategory(category.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => this.loadCategories(),
        error: (error: unknown) => {
          this.handleError(error, 'Category could not be deleted.');
        }
      });
    } catch (error: unknown) {
      this.handleError(error, 'Category could not be deleted.');
    }
  }

  private loadUsers(): void {
    try {
      this.loading = true;
      this.userService.getUsers().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (users) => {
          this.users = users;
          this.loading = false;
        },
        error: (error: unknown) => {
          this.loading = false;
          this.handleError(error, 'Users could not be loaded.');
        }
      });
    } catch (error: unknown) {
      this.loading = false;
      this.handleError(error, 'Users could not be loaded.');
    }
  }

  private loadCategories(): void {
    try {
      this.categoryService.getCategories().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (categories) => {
          this.categories = categories;
        },
        error: (error: unknown) => {
          this.handleError(error, 'Categories could not be loaded.');
        }
      });
    } catch (error: unknown) {
      this.handleError(error, 'Categories could not be loaded.');
    }
  }

  private buildCategoryRequest(): CreateCategoryRequest {
    const value = this.categoryForm.getRawValue();
    return {
      name: value.name.trim(),
      color: value.color,
      description: value.description.trim() || null
    };
  }

  private handleError(error: unknown, fallback: string): void {
    this.errorMessage = this.apiErrors.toMessage(error, fallback);
  }
}
