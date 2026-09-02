import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { MockDataService } from '@core/services/mock-data.service';
import { ToastService } from '@core/services/toast.service';
import { Approval, ContentApproval, SpendApproval } from '@core/models/models';
import { SectionHeaderComponent } from '@shared/components/section-header/section-header.component';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { ThemeToggleComponent } from '@shared/components/theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-approvals',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, SectionHeaderComponent, EmptyStateComponent, ThemeToggleComponent],
  templateUrl: './approvals.page.html',
  styleUrls: ['./approvals.page.scss'],
})
export class ApprovalsPage {
  data = inject(MockDataService);
  private toast = inject(ToastService);

  editTarget = signal<ContentApproval | null>(null);
  editText = '';

  rejectTarget = signal<Approval | null>(null);
  rejectReason = '';

  isContent(a: Approval): a is ContentApproval {
    return a.type === 'content';
  }
  isSpend(a: Approval): a is SpendApproval {
    return a.type === 'spend';
  }

  approve(id: string, isSpend = false): void {
    const a = this.data.decide(id, true);
    if (!a) return;
    this.toast.show('Approved', isSpend ? 'Change pushed to the ad platform' : `Scheduled for ${(a as ContentApproval).when}`, 'ok');
  }

  openEdit(a: ContentApproval): void {
    this.editTarget.set(a);
    this.editText = a.caption;
  }

  saveEdit(): void {
    const a = this.editTarget();
    if (!a) return;
    this.data.editCaption(a.id, this.editText);
    this.data.decide(a.id, true);
    this.editTarget.set(null);
    this.toast.show('Approved', `Scheduled for ${a.when}`, 'ok');
  }

  openReject(a: Approval): void {
    this.rejectReason = '';
    this.rejectTarget.set(a);
  }

  confirmReject(): void {
    const a = this.rejectTarget();
    if (!a) return;
    this.data.decide(a.id, false);
    this.rejectTarget.set(null);
    this.toast.show('Rejected', this.rejectReason ? 'Reason sent back for regeneration' : 'Removed from the queue', 'no');
  }

  approveAllContent(): void {
    const n = this.data.approveAllContent();
    if (!n) {
      this.toast.show('Nothing to approve', 'All content is already decided');
      return;
    }
    this.toast.show(`Approved ${n} posts`, 'Spend items still need individual decisions', 'ok');
  }

  sendToTelegram(): void {
    this.toast.show('Sent to Telegram', 'The same queue, with buttons, in your chat');
  }
}
