import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import ScrollAnimation from '@/components/ScrollAnimation';
import { Book, Download, Eye, Calendar, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const dummyData = [];

const Books = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <SEO
        title="Books | ECASI Africa"
        description="Browse our collection of published books covering key environmental and climate topics."
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
                <Book className="text-white" size={32} />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white">
                Books
              </h1>
            </div>
            <p className="text-lg text-white/80 max-w-2xl leading-relaxed">
              Browse our collection of published books, academic compilations, and handbooks authored by ECASI experts and partners.
            </p>
          </ScrollAnimation>
        </div>
      </section>

      <section className="py-20 flex-grow">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {dummyData.map((item, index) => (
              <ScrollAnimation key={item.id} delay={index * 100} animation="fade-up">
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 group flex flex-col h-full">
                  <div className="h-64 overflow-hidden relative bg-gray-100 p-6 flex items-center justify-center">
                    <img src={item.image} alt={item.title} className="max-h-full max-w-full object-cover shadow-lg transform group-hover:scale-105 transition-transform duration-500 rounded"/>
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="text-sm text-gray-500 mb-2 font-medium">
                      By {item.author}
                    </div>
                    <h3 className="text-xl font-bold text-ecasi-navy mb-4 group-hover:text-ecasi-green transition-colors">
                      {item.title}
                    </h3>
                    <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                      <button className="flex items-center text-sm font-semibold text-ecasi-green hover:text-ecasi-navy transition-colors">
                        <Eye size={16} className="mr-1.5" />
                        Preview
                      </button>
                      <button className="px-4 py-1.5 bg-gray-100 rounded-full text-xs font-semibold text-ecasi-navy hover:bg-ecasi-green hover:text-white transition-colors">
                        Get Copy
                      </button>
                    </div>
                  </div>
                </div>
              </ScrollAnimation>
            ))}
          </div>

          {dummyData.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              <Book size={40} className="mx-auto mb-4 opacity-30" />
              <p className="text-lg">These books are not currently available. Please check back later.</p>
            </div>
          )}

        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Books;
