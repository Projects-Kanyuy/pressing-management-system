// src/utils/pixel.js

/**
 * Initializes the Meta Pixel with the provided ID.
 * This should be called once when the application loads.
 */
export const initPixel = () => {
  const pixelId = process.env.REACT_APP_FACEBOOK_PIXEL_ID;
  if (window.fbq && pixelId) {
    window.fbq('init', pixelId);
  }
};

/**
 * Tracks a page view.
 * This should be called on initial page load and on every route change.
 */
export const trackPageView = () => {
  if (window.fbq) {
    window.fbq('track', 'PageView');
  }
};

/**
 * Tracks a custom event with optional parameters.
 * @param {string} eventName - The name of the custom event (e.g., 'Purchase', 'Lead').
 * @param {object} [data={}] - Optional data to send with the event.
 */
export const trackEvent = (eventName, data = {}) => {
  if (window.fbq) {
    window.fbq('track', eventName, data);
  }
};