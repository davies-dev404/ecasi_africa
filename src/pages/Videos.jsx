import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import ScrollAnimation from '@/components/ScrollAnimation';
import { Video as VideoIcon, Play, Calendar, ArrowLeft, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { dataService } from '@/lib/dataService';

const Videos = () => {
  const dummyData = dataService.getVideos();
  const [activeVideo, setActiveVideo] = useState(null);

  // Helper to parse YouTube video IDs and return autoplay embed URL
  const getYoutubeEmbedUrl = (url) => {
    if (!url) return '';
    let videoId = '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      videoId = match[2];
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : url;
  };

  const isYoutube = (url) => {
    if (!url) return false;
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <SEO
        title="Videos | ECASI Africa"
        description="Watch documentaries, webinars, and informational videos from ECAS Institute."
      />
      <Header />

      <section className="bg-ecasi-navy pt-20 pb-12 relative overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-4 relative z-10">
          <Link to="/resources" className="inline-flex items-center text-white/70 hover:text-white mb-6 transition-colors">
            <ArrowLeft size={16} className="mr-2" />
            Back to Resources
          </Link>
          <ScrollAnimation animation="fade-up">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-white/10 rounded-lg">
                <VideoIcon className="text-white" size={32} />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white">
                Videos
              </h1>
            </div>
            <p className="text-lg text-white/80 max-w-2xl leading-relaxed">
              Watch documentaries, recorded webinars, training sessions, and highlight reels from our various initiatives and events.
            </p>
          </ScrollAnimation>
        </div>
      </section>

      <section className="py-12 md:py-16 flex-grow">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {dummyData.map((item, index) => (
              <ScrollAnimation key={item.id} delay={index * 100} animation="fade-up">
                <div 
                  onClick={() => setActiveVideo(item)}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 group flex flex-col h-full cursor-pointer"
                >
                  <div className="h-56 overflow-hidden relative bg-gray-900 flex items-center justify-center group">
                    <img src={item.image || 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&q=80'} alt={item.title} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"/>
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                    <div className="relative z-10 w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/40 group-hover:bg-ecasi-green group-hover:border-transparent transition-all duration-300 transform group-hover:scale-110">
                      <Play className="text-white ml-1" size={24} fill="currentColor" />
                    </div>
                    <div className="absolute top-4 left-4 bg-ecasi-navy/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-white">
                      {item.type}
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center text-sm text-gray-500 mb-3 gap-2">
                      <Calendar size={14} />
                      <span>{item.date}</span>
                    </div>
                    <h3 className="text-xl font-bold text-ecasi-navy mb-2 group-hover:text-ecasi-green transition-colors">
                      {item.title}
                    </h3>
                  </div>
                </div>
              </ScrollAnimation>
            ))}
          </div>

          {dummyData.length === 0 && (
            <div className="text-center py-12 md:py-16 text-gray-400">
              <VideoIcon size={40} className="mx-auto mb-4 opacity-30" />
              <p className="text-lg">These videos are not currently available. Please check back later.</p>
            </div>
          )}

        </div>
      </section>

      {/* Video Lightbox Player Modal */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-950 border border-slate-900 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden relative shadow-2xl flex flex-col animate-scale-in">
            <div className="p-5 border-b border-slate-900 flex justify-between items-center text-white">
              <div>
                <span className="text-ecasi-green text-xs font-bold uppercase tracking-wider">{activeVideo.type}</span>
                <h3 className="font-bold text-lg mt-0.5">{activeVideo.title}</h3>
              </div>
              <button 
                onClick={() => setActiveVideo(null)} 
                className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-grow flex items-center justify-center bg-black aspect-video w-full max-h-[70vh]">
              {isYoutube(activeVideo.url) ? (
                <iframe 
                  src={getYoutubeEmbedUrl(activeVideo.url)}
                  title={activeVideo.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                  allowFullScreen
                />
              ) : (
                <video 
                  src={activeVideo.url} 
                  controls 
                  className="w-full h-full"
                  autoPlay
                />
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Videos;
