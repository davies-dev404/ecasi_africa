import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ReactGA from 'react-ga4';

// Initialize with a placeholder or environment variable
// Replace 'G-XXXXXXXXXX' with your actual Measurement ID
const MEASUREMENT_ID = "G-XXXXXXXXXX"; 

ReactGA.initialize(MEASUREMENT_ID);

const Analytics = () => {
  const location = useLocation();

  useEffect(() => {
    // Send pageview with path
    ReactGA.send({ hitType: "pageview", page: location.pathname + location.search });
  }, [location]);

  return null; // This component doesn't render anything
};

export default Analytics;
