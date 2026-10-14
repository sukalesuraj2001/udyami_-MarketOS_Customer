import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { API_ENDPOINTS } from '@app/endpoints/endpoints';
import { Observable } from 'rxjs';
import {
  ContentQuotaStatus,
  GeneratedContentItem,
  GeneratedContentResponse,
} from '../interfaces/socialMediaAcounts.interface';

export interface PublishContentPayload {
  userId: string;
  generatedContentId: string;
  channel: string;
  media_type: 'image' | 'video';
  format: 'feed' | 'reel';
  media: { url: string }[];
  caption: string;
}

export interface DownloadReportPayload {
  html: string;
}

export interface PlatformAnalytics {
  id: string;
  userId: string;
  platform: string;
  periodDays: number;
  postsMeasured: number;
  totalReach: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  totalEngagement: number;
  averageEngagementRate: number;
  bestPost: string | null;
  summary: string;
  metricsWarning?: string | null;
  collectedAt: string;
  createdAt: string;
}

export interface PlatformAnalyticsResponse {
  success: boolean;
  message: string;
  data: PlatformAnalytics;
}

export interface PostMetricItem {
  platformPostId: string;
  channel: string;
  postedAt: string | null;
  reach: number;
  likes: number;
  comments: number;
  shares: number;
  engagement: number;
  engagementRate: number;
  metricsCollectedAt: string | null;
  id: string | null;
  contentType: string | null;
  mediaType: string | null;
  mediaUrl: string | null;
  generatedContent: string | null;
  aiResponse: any;
  activityType: string | null;
  status: string | null;
  publishedAt: string | null;
}

export interface PostMetricsResponse {
  success: boolean;
  message: string;
  data: PostMetricItem[];
}

@Injectable({
  providedIn: 'root',
})
export class ApprovalService {

  constructor(
    private http: HttpClient
  ) { }

  private getUserId(): string {
    const stored = localStorage.getItem('marketos.auth');

    if (!stored) {
      throw new Error('User is not logged in.');
    }

    try {
      const authData = JSON.parse(stored);

      const userId = authData?.user?.userId;

      if (!userId) {
        throw new Error('User ID not found.');
      }

      return userId;

    } catch (error) {
      console.error(
        'Failed to read user information:',
        error
      );

      throw new Error(
        'Invalid authentication data.'
      );
    }
  }

  getGeneratedContent(): Observable<GeneratedContentResponse> {

    const userId = this.getUserId();

    return this.http.get<GeneratedContentResponse>(
      `${environment.apiUrl}${API_ENDPOINTS.GENERATED_CONTENT.GET_BY_USER_ID(userId)}`
    );
  }

  getPlatformAnalytics(platform: string): Observable<PlatformAnalyticsResponse> {
    return this.http.get<PlatformAnalyticsResponse>(
      `${environment.apiUrl}${API_ENDPOINTS.GENERATED_CONTENT.ANALYTICS(this.getUserId(), platform)}`,
    );
  }

  /** This month's content usage against the plan's quota — drives the upgrade banner. */
  getContentQuotaUsage(): Observable<ContentQuotaStatus> {
    return this.http.get<ContentQuotaStatus>(
      `${environment.apiUrl}${API_ENDPOINTS.GENERATED_CONTENT.USAGE(this.getUserId())}`,
    );
  }

  getPostMetrics(platform: string): Observable<PostMetricsResponse> {
    return this.http.get<PostMetricsResponse>(
      `${environment.apiUrl}${API_ENDPOINTS.GENERATED_CONTENT.POST_METRICS(this.getUserId(), platform)}`,
    );
  }


  regenerateContent(contentId: string, requirement: string) {
    return this.http.post(
      `${environment.apiUrl}${API_ENDPOINTS.GENERATED_CONTENT.REGENERATE(contentId)}`,
      {
        requirement,
      }
    );
  }

  rejectContent(contentId: string) {
    return this.http.patch(
      `${environment.apiUrl}${API_ENDPOINTS.GENERATED_CONTENT.REJECT(contentId)}`,
      {}
    );
  }

  private getMarketingContent(content: GeneratedContentItem): any {
    const aiResponse = content.aiResponse;

    if (aiResponse?.marketingContent) {
      return aiResponse.marketingContent;
    }

    if (aiResponse?.response) {
      return aiResponse.response;
    }

    if (typeof content.generatedContent === 'string') {
      try {
        return JSON.parse(content.generatedContent);
      } catch {
        return {};
      }
    }

    return {};
  }

  publishContent(content: GeneratedContentItem) {
    const mediaTypeValue = String(content.mediaType || '').toLowerCase();
    const mediaType = mediaTypeValue.startsWith('video/')
      || mediaTypeValue === 'video'
      ? 'video'
      : 'image';
    const channel = String(content.platform || 'instagram')
      .split(/[·|/-]/, 1)[0]
      .trim()
      .toLowerCase();
    const marketingContent = this.getMarketingContent(content);
    const caption = String(marketingContent.caption || '').trim();
    const hashtags = Array.isArray(marketingContent.hashtags)
      ? marketingContent.hashtags
        .map((hashtag: unknown) => String(hashtag).trim())
        .filter(Boolean)
        .join(' ')
      : '';

    const payload: PublishContentPayload = {
      userId: this.getUserId(),
      generatedContentId: content.id,
      channel,
      media_type: mediaType,
      format: mediaType === 'video' ? 'reel' : 'feed',
      media: [{ url: content.mediaUrl || '' }],
      caption: [caption, hashtags].filter(Boolean).join('\n\n'),
    };

    return this.http.post(
      `${environment.apiUrl}${API_ENDPOINTS.GENERATED_CONTENT.PUBLISH}`,
      payload
    );
  }

  downloadReport(payload: DownloadReportPayload): Observable<Blob> {
    return this.http.post(
      `${environment.apiUrl}${API_ENDPOINTS.GENERATED_CONTENT.DOWNLOAD_REPORT}`,
      payload,
      { responseType: 'blob' },
    );
  }
}
