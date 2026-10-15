import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ENDPOINTS } from '@app/endpoints/endpoints';
import { environment } from '@env/environment';
import { SKIP_GLOBAL_LOADER } from '@core/interceptors/loader.interceptor';

export type AskUbRole = 'user' | 'assistant';

export interface AskUbMessageItem {
  id: string;
  role: AskUbRole;
  content: string;
  knowledgeIds: string[] | null;
  createdAt: string;
}

export interface AskUbConversation {
  id: string;
  title: string;
  isActive: boolean;
  lastMessageAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AskUbChatResponse {
  conversation: AskUbConversation | null;
  messages: AskUbMessageItem[];
}

export interface AskUbSource {
  id: string;
  category: string;
  title: string;
  screen: string | null;
}

export interface AskUbReplyResponse {
  conversationId: string;
  messageId: string;
  answer: string;
  sources: AskUbSource[];
  createdAt: string;
}

/** The real backend AI assistant — Claude, answering questions about this app/account. */
@Injectable({ providedIn: 'root' })
export class AskUbService {
  constructor(private readonly http: HttpClient) {}

  /** The signed-in user's ongoing chat, oldest message first. */
  getCurrentChat() {
    return this.http.get<AskUbChatResponse>(
      `${environment.apiUrl}${API_ENDPOINTS.ASK_UB.CHAT}`
    );
  }

  /**
   * Asks a question; continues the ongoing chat. Skips the global loader —
   * this can take several seconds, and the chat screen shows its own
   * "thinking" state instead of blocking the whole page.
   */
  ask(message: string) {
    return this.http.post<AskUbReplyResponse>(
      `${environment.apiUrl}${API_ENDPOINTS.ASK_UB.CHAT}`,
      { message },
      { context: new HttpContext().set(SKIP_GLOBAL_LOADER, true) }
    );
  }

  /** Starts a new chat — closes the ongoing one. */
  clearChat() {
    return this.http.delete<{ success: boolean }>(
      `${environment.apiUrl}${API_ENDPOINTS.ASK_UB.CHAT}`
    );
  }
}
