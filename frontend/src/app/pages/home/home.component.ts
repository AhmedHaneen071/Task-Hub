import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

interface HeroMetric {
  label: string;
  value: string;
}

interface FeatureItem {
  title: string;
  body: string;
  accent: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit, OnDestroy {
  readonly metrics: HeroMetric[] = [
    { label: 'active projects', value: '18' },
    { label: 'tasks closed this week', value: '74' },
    { label: 'teams aligned', value: '9' }
  ];

  readonly features: FeatureItem[] = [
    {
      title: 'Plan',
      body: 'Create project roadmaps with priority, category, due date, and owner context.',
      accent: 'var(--blue)'
    },
    {
      title: 'Execute',
      body: 'Assign tasks, track status changes, and keep comments close to the work.',
      accent: 'var(--green)'
    },
    {
      title: 'Review',
      body: 'Use dashboard signals to spot blocked work, overdue tasks, and recent activity.',
      accent: 'var(--orange)'
    }
  ];

  activeMetricIndex = 0;
  private timerId: number | null = null;

  ngOnInit(): void {
    this.timerId = window.setInterval(() => {
      this.activeMetricIndex = (this.activeMetricIndex + 1) % this.metrics.length;
    }, 2200);
  }

  ngOnDestroy(): void {
    if (this.timerId !== null) {
      window.clearInterval(this.timerId);
    }
  }
}
