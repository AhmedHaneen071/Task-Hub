import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { DashboardData } from '../../core/models/project.models';
import { ApiErrorService } from '../../core/services/api-error.service';
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
    private readonly auth: AuthService,
    private readonly apiErrors: ApiErrorService
  ) {}

  get taskDistributionRows() {
    if (!this.data) return [];
    const dist = this.data.statusDistribution;
    const total = dist.toDo + dist.inProgress + dist.review + dist.done;
    if (total === 0) return [];

    return [
      { label: 'To Do', count: dist.toDo, color: '#94a3b8', percent: (dist.toDo / total) * 100 },
      { label: 'In Progress', count: dist.inProgress, color: '#3b82f6', percent: (dist.inProgress / total) * 100 },
      { label: 'Review', count: dist.review, color: '#f59e0b', percent: (dist.review / total) * 100 },
      { label: 'Done', count: dist.done, color: '#10b981', percent: (dist.done / total) * 100 }
    ];
  }

  ngOnInit(): void {
    try {
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
        error: (error: unknown) => {
          this.loading = false;
          this.errorMessage = this.apiErrors.toMessage(error, 'Dashboard data could not be loaded.');
        }
      });
    } catch (error: unknown) {
      this.loading = false;
      this.errorMessage = this.apiErrors.toMessage(error, 'Dashboard data could not be loaded.');
    }
  }
}
