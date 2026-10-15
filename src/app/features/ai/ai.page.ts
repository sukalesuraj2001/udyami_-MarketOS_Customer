import { Component, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonicModule } from '@ionic/angular';
import { AlertController } from '@ionic/angular/standalone';
import { HttpErrorResponse } from '@angular/common/http';

import { AskUbService, AskUbRole } from '@core/services/ask-ub.service';
import { ThemeToggleComponent } from '@shared/components/theme-toggle/theme-toggle.component';
import { MenuButtonComponent } from '@shared/components/menu-button/menu-button.component';

interface ChatBubble {
  role: AskUbRole;
  content: string;
  failed?: boolean;
}

const STARTERS = [
  'How do I connect my Facebook page?',
  'What does my membership include?',
  'How do I publish a piece of content?',
  'How do enquiries reach me?',
];

@Component({
  selector: 'app-ai',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, ThemeToggleComponent, MenuButtonComponent],
  templateUrl: './ai.page.html',
  styleUrls: ['./ai.page.scss'],
})
export class AiPage {
  private readonly askUb = inject(AskUbService);
  private readonly alertCtrl = inject(AlertController);

  @ViewChild(IonContent) private ionContent?: IonContent;

  readonly starters = STARTERS;
  readonly loadingHistory = signal(true);
  readonly thinking = signal(false);
  readonly draft = signal('');
  readonly messages = signal<ChatBubble[]>([]);

  ionViewWillEnter(): void {
    this.loadHistory();
  }

  ask(text?: string): void {
    const question = (text ?? this.draft()).trim();
    if (!question || this.thinking()) return;

    this.draft.set('');
    this.messages.update((list) => [...list, { role: 'user', content: question }]);
    this.scrollToEnd();
    this.thinking.set(true);

    this.askUb.ask(question).subscribe({
      next: (response) => {
        this.messages.update((list) => [...list, { role: 'assistant', content: response.answer }]);
        this.thinking.set(false);
        this.scrollToEnd();
      },
      error: (error) => {
        const message = error instanceof HttpErrorResponse
          ? (error.error?.message || 'Something went wrong. Please try again.')
          : 'Something went wrong. Please try again.';
        this.messages.update((list) => [...list, { role: 'assistant', content: message, failed: true }]);
        this.thinking.set(false);
        this.scrollToEnd();
      },
    });
  }

  onSubmit(ev: Event): void {
    ev.preventDefault();
    this.ask();
  }

  async newChat(): Promise<void> {
    if (!this.messages().length) return;

    const alert = await this.alertCtrl.create({
      header: 'Start a new chat?',
      message: 'This closes your current conversation. You can still see past answers were given, but this chat will no longer continue from them.',
      cssClass: 'mk-alert',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Start new chat',
          role: 'confirm',
          handler: () => {
            this.askUb.clearChat().subscribe({
              next: () => this.messages.set([]),
              error: () => this.messages.set([]),
            });
          },
        },
      ],
    });
    await alert.present();
  }

  private loadHistory(): void {
    this.loadingHistory.set(true);
    this.askUb.getCurrentChat().subscribe({
      next: (response) => {
        this.messages.set(
          response.messages.map((m) => ({ role: m.role, content: m.content }))
        );
        this.loadingHistory.set(false);
        this.scrollToEnd();
      },
      error: (error) => {
        console.error('Failed to load Ask UB chat:', error);
        this.loadingHistory.set(false);
      },
    });
  }

  private scrollToEnd(): void {
    setTimeout(() => void this.ionContent?.scrollToBottom(200), 60);
  }
}
