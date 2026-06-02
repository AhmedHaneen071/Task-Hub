import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { User } from '../../core/models/auth.models';
import { Project } from '../../core/models/project.models';
import { ApiErrorService } from '../../core/services/api-error.service';
import { AuthService } from '../../core/services/auth.service';
import { ProjectService } from '../../core/services/project.service';
import { UserService } from '../../core/services/user.service';
import { StatusHighlightDirective } from '../../shared/directives/status-highlight.directive';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, StatusHighlightDirective],
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  user: User | null = null;
  projects: Project[] = [];
  loading = true;
  errorMessage = '';

  readonly currentUser = this.auth.currentUserValue;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly userService: UserService,
    private readonly projectService: ProjectService,
    private readonly auth: AuthService,
    private readonly apiErrors: ApiErrorService
  ) {}

  ngOnInit(): void {
    try {
      const id = Number(this.route.snapshot.paramMap.get('id'));
      this.userService.getUser(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (user) => {
          this.user = user;
          this.loadUserProjects(id);
        },
        error: (error: unknown) => {
          this.loading = false;
          this.errorMessage = this.apiErrors.toMessage(error, 'Profile could not be loaded.');
        }
      });
    } catch (error: unknown) {
      this.loading = false;
      this.errorMessage = this.apiErrors.toMessage(error, 'Profile could not be loaded.');
    }
  }

  private loadUserProjects(userId: number): void {
    this.projectService.getProjects().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (projects) => {
        this.projects = projects.filter(p => p.ownerId === userId);
        this.loading = false;
      },
      error: () => {
        this.loading = false; // Graceful failure for projects
      }
    });
  }
}
