// src/components/PixelTracker.jsx

import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { initPixel, trackPageView } from '../utils/pixel';

const PixelTracker = () => {
  const location = useLocation();
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize the pixel on the first component mount
  useEffect(() => {
    if (!process.env.REACT_APP_FACEBOOK_PIXEL_ID) {
      console.warn("Meta Pixel ID not found in environment variables.");
      return;
    }

    initPixel();
    setIsInitialized(true);
  }, []);

  // Track page views on route changes
  useEffect(() => {
    if (isInitialized) {
      trackPageView();
    }
  }, [location, isInitialized]);

  return null; // This component does not render anything
};

export default PixelTracker;