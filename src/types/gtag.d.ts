
/**
 * Type definitions for Google Analytics gtag
 */

interface Window {
  dataLayer: any[];
  gtag: (
    command: 'event' | 'config' | 'consent' | 'get',
    action: string,
    params?: {
      [key: string]: any;
    }
  ) => void;
}
