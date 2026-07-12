import React, { useEffect } from 'react';

const LinkedInFeed = () => {
  useEffect(() => {
    // Dynamically load the Elfsight script if it hasn't been loaded yet
    if (!document.querySelector('script[src="https://elfsightcdn.com/platform.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://elfsightcdn.com/platform.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div className="w-full my-8">
      <div 
        className="elfsight-app-832a256a-ee32-4931-8c5b-17fcf27a77fb" 
        data-elfsight-app-lazy 
      ></div>
    </div>
  );
};

export default LinkedInFeed;
