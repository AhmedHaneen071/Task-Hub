import { Directive, ElementRef, Input, OnChanges, Renderer2 } from '@angular/core';

type StatusTone = 'Planning' | 'Active' | 'Blocked' | 'Completed' | 'ToDo' | 'InProgress' | 'Review' | 'Done' | string;

const STATUS_COLORS: Record<string, { background: string; foreground: string }> = {
  Planning: { background: 'rgba(96, 165, 250, 0.1)', foreground: '#60a5fa' },
  Active: { background: 'rgba(16, 185, 129, 0.1)', foreground: '#10b981' },
  Blocked: { background: 'rgba(244, 63, 94, 0.1)', foreground: '#f43f5e' },
  Completed: { background: 'rgba(139, 92, 246, 0.1)', foreground: '#8b5cf6' },
  ToDo: { background: 'rgba(148, 163, 184, 0.1)', foreground: '#94a3b8' },
  InProgress: { background: 'rgba(59, 130, 246, 0.1)', foreground: '#3b82f6' },
  Review: { background: 'rgba(245, 158, 11, 0.1)', foreground: '#f59e0b' },
  Done: { background: 'rgba(16, 185, 129, 0.1)', foreground: '#10b981' }
};

@Directive({
  selector: '[appStatusHighlight]',
  standalone: true
})
export class StatusHighlightDirective implements OnChanges {
  @Input('appStatusHighlight') status: StatusTone = 'ToDo';

  constructor(
    private readonly elementRef: ElementRef<HTMLElement>,
    private readonly renderer: Renderer2
  ) {}

  ngOnChanges(): void {
    const colors = STATUS_COLORS[this.status] ?? STATUS_COLORS['ToDo'];
    this.renderer.setStyle(this.elementRef.nativeElement, 'backgroundColor', colors.background);
    this.renderer.setStyle(this.elementRef.nativeElement, 'color', colors.foreground);
    this.renderer.setStyle(this.elementRef.nativeElement, 'borderColor', colors.foreground);
  }
}
