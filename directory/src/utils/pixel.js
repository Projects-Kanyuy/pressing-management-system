/* eslint-disable no-unused-expressions */
// Facebook Pixel utility functions
export const initPixel = () => {
    if (typeof window === 'undefined' || !window.fbq) {
        // Initialize Facebook Pixel if not already loaded
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        
        const pixelId = process.env.REACT_APP_FACEBOOK_PIXEL_ID;
        if (pixelId) {
            window.fbq('init', pixelId);
            window.fbq('track', 'PageView');
        }
    }
};

export const trackPageView = () => {
    if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('track', 'PageView');
    }
};

export const trackEvent = (eventName, eventData = {}) => {
    if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('track', eventName, eventData);
    }
};