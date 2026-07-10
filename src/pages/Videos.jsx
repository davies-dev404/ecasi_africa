import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import ScrollAnimation from '@/components/ScrollAnimation';
import { Video as VideoIcon, Play, Calendar, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const dummyData = [];

const Videos = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <SEO
        title="Videos | ECASI Africa"
        description="Watch documentaries, webinars, and informational videos from ECAS Institute."
      />
      <Header />

      <section className="bg-ecasi-navy pt-24 pb-16 relative overflow-hidden">
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

      <section className="py-20 flex-grow">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {dummyData.map((item, index) => (
              <ScrollAnimation key={item.id} delay={index * 100} animation="fade-up">
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 group flex flex-col h-full cursor-pointer">
                  <div className="h-56 overflow-hidden relative bg-gray-900 flex items-center justify-center group">
                    <img src={item.image} alt={item.title} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"/>
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
            <div className="text-center py-20 text-gray-400">
              <VideoIcon size={40} className="mx-auto mb-4 opacity-30" />
              <p className="text-lg">These videos are not currently available. Please check back later.</p>
            </div>
          )}

        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Videos;
