import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Component, inject, signal, } from '@angular/core';
import { ToastService } from '@core/services/toast.service';
import { ApprovalService } from '@app/core/services/approval';
import { MockDataService } from '@core/services/mock-data.service';
import { Approval, ContentApproval, SpendApproval, } from '@core/models/models';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { ThemeToggleComponent } from '@shared/components/theme-toggle/theme-toggle.component';
import { SectionHeaderComponent } from '@shared/components/section-header/section-header.component';
import { AlertController } from '@ionic/angular/standalone';

@Component({
  selector: 'app-approvals',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SectionHeaderComponent,
    EmptyStateComponent,
    ThemeToggleComponent,
  ],
  templateUrl: './approvals.page.html',
  styleUrls: ['./approvals.page.scss'],
})
export class ApprovalsPage {

  // Existing mock data service
  data = inject(MockDataService);
  private alertController = inject(AlertController);

  // Services
  private toast = inject(ToastService);
  private approvalService = inject(ApprovalService);

  // ============================================
  // GENERATED CONTENT
  // ============================================

  generatedContents = signal<any[]>([]);

  isLoading = signal(false);

  // ============================================
  // EDIT
  // ============================================

  editTarget = signal<ContentApproval | null>(null);

  editText = '';

  // ============================================
  // REJECT
  // ============================================

  rejectTarget = signal<Approval | null>(null);


  // ============================================
  // IONIC PAGE LIFECYCLE
  // ============================================

  ionViewWillEnter(): void {
    this.getGeneratedContent();
  }

  // ============================================
  // GET GENERATED CONTENT
  // ============================================

  getGeneratedContent(): void {

    this.isLoading.set(true);

    this.approvalService
      .getGeneratedContent()
      .subscribe({

        next: (response) => {

          console.log(
            'Generated Content:',
            response
          );

          this.generatedContents.set(
            response?.data ?? []
          );

          this.isLoading.set(false);
        },

        error: (error) => {

          console.error(
            'Error fetching generated content:',
            error
          );

          this.generatedContents.set([]);

          this.isLoading.set(false);

          this.toast.show(
            'Error',
            'Failed to load generated content'
          );
        },

      });
  }

  // ============================================
  // BASE64 IMAGE URL
  // ============================================

  getImageUrl(content: any): string {
    if (!content?.generatedContent) {
      return '';
    }

    return content.generatedContent;
  }
  // ============================================
  // GET HEADLINE
  // ============================================

  getHeadline(content: any): string {

    return (
      content?.aiResponse
        ?.marketingContent
        ?.headline
      ||
      content?.productName
      ||
      'Marketing Content'
    );
  }

  // ============================================
  // GET CAPTION
  // ============================================

  getCaption(content: any): string {

    return (
      content?.aiResponse
        ?.marketingContent
        ?.caption
      || ''
    );
  }

  // ============================================
  // GET DESCRIPTION
  // ============================================

  getDescription(content: any): string {

    return (
      content?.aiResponse
        ?.marketingContent
        ?.description
      || ''
    );
  }

  // ============================================
  // GET CTA
  // ============================================

  getCallToAction(content: any): string {

    return (
      content?.aiResponse
        ?.marketingContent
        ?.callToAction
      || ''
    );
  }

  // ============================================
  // GET HASHTAGS
  // ============================================

  getHashtags(content: any): string[] {

    return (
      content?.aiResponse
        ?.marketingContent
        ?.hashtags
      || []
    );
  }

  // ============================================
  // GET ACTIVITY TITLE
  // ============================================

  getActivityTitle(content: any): string {

    return (
      content?.aiResponse
        ?.activity
        ?.title
      || ''
    );
  }

  // ============================================
  // GET ACTIVITY DATE
  // ============================================

  getActivityDate(content: any): string {

    return (
      content?.aiResponse
        ?.activity
        ?.date
      || ''
    );
  }

  // ============================================
  // GET ACTIVITY TIME
  // ============================================

  getActivityTime(content: any): string {

    return (
      content?.aiResponse
        ?.activity
        ?.time
      || ''
    );
  }

  // ============================================
  // CONTENT TYPE CHECK
  // ============================================

  isContent(
    a: Approval
  ): a is ContentApproval {

    return a.type === 'content';
  }

  // ============================================
  // SPEND TYPE CHECK
  // ============================================

  isSpend(
    a: Approval
  ): a is SpendApproval {

    return a.type === 'spend';
  }

  // ============================================
  // APPROVE
  // ============================================

  approve(
    id: string,
    isSpend = false
  ): void {

    const a = this.data.decide(
      id,
      true
    );

    if (!a) {
      return;
    }

    this.toast.show(
      'Approved',
      isSpend
        ? 'Change pushed to the ad platform'
        : `Scheduled for ${(a as ContentApproval).when}`,
      'ok'
    );
  }

  // ============================================
  // OPEN EDIT
  // ============================================

  openEdit(
    a: ContentApproval
  ): void {

    this.editTarget.set(a);

    this.editText = a.caption;
  }

  // ============================================
  // SAVE EDIT
  // ============================================

  saveEdit(): void {
    const a = this.editTarget();

    if (!a) {
      return;
    }

    if (!this.editText.trim()) {
      this.toast.show(
        'Requirement required',
        'Please enter a requirement before continuing.',
        'no'
      );
      return;
    }

    this.approvalService
      .regenerateContent(a.id, this.editText.trim())
      .subscribe({
        next: () => {

          // Close modal
          this.editTarget.set(null);

          // Clear input
          this.editText = '';

          this.toast.show(
            'Regenerating content',
            'Your content is being regenerated. We’ll notify you once it’s ready.',
            'ok'
          );

          this.getGeneratedContent();
        },

        error: (error) => {
          console.error(
            'Failed to regenerate content:',
            error
          );

          this.toast.show(
            'Error',
            'Failed to regenerate content. Please try again.',
            'no'
          );
        },
      });
  }

  // ============================================
  // OPEN REJECT
  // ============================================

  async openReject(a: any): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Reject Content',
      message: 'Are you sure you want to reject this content?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Reject',
          role: 'destructive',
          handler: () => {
            this.rejectContent(a.id);
          },
        },
      ],
    });

    await alert.present();
  }


  rejectContent(id: string): void {
    this.approvalService.rejectContent(id).subscribe({
      next: () => {
        this.getGeneratedContent();
      },

      error: (error) => {
        console.error('Failed to reject content:', error);

        this.toast.show(
          'Error',
          'Failed to reject content. Please try again.',
          'no'
        );
      },
    });
  }
  // ============================================
  // CONFIRM REJECT
  // ============================================

  // confirmReject(): void {
  //   const a = this.rejectTarget();

  //   if (!a) {
  //     return;
  //   }

  //   this.approvalService.rejectContent(a.id).subscribe({
  //     next: () => {
  //       this.rejectTarget.set(null);
  //       this.getGeneratedContent();
  //     },

  //     error: (error) => {
  //       console.error('Failed to reject content:', error);

  //       this.toast.show(
  //         'Error',
  //         'Failed to reject content. Please try again.',
  //         'no'
  //       );
  //     },
  //   });
  // }

  // ============================================
  // APPROVE ALL CONTENT
  // ============================================

  approveAllContent(): void {

    const n =
      this.data.approveAllContent();

    if (!n) {

      this.toast.show(
        'Nothing to approve',
        'All content is already decided'
      );

      return;
    }

    this.toast.show(
      `Approved ${n} posts`,
      'Spend items still need individual decisions',
      'ok'
    );
  }

  // ============================================
  // SEND TO TELEGRAM
  // ============================================

  sendToTelegram(): void {

    this.toast.show(
      'Sent to Telegram',
      'The same queue, with buttons, in your chat'
    );
  }
}