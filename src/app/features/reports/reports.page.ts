import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { forkJoin } from 'rxjs';

import { SectionHeaderComponent } from '@shared/components/section-header/section-header.component';
import { ThemeToggleComponent } from '@shared/components/theme-toggle/theme-toggle.component';
import { ApprovalService } from '@core/services/approval';
import { Profile } from '@core/services/profileService/profile';
import { GeneratedContentItem } from '@core/interfaces/socialMediaAcounts.interface';

interface ReportBar {
  label: string;
  pct: number;
  detail: string;
}

interface ReportMetric {
  label: string;
  value: string;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, IonicModule, SectionHeaderComponent, ThemeToggleComponent],
  templateUrl: './reports.page.html',
  styleUrls: ['./reports.page.scss'],
})
export class ReportsPage {
  private approvalService = inject(ApprovalService);
  private profileService = inject(Profile);

  readonly isLoading = signal(false);
  readonly hasError = signal(false);
  readonly weekLabel = signal('Last 7 days');
  readonly bars = signal<ReportBar[]>([]);
  readonly optimizationMetrics = signal<ReportMetric[]>([]);
  readonly diagnostics = signal<ReportMetric[]>([]);
  readonly isGenerating = signal(false);

  ionViewWillEnter(): void {
    this.loadReport();
  }

  loadReport(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    forkJoin({
      content: this.approvalService.getGeneratedContent(),
      wallet: this.profileService.getUserWalletData(),
    }).subscribe({
      next: ({ content, wallet }) => {
        const weeklyContent = (content?.data ?? []).filter((item) => this.isWithinLastSevenDays(item));
        this.setReportData(weeklyContent, wallet?.balanceCoins ?? 0);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Failed to load weekly report:', error);
        this.hasError.set(true);
        this.isLoading.set(false);
      },
    });
  }

  barColor(pct: number): string {
    if (pct > 50) return 'var(--mk-green)';
    if (pct > 25) return 'var(--mk-gold)';
    return 'var(--mk-gold)';
  }

  generate(): void {
    const payload = { html: this.buildReportHtml() };

    this.isGenerating.set(true);
    this.approvalService.downloadReport(payload).subscribe({
      next: (report) => {
        const url = URL.createObjectURL(report);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'marketos-weekly-report.pdf';
        link.click();
        URL.revokeObjectURL(url);
        this.isGenerating.set(false);
      },
      error: (error) => {
        console.error('Failed to download weekly report:', error);
        this.isGenerating.set(false);
      },
    });
  }

