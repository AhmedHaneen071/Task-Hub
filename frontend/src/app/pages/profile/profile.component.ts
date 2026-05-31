import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { User } from '../../core/models/auth.models';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  user: User | null = null;
  loading = true;
  errorMessage = '';

  readonly currentUser = this.auth.currentUserValue;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly userService: UserService,
    private readonly auth: AuthService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.userService.getUser(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (user) => {
        this.user = user;
        this.loading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.loading = false;
        this.errorMessage = error.status === 403
          ? 'You can only view your own profile.'
          : 'Profile could not be loaded.';
      }
    });
  }
}
