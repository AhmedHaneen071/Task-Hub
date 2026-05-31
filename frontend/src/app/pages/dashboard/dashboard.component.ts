import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { DashboardData } from '../../core/models/project.models';
import { AuthService } from '../../core/services/auth.service';
import { DashboardService } from '../../core/services/dashboard.service';
import { DomNotesComponent } from '../../shared/components/dom-notes/dom-notes.component';
import { StatusHighlightDirective } from '../../shared/directives/status-highlight.directive';

interface MetricCard {
  label: string;
  value: number;
  tone: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, DomNotesComponent, StatusHighlightDirective],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  data: DashboardData | null = null;
  metrics: MetricCard[] = [];
  loading = true;
  errorMessage = '';

  readonly user = this.auth.currentUserValue;

  constructor(
    private readonly dashboardService: DashboardService,
    private readonly auth: AuthService
  ) {}

  ngOnInit(): void {
    this.dashboardService.getDashboard().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => {
        this.data = data;
        this.metrics = [
          { label: 'Total projects', value: data.totalProjects, tone: 'blue' },
          { label: 'Active projects', value: data.activeProjects, tone: 'green' },
          { label: 'Open tasks', value: data.openTasks, tone: 'orange' },
          { label: 'Completed tasks', value: data.completedTasks, tone: 'violet' }
        ];
        this.loading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.loading = false;
        this.errorMessage = error.status === 0
          ? 'API server is not reachable.'
          : 'Dashboard data could not be loaded.';
      }
    });
  }
}