  private buildReportHtml(): string {
    const bars = this.bars().map((bar) => `
      <div class="bar-row">
        <div class="bar-label"><span>${this.escapeHtml(bar.label)}</span><strong>${bar.pct}%</strong></div>
        <div class="bar-track"><div class="bar-fill" style="width:${Math.max(bar.pct, 1.5)}%"></div></div>
        <small>${this.escapeHtml(bar.detail)}</small>
      </div>`).join('');
    const summary = this.optimizationMetrics().map((metric) => `
      <div class="metric"><span>${this.escapeHtml(metric.label)}</span><strong>${this.escapeHtml(metric.value)}</strong></div>`).join('');
    const diagnosticItems = this.diagnostics().map((metric) => `
      <div class="diagnostic"><span>${this.escapeHtml(metric.label)}</span><strong>${this.escapeHtml(metric.value)}</strong></div>`).join('');

    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>MarketOS Weekly Report</title>
  <style>
    @page { size: A4; margin: 0; }
    * { box-sizing: border-box; }
    body { margin: 0; color: #17202a; background: #eef3f7; font-family: Georgia, 'Times New Roman', serif; }
    .page { width: 210mm; min-height: 297mm; margin: auto; padding: 24mm 18mm; background: #f8fbfc; }
    .hero { position: relative; overflow: hidden; padding: 34px; color: #fff; border-radius: 24px; background: linear-gradient(135deg, #102a43 0%, #176b87 52%, #e29b42 150%); }
    .hero:after { content: ''; position: absolute; right: -54px; bottom: -86px; width: 230px; height: 230px; border: 1px solid rgba(255,255,255,.35); border-radius: 50%; box-shadow: 0 0 0 22px rgba(255,255,255,.08), 0 0 0 46px rgba(255,255,255,.05); }
    .eyebrow { position: relative; z-index: 1; color: #f6c66e; font: 700 11px Arial, sans-serif; letter-spacing: 2px; text-transform: uppercase; }
    h1 { position: relative; z-index: 1; max-width: 470px; margin: 12px 0 8px; font-size: 42px; line-height: 1.05; }
    .hero p { position: relative; z-index: 1; margin: 0; color: #dbeaf0; font: 14px Arial, sans-serif; }
    .section { margin-top: 26px; }
    .section-heading { display: flex; align-items: end; justify-content: space-between; gap: 20px; margin-bottom: 13px; }
    h2 { margin: 0; color: #102a43; font-size: 21px; }
    .section-heading span { color: #6b7d89; font: 12px Arial, sans-serif; }
    .metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
    .metric, .diagnostic { padding: 16px; border: 1px solid #d9e4e8; border-radius: 14px; background: linear-gradient(145deg, #fff, #edf6f6); }
    .metric span, .diagnostic span { display: block; color: #6b7d89; font: 11px Arial, sans-serif; }
    .metric strong { display: block; margin-top: 9px; color: #176b87; font-size: 22px; }
    .bars { padding: 18px 20px; border-radius: 16px; background: #fff; box-shadow: 0 8px 24px rgba(16,42,67,.07); }
    .bar-row { margin: 0 0 17px; }
    .bar-row:last-child { margin-bottom: 0; }
    .bar-label { display: flex; justify-content: space-between; margin-bottom: 6px; color: #233746; font: 13px Arial, sans-serif; }
    .bar-label strong { color: #176b87; }
    .bar-track { height: 9px; overflow: hidden; border-radius: 8px; background: #e6eef0; }
    .bar-fill { height: 100%; border-radius: inherit; background: linear-gradient(90deg, #176b87, #63c5b2, #efb35b); }
    .bar-row small { display: block; margin-top: 5px; color: #83939b; font: 10px Arial, sans-serif; }
    .diagnostics { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
    .diagnostic { display: flex; align-items: center; justify-content: space-between; }
    .diagnostic strong { color: #102a43; font: 700 15px Arial, sans-serif; }
    .footer { margin-top: 34px; padding-top: 13px; border-top: 1px solid #d9e4e8; color: #83939b; font: 10px Arial, sans-serif; }
  </style>
</head>
<body>
  <main class="page">
    <header class="hero">
      <div class="eyebrow">MarketOS / Performance brief</div>
      <h1>Weekly content report</h1>
      <p>${this.escapeHtml(this.weekLabel())} · Generated ${this.escapeHtml(new Date().toLocaleDateString('en-IN'))}</p>
    </header>
    <section class="section">
      <div class="section-heading"><h2>Weekly summary</h2><span>Content and account health</span></div>
      <div class="metrics">${summary}</div>
    </section>
    <section class="section">
      <div class="section-heading"><h2>Content distribution</h2><span>Share of weekly content</span></div>
      <div class="bars">${bars || '<p>No content activity was recorded in this period.</p>'}</div>
    </section>
    <section class="section">
      <div class="section-heading"><h2>Account diagnostics</h2><span>Source: MarketOS workspace data</span></div>
      <div class="diagnostics">${diagnosticItems}</div>
    </section>
    <footer class="footer">Prepared by MarketOS · This report reflects the latest content and wallet data available at generation time.</footer>
  </main>
</body>
</html>`;
  }

  private escapeHtml(value: string): string {
    return value.replace(/[&<>'"]/g, (character) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;',
    })[character] || character);
  }

  private setReportData(contents: GeneratedContentItem[], walletBalance: number): void {
    const published = contents.filter((item) => this.isPublished(item)).length;
    const rejected = contents.filter((item) => this.statusOf(item) === 'REJECTED').length;
    const pending = contents.filter((item) => this.statusOf(item) === 'GENERATED').length;
    const mediaItems = contents.filter((item) => Boolean(item.mediaUrl)).length;
    const platformCounts = new Map<string, number>();

    for (const content of contents) {
      const platform = content.platform || 'Other';
      platformCounts.set(platform, (platformCounts.get(platform) ?? 0) + 1);
    }

    const total = contents.length;
    this.bars.set([...platformCounts.entries()]
      .sort(([, first], [, second]) => second - first)
      .map(([label, count]) => ({
        label,
        pct: total ? Math.round((count / total) * 100) : 0,
        detail: `${count} ${count === 1 ? 'item' : 'items'}`,
      })));

    this.optimizationMetrics.set([
      { label: 'Content published', value: String(published) },
      { label: 'Approval rate', value: total ? `${Math.round((published / total) * 100)}%` : '0%' },
      { label: 'Pending approval', value: String(pending) },
      { label: 'Wallet balance', value: this.formatCoins(walletBalance) },
    ]);

    this.diagnostics.set([
      { label: 'Total content', value: String(total) },
      { label: 'Rejected content', value: String(rejected) },
      { label: 'Media assets', value: String(mediaItems) },
      { label: 'Active platforms', value: String(platformCounts.size) },
    ]);
  }

  private isWithinLastSevenDays(content: GeneratedContentItem): boolean {
    const now = Date.now();
    const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
    const dates = [content.createdAt, content.updatedAt, content.publishedAt]
      .filter(Boolean)
      .map((value) => new Date(value as string).getTime())
      .filter((value) => !Number.isNaN(value));

    return dates.some((date) => date >= sevenDaysAgo && date <= now);
  }

  private isPublished(content: GeneratedContentItem): boolean {
    return this.statusOf(content) === 'PUBLISHED' || Boolean(content.publishedAt);
  }

  private statusOf(content: GeneratedContentItem): string {
    return String(content.status || '').toUpperCase();
  }

  private formatCoins(value: number): string {
    return `${new Intl.NumberFormat('en-IN').format(value)} coins`;
  }
}
