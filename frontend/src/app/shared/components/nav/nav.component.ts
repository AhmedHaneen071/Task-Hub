import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Observable } from 'rxjs';
import { UserSummary } from '../../../core/models/auth.models';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './nav.component.html'
})
export class NavComponent {
  readonly user$: Observable<UserSummary | null> = this.auth.currentUser$;

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router
  ) {}

  logout(): void {
    this.auth.logout();
    void this.router.navigate(['/']);
  }
}
