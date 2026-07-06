import { useState, useEffect } from 'react';
import { X, Cookie } from 'lucide-react';

const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already accepted cookies
    const cookieConsent = localStorage.getItem('ecasi_cookie_consent');
    if (!cookieConsent) {
      setIsVisible(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('ecasi_cookie_consent', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 transform transition-transform animate-slide-up">
      <div className="max-w-7xl mx-auto bg-white border border-gray-200 rounded-lg shadow-xl p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="bg-ecasi-green/10 p-2 rounded-full hidden sm:block flex-shrink-0">
            <Cookie className="w-6 h-6 text-ecasi-green" />
          </div>
          <div>
            <h3 className="text-ecasi-navy font-bold text-sm md:text-base mb-1">We value your privacy</h3>
            <p className="text-ecasi-body text-xs md:text-sm">
              We use cookies and third-party tools to enhance your browsing experience, analyze site traffic, and serve tailored content. 
              By clicking "Accept All", you consent to our use of cookies.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto justify-end flex-shrink-0">
          <button 
            onClick={() => setIsVisible(false)}
            className="text-gray-500 hover:text-gray-700 text-sm font-medium px-2 py-2"
          >
            Decline
          </button>
          <button 
            onClick={acceptCookies}
            className="bg-ecasi-green hover:bg-ecasi-navy text-white text-sm font-bold py-2 px-6 rounded transition-colors whitespace-nowrap"
          >
            Accept All
          </button>
          <button 
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-gray-600 md:hidden ml-2"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
