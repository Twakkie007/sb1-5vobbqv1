interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  userId?: string;
}

class Analytics {
  private isEnabled: boolean = true;
  private userId: string | null = null;

  setUserId(userId: string) {
    this.userId = userId;
  }

  track(event: AnalyticsEvent) {
    if (!this.isEnabled) return;

    const eventData = {
      ...event,
      userId: event.userId || this.userId,
      timestamp: new Date().toISOString(),
      platform: 'mobile',
    };

    // In production, send to your analytics service
    console.log('Analytics Event:', eventData);
    
    // Example: Send to your analytics service
    // this.sendToAnalyticsService(eventData);
  }

  screen(screenName: string, properties?: Record<string, any>) {
    this.track({
      name: 'screen_view',
      properties: {
        screen_name: screenName,
        ...properties,
      },
    });
  }

  userAction(action: string, properties?: Record<string, any>) {
    this.track({
      name: 'user_action',
      properties: {
        action,
        ...properties,
      },
    });
  }

  aiInteraction(query: string, responseTime: number, success: boolean) {
    this.track({
      name: 'ai_interaction',
      properties: {
        query_length: query.length,
        response_time: responseTime,
        success,
      },
    });
  }

  mediaPlay(mediaId: string, mediaType: 'audio' | 'video', duration?: number) {
    this.track({
      name: 'media_play',
      properties: {
        media_id: mediaId,
        media_type: mediaType,
        duration,
      },
    });
  }

  communityEngagement(action: 'post_create' | 'comment' | 'like' | 'share', postId?: string) {
    this.track({
      name: 'community_engagement',
      properties: {
        action,
        post_id: postId,
      },
    });
  }

  disable() {
    this.isEnabled = false;
  }

  enable() {
    this.isEnabled = true;
  }
}

export const analytics = new Analytics();