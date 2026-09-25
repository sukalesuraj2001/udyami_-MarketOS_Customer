import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import {
  MockDataService,
  SupportArticle,
} from '@core/services/mock-data.service';
import { ToastService } from '@core/services/toast.service';
import { ThemeToggleComponent } from '@shared/components/theme-toggle/theme-toggle.component';
import { BackButtonComponent } from '@shared/components/back-button/back-button.component';

@Component({
  selector: 'app-help-support',
  standalone: true,
  imports: [BackButtonComponent, CommonModule, IonicModule, ThemeToggleComponent],
  templateUrl: './help-support.page.html',
  styleUrls: ['./help-support.page.scss'],
})
export class HelpSupportPage {
  readonly data = inject(MockDataService);
  private readonly toast = inject(ToastService);
  readonly searchTerm = signal('');
  readonly selectedTopic = signal('all');
  readonly expandedArticle = signal<string | null>('first-campaign');

  readonly popularArticles = computed(() => this.data.supportArticles().filter((article) => article.popular));
  readonly filteredArticles = computed(() => {
    const query = this.searchTerm().trim().toLowerCase();
    const topic = this.selectedTopic();

    return this.data.supportArticles().filter((article) => {
      const matchesTopic = topic === 'all' || article.topicId === topic;
      const matchesQuery = !query
        || `${article.question} ${article.answer}`.toLowerCase().includes(query);
      return matchesTopic && matchesQuery;
    });
  });

  toggleArticle(article: SupportArticle): void {
    this.expandedArticle.update((current) => current === article.id ? null : article.id);
  }

  selectTopic(topicId: string): void {
    this.selectedTopic.set(topicId);
  }

  clearSearch(): void {
    this.searchTerm.set('');
  }

  contactSupport(channel: 'chat' | 'email'): void {
    const message = channel === 'chat'
      ? 'A support conversation is ready to start.'
      : 'Your email app is ready with the Jyovix Marketing support address.';
    this.toast.show('Support desk', message, 'ok');
  }

  topicLabel(topicId: string): string {
    return this.data.supportTopics().find((topic) => topic.id === topicId)?.label || 'Jyovix Marketing';
  }
}
