import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import ScrollAnimation from '@/components/ScrollAnimation';
import { Search as SearchIcon, ArrowRight } from 'lucide-react';
import { searchData } from '@/data/searchData';

const Search = () => {
  const location = useLocation();
  const [results, setResults] = useState([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q') || '';
    setQuery(q);

    if (q.trim()) {
      const lowerQ = q.toLowerCase();
      const filtered = searchData.filter(
        item => item.title.toLowerCase().includes(lowerQ) || item.description.toLowerCase().includes(lowerQ)
      );
      setResults(filtered);
    } else {
      setResults([]);
    }
  }, [location.search]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <SEO title={`Search Results for "${query}" | ECASI Africa`} description="Search results" />
      <Header />

      <section className="bg-ecasi-navy pt-24 pb-16 relative overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-4 relative z-10">
          <ScrollAnimation animation="fade-up">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-white/10 rounded-lg">
                <SearchIcon className="text-white" size={32} />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white">
                Search Results
              </h1>
            </div>
            <p className="text-lg text-white/80 max-w-2xl leading-relaxed">
              Showing results for: <span className="font-semibold text-white">"{query}"</span>
            </p>
          </ScrollAnimation>
        </div>
      </section>

      <section className="py-20 flex-grow">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            {results.length > 0 ? (
              <div className="flex flex-col gap-6">
                {results.map((item, index) => (
                  <ScrollAnimation key={index} delay={index * 50} animation="fade-up">
                    <Link to={item.path} className="group block p-6 border border-gray-100 rounded-xl hover:border-ecasi-green hover:shadow-md transition-all">
                      <h3 className="text-xl font-bold text-ecasi-navy group-hover:text-ecasi-green transition-colors mb-2">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 mb-4">{item.description}</p>
                      <div className="flex items-center text-sm font-semibold text-ecasi-green">
                        View Page <ArrowRight size={16} className="ml-2 transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  </ScrollAnimation>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <SearchIcon size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-500 mb-2">No results found</h3>
                <p className="text-gray-400">We couldn't find anything matching "{query}". Please try a different search term.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Search;
