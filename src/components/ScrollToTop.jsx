import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    const calculateScrollProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      setScrollProgress(scrollPercent);
    };

    window.addEventListener('scroll', toggleVisibility);
    window.addEventListener('scroll', calculateScrollProgress);

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
      window.removeEventListener('scroll', calculateScrollProgress);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // Circle properties
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference;

  return (
    <div 
      className={`fixed bottom-8 right-8 z-50 transition-all duration-500 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}
    >
      <button
        onClick={scrollToTop}
        className="relative flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-lg cursor-pointer group hover:-translate-y-1 transition-transform duration-300"
        aria-label="Scroll to top"
      >
        {/* Progress Circle Background */}
        <svg className="absolute w-full h-full -rotate-90 text-slate-200" viewBox="0 0 48 48">
           <circle
             cx="24"
             cy="24"
             r={radius}
             fill="none"
             stroke="currentColor"
             strokeWidth="3"
           />
        </svg>
        
        {/* Progress Circle Indicator */}
        <svg className="absolute w-full h-full -rotate-90 text-[#06b6d4]" viewBox="0 0 48 48">
           <circle
             cx="24"
             cy="24"
             r={radius}
             fill="none"
             stroke="currentColor"
             strokeWidth="3"
             strokeDasharray={circumference}
             strokeDashoffset={strokeDashoffset}
             strokeLinecap="round"
             className="transition-all duration-100 ease-out"
           />
        </svg>

        {/* Icon */}
        <ArrowUp className="w-5 h-5 text-[#06b6d4] group-hover:text-[#0891b2] transition-colors" />
      </button>
    </div>
  );
};

export default ScrollToTop;
