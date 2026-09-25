import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import {
  Incident,
  IncidentSeverity,
  IncidentService,
  IncidentStatus,
} from '@core/services/incident.service';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { ThemeToggleComponent } from '@shared/components/theme-toggle/theme-toggle.component';
import { ToastService } from '@core/services/toast.service';
import { ApprovalService } from '@core/services/approval';
import { GeneratedContentItem } from '@core/interfaces/socialMediaAcounts.interface';
import { BackButtonComponent } from '@shared/components/back-button/back-button.component';

type IncidentFilter = 'ALL' | IncidentStatus;

@Component({
  selector: 'app-incidents',
  standalone: true,
  imports: [BackButtonComponent, CommonModule, FormsModule, IonicModule, EmptyStateComponent, ThemeToggleComponent],
  templateUrl: './incidents.page.html',
  styleUrls: ['./incidents.page.scss'],
})
export class IncidentsPage {
  private readonly service = inject(IncidentService);
  private readonly toast = inject(ToastService);
  private readonly approvalService = inject(ApprovalService);

  readonly incidents = signal<Incident[]>([]);
  readonly generatedContents = signal<GeneratedContentItem[]>([]);
  readonly isLoadingContent = signal(false);
  readonly incidentTypes = [
    'TOKEN_LIMIT',
    'AI_GENERATION_FAILED',
    'IMAGE_GENERATION_FAILED',
    'PROMPT_GENERATION_FAILED',
    'AI_API_ERROR',
    'TIMEOUT',
    'UNKNOWN',
  ];
  readonly filter = signal<IncidentFilter>('ALL');
  readonly isLoading = signal(false);
  readonly isCreating = signal(false);
  readonly showCreate = signal(false);
  readonly error = signal('');
  readonly openCount = computed(() => this.incidents().filter((incident) => incident.status === 'OPEN').length);
  readonly resolvedCount = computed(() => this.incidents().filter((incident) => incident.status === 'RESOLVED').length);
  readonly visibleIncidents = computed(() => {
    const currentFilter = this.filter();
    return currentFilter === 'ALL'
      ? this.incidents()
      : this.incidents().filter((incident) => incident.status === currentFilter);
  });

  form = {
    activityType: 'SOCIAL_POST',
    incidentType: 'UNKNOWN',
    severity: 'MEDIUM' as IncidentSeverity,
    title: '',
    message: '',
    errorMessage: '',
    generatedContentId: '',
    calendarId: '',
  };

  ionViewWillEnter(): void {
    this.loadIncidents();
    this.loadGeneratedContent();
  }

  loadGeneratedContent(): void {
    this.isLoadingContent.set(true);
    this.approvalService.getGeneratedContent().subscribe({
      next: (response) => {
        this.generatedContents.set(response.data ?? []);
        this.isLoadingContent.set(false);
      },
      error: () => {
        this.generatedContents.set([]);
        this.isLoadingContent.set(false);
      },
    });
  }

  selectGeneratedContent(contentId: string): void {
    const content = this.generatedContents().find((item) => item.id === contentId);
    this.form.generatedContentId = content?.id ?? '';
    this.form.calendarId = content?.calendarId ?? '';
    if (content?.activityType) {
      this.form.activityType = content.activityType;
    }
  }

  loadIncidents(): void {
    this.isLoading.set(true);
    this.error.set('');
    this.service.getUserIncidents().subscribe({
      next: (incidents) => {
        this.incidents.set(incidents ?? []);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Incidents could not be loaded. Pull to refresh and try again.');
        this.isLoading.set(false);
      },
    });
  }

  setFilter(filter: IncidentFilter): void {
    this.filter.set(filter);
  }

  createIncident(): void {
    if (
      !this.form.generatedContentId.trim()
      || !this.form.calendarId.trim()
      || !this.form.activityType.trim()
      || !this.form.incidentType.trim()
      || !this.form.severity
      || !this.form.title.trim()
      || !this.form.message.trim()
      || !this.form.errorMessage.trim()
    ) {
      this.toast.show('Complete every field', 'All incident details are required before reporting');
      return;
    }

    this.isCreating.set(true);
    this.service.createIncident({
      activityType: this.form.activityType,
      incidentType: this.form.incidentType.trim().toUpperCase().replace(/\s+/g, '_'),
      severity: this.form.severity,
      title: this.form.title.trim(),
      message: this.form.message.trim(),
      errorMessage: this.form.errorMessage.trim(),
      generatedContentId: this.form.generatedContentId.trim(),
      calendarId: this.form.calendarId.trim(),
    }).subscribe({
      next: (incident) => {
        this.incidents.update((incidents) => [incident, ...incidents]);
        this.isCreating.set(false);
        this.showCreate.set(false);
        this.resetForm();
        this.toast.show('Incident reported', 'Your incident has been added to the open queue');
      },
      error: () => {
        this.isCreating.set(false);
        this.toast.show('Could not report incident', 'Please check your connection and try again');
      },
    });
  }

  resetForm(): void {
    this.form = {
      activityType: 'SOCIAL_POST',
      incidentType: 'UNKNOWN',
      severity: 'MEDIUM',
      title: '',
      message: '',
      errorMessage: '',
      generatedContentId: '',
      calendarId: '',
    };
  }

  severityClass(severity: IncidentSeverity): string {
    return severity.toLowerCase();
  }

  formatDate(value: string): string {
    return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }).format(new Date(value));
  }
}