import { useRef, useEffect, useState } from 'react';

const ScrollAnimation = ({ children, className = '', animation = 'slide-up', delay = 0 }) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.08, rootMargin: '60px' }
    );

    const currentRef = ref.current;
    if (currentRef) observer.observe(currentRef);
    return () => { if (currentRef) observer.unobserve(currentRef); };
  }, []);

  const getAnimationClass = () => {
    if (!isVisible) {
      switch (animation) {
        case 'slide-in-left': return 'opacity-0 -translate-x-8';
        case 'slide-in-right': return 'opacity-0 translate-x-8';
        case 'scale-in': return 'opacity-0 scale-95';
        case 'fade-in': return 'opacity-0';
        case 'slide-up':
        default: return 'opacity-0 translate-y-8';
      }
    }
    switch (animation) {
      case 'slide-in-left': return 'animate-slide-in-left opacity-100 translate-x-0';
      case 'slide-in-right': return 'animate-slide-in-right opacity-100 translate-x-0';
      case 'scale-in': return 'animate-scale-in opacity-100 scale-100';
      case 'fade-in': return 'animate-fade-in opacity-100';
      case 'slide-up':
      default: return 'animate-slide-up opacity-100 translate-y-0';
    }
  };

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${getAnimationClass()} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export default ScrollAnimation;
