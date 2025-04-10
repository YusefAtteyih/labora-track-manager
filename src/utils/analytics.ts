
/**
 * Utility functions for Google Analytics event tracking
 */

/**
 * Track a page view in Google Analytics
 * @param page Page path (e.g., '/dashboard')
 * @param title Page title
 */
export const trackPageView = (page: string, title?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'page_view', {
      page_path: page,
      page_title: title || document.title,
      page_location: window.location.href
    });
    console.log(`📊 Analytics: Page view tracked for ${page}`);
  }
};

/**
 * Track a custom event in Google Analytics
 * @param eventName Name of the event
 * @param eventParams Additional parameters for the event
 */
export const trackEvent = (eventName: string, eventParams?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, eventParams);
    console.log(`📊 Analytics: Event tracked: ${eventName}`, eventParams);
  }
};

/**
 * Track a button click event
 * @param buttonName Name of the button
 * @param location Page or component where the button is located
 */
export const trackButtonClick = (buttonName: string, location: string) => {
  trackEvent('button_click', {
    button_name: buttonName,
    page_location: location
  });
};

/**
 * Track a form submission event
 * @param formName Name of the form
 * @param success Whether the submission was successful
 */
export const trackFormSubmission = (formName: string, success: boolean) => {
  trackEvent('form_submission', {
    form_name: formName,
    success: success
  });
};

/**
 * Track a navigation event
 * @param from Source page
 * @param to Destination page
 */
export const trackNavigation = (from: string, to: string) => {
  trackEvent('navigation', {
    from_page: from,
    to_page: to
  });
};

/**
 * Track a search query
 * @param query Search term
 * @param resultsCount Number of results returned
 */
export const trackSearch = (query: string, resultsCount: number) => {
  trackEvent('search', {
    search_term: query,
    results_count: resultsCount
  });
};

/**
 * Track lab or equipment booking
 * @param itemId ID of the lab or equipment
 * @param itemName Name of the lab or equipment
 * @param itemType Type ('lab' or 'equipment')
 */
export const trackBooking = (itemId: string, itemName: string, itemType: 'lab' | 'equipment') => {
  trackEvent('booking', {
    item_id: itemId,
    item_name: itemName,
    item_type: itemType
  });
};
