import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { newsItems } from '@/data/newsData';
import { eventsData } from '@/data/eventsData';

import SEO from '@/components/SEO';

const Newsroom = () => {
  const regularNews = newsItems.filter(item => !item.featured);

  const [liveNews, setLiveNews] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Newsletter state
  const [email, setEmail] = useState("");
  const [subStatus, setSubStatus] = useState({ loading: false, message: "", type: "" });

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;

    setSubStatus({ loading: true, message: "", type: "" });
    
    try {
      if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
         await new Promise(resolve => setTimeout(resolve, 1000));
         setSubStatus({ loading: false, message: "Simulated success! (PHP disabled locally)", type: "success" });
         setEmail("");
         return;
      }

      const res = await fetch('/api/subscribe.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setSubStatus({ loading: false, message: data.message || "Thanks for subscribing!", type: "success" });
        setEmail("");
      } else {
        setSubStatus({ loading: false, message: data.message || "Something went wrong.", type: "error" });
      }
    } catch (err) {
      console.error("Subscription error:", err);
      setSubStatus({ loading: false, message: "Subscription feature requires the live PHP server.", type: "error" });
    }
  };

  useEffect(() => {
    const fetchLiveNews = async () => {
      try {
        setIsLoading(true);
        const apiKey = import.meta.env.VITE_NEWS_API_KEY;
        
        // If API key is available, use NewsAPI
        if (apiKey && apiKey !== 'your_news_api_key_here') {
          let queryStr = '';
          if (selectedCategory === "All") {
            queryStr = '"Africa" AND ("environment" OR "sustainability" OR "climate" OR "policy" OR "conservation")';
          } else if (selectedCategory === "Global Policy") {
            queryStr = '"Africa" AND ("policy" OR "governance" OR "agreement" OR "treaty")';
          } else if (selectedCategory === "Sustainability") {
            queryStr = '"Africa" AND ("sustainability" OR "renewable" OR "green" OR "energy")';
          } else if (selectedCategory === "Conservation") {
            queryStr = '"Africa" AND ("conservation" OR "wildlife" OR "biodiversity" OR "forest")';
          }

          const query = encodeURIComponent(queryStr);
          const res = await fetch(`https://newsapi.org/v2/everything?q=${query}&sortBy=publishedAt&language=en&pageSize=6&page=${page}&apiKey=${apiKey}`);
          const data = await res.json();
          
          if (data.status === 'ok' && data.articles) {
            const fallBackImages = [
              "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80",
              "https://images.unsplash.com/photo-1509391366360-1e97f52ce23b?auto=format&fit=crop&q=80",
              "https://images.unsplash.com/photo-1483683804023-6ccdb62f86ef?auto=format&fit=crop&q=80",
              "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&q=80",
              "https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&q=80",
              "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80"
            ];
            
            const formattedNews = data.articles.map((item, index) => ({
              id: `live-${page}-${index}`,
              title: item.title,
              excerpt: (item.description || '').replace(/<[^>]+>/g, '').slice(0, 120) + '...',
              category: item.source?.name || "Global News",
              date: new Date(item.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
              image: item.urlToImage || fallBackImages[index % fallBackImages.length],
              link: item.url
            }));
            
            if (page === 1) {
              setLiveNews(formattedNews);
            } else {
              setLiveNews(prev => {
                const existingUrls = new Set(prev.map(n => n.link));
                const newItems = formattedNews.filter(n => !existingUrls.has(n.link));
                return [...prev, ...newItems];
              });
            }
            
            setHasMore(data.articles.length === 6 && data.totalResults > page * 6);
          } else {
            console.error("NewsAPI Error:", data.message);
            if (data.code === 'maximumResultsReached') {
               setHasMore(false);
            }
          }
        } else {
          console.warn("NewsAPI key is missing. Please set VITE_NEWS_API_KEY in your .env file.");
        }
      } catch (error) {
        console.error("Failed to fetch live news:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLiveNews();
  }, [selectedCategory, page]);

  const filteredRegularNews = selectedCategory === "All" 
    ? regularNews 
    : regularNews.filter(item => item.category === selectedCategory);
  const displayNews = liveNews.length > 0 ? liveNews : filteredRegularNews;

  const currentFeaturedNews = displayNews.length > 0 ? displayNews[0] : null;
  const currentGridNews = displayNews.length > 1 ? displayNews.slice(1) : [];

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const processedEvents = eventsData.map(ev => {
    const eventDate = new Date(ev.date);
    return {
      ...ev,
      isPast: eventDate < now,
      dateObj: eventDate
    };
  }).sort((a, b) => {
    if (a.isPast !== b.isPast) return a.isPast ? 1 : -1;
    if (!a.isPast) return a.dateObj - b.dateObj;
    return b.dateObj - a.dateObj;
  });

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Newsroom"
        description="Latest news, updates, events, and research insights from ECAS Institute (ECASI Africa). Stay informed about our sustainable development impact."
      />
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center text-center overflow-hidden">
        <div className="absolute inset-0 w-full h-full">
          <img 
            src="https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&q=80" 
            alt="Nature landscape" 
            fetchPriority="high"
            className="w-full h-full object-cover transform scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
        </div>

        <div className="healthcare-container relative z-10 pt-32 pb-32">
          <div className="max-w-4xl mx-auto backdrop-blur-sm bg-black/20 p-8 md:p-12 rounded-[2.5rem] border border-white/10 shadow-2xl">
            <span className="inline-block py-1.5 px-4 rounded-full bg-primary/20 text-primary-200 backdrop-blur-md border border-primary/30 text-xs font-bold tracking-widest uppercase mb-6">
              ECASI Media Center
            </span>
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 leading-tight tracking-tight">
              Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-emerald-200 drop-shadow-sm">Newsroom</span>
            </h1>
            <p className="text-lg md:text-2xl text-white/90 font-light max-w-2xl mx-auto leading-relaxed">
              Latest insights, policy developments, and announcements from Environmental Capacities and Sustainability Institute.
            </p>
          </div>
        </div>
      </section>

      {/* Featured News */}
      {currentFeaturedNews && (
        <section className="relative z-20 -mt-24 mb-16 px-4">
          <div className="healthcare-container">
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
              <div className="grid lg:grid-cols-2 group">
                <div className="aspect-[4/3] lg:aspect-auto relative overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img 
                    src={currentFeaturedNews.image} 
                    alt={currentFeaturedNews.title} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                  <div className="absolute top-6 left-6 flex flex-wrap gap-2">
                    <span className="px-4 py-1.5 bg-white/95 backdrop-blur-md text-primary font-bold text-xs uppercase tracking-wider rounded-full shadow-sm">
                      Featured
                    </span>
                    <span className="px-4 py-1.5 bg-black/60 backdrop-blur-md text-white font-medium text-xs rounded-full shadow-sm">
                      {currentFeaturedNews.category}
                    </span>
                  </div>
                </div>
                <div className="p-8 md:p-14 flex flex-col justify-center bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium">
                    <Calendar className="h-4 w-4 text-primary" />
                    {currentFeaturedNews.date}
                  </div>
                  <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 dark:text-white mb-6 leading-tight group-hover:text-primary transition-colors">
                    {currentFeaturedNews.title}
                  </h2>
                  <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed mb-8">
                    {currentFeaturedNews.excerpt}
                  </p>
                  <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800">
                    {currentFeaturedNews.link ? (
                      <a href={currentFeaturedNews.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-bold text-primary hover:text-primary/80 transition-colors group/link">
                        Read Full Story <ArrowRight className="h-5 w-5 transform group-hover/link:translate-x-1 transition-transform" />
                      </a>
                    ) : (
                      <Link to={`/news/${currentFeaturedNews.id}`} className="inline-flex items-center gap-2 font-bold text-primary hover:text-primary/80 transition-colors group/link">
                        Read Full Story <ArrowRight className="h-5 w-5 transform group-hover/link:translate-x-1 transition-transform" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* News Grid */}
      <section className="py-16 md:py-24 bg-slate-50 dark:bg-slate-950/50">
        <div className="healthcare-container">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
            <div>
               <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 dark:text-white">Latest Headlines</h2>
               <p className="text-slate-500 dark:text-slate-400 mt-3 text-lg">Filter news by our core strategic areas</p>
            </div>
            <div className="flex flex-wrap gap-2 p-1.5 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
              {['All', 'Global Policy', 'Sustainability', 'Conservation'].map((cat) => (
                <button 
                  key={cat}
                  className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                    selectedCategory === cat 
                      ? "bg-slate-100 dark:bg-slate-800 text-primary shadow-sm" 
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  }`}
                  onClick={() => {
                    if (selectedCategory !== cat) {
                      setSelectedCategory(cat);
                      setPage(1);
                      setHasMore(true);
                    }
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentGridNews.map((item, index) => (
              <article key={index} className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-100 dark:border-slate-800 transition-all duration-300 group flex flex-col h-full hover:-translate-y-1">
                <div className="aspect-[16/10] bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                   <img src={item.image} alt={item.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                   <div className="absolute top-4 left-4">
                     <span className="px-3 py-1.5 bg-white/95 backdrop-blur-sm text-slate-800 text-xs font-bold uppercase tracking-wider rounded-md shadow-sm">
                       {item.category}
                     </span>
                   </div>
                </div>
                <div className="p-6 md:p-8 flex flex-col flex-grow">
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium mb-4">
                    <Calendar className="h-3.5 w-3.5" />
                    {item.date}
                  </div>
                  <h3 className="text-xl font-serif font-bold text-slate-900 dark:text-white mb-3 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                    {item.link ? (
                      <a href={item.link} target="_blank" rel="noopener noreferrer">{item.title}</a>
                    ) : (
                      <Link to={`/news/${item.id}`}>{item.title}</Link>
                    )}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6 line-clamp-3">
                    {item.excerpt}
                  </p>
                  <div className="mt-auto pt-5 border-t border-slate-50 dark:border-slate-800/50">
                    {item.link ? (
                      <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-primary text-sm font-bold flex items-center gap-2 group-hover:gap-3 transition-all">
                        Read Article <ArrowRight className="h-4 w-4" />
                      </a>
                    ) : (
                      <Link to={`/news/${item.id}`} className="text-primary text-sm font-bold flex items-center gap-2 group-hover:gap-3 transition-all">
                        Read Article <ArrowRight className="h-4 w-4" />
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>

          {hasMore && (
            <div className="text-center mt-16">
              <Button 
                variant="outline" 
                size="lg" 
                className="rounded-full px-8 font-semibold border-slate-200 hover:bg-slate-50"
                onClick={() => setPage(p => p + 1)}
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "Load More Articles"}
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-16 md:py-24 bg-white dark:bg-slate-900">
        <div className="healthcare-container">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 dark:text-white">Events & Programs</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {processedEvents.map((ev, i) => (
              <div key={i} className={`relative bg-white dark:bg-slate-950 rounded-[1.5rem] p-6 border transition-all duration-300 hover:shadow-xl ${ev.isPast ? 'border-slate-100 dark:border-slate-800 opacity-80' : 'border-primary/20 shadow-sm hover:border-primary/40 hover:-translate-y-1'}`}>
                <div className="flex items-start justify-between mb-5">
                  <div className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide ${ev.isPast ? 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400' : 'bg-primary/10 text-primary'}`}>
                    {ev.type}
                  </div>
                  {ev.isPast && (
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border border-red-200 bg-red-50 text-red-600 uppercase tracking-wider">
                      Past
                    </span>
                  )}
                </div>
                <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-3 leading-snug">
                  {ev.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 line-clamp-2 leading-relaxed">
                  {ev.desc}
                </p>
                <div className="space-y-3 mt-auto bg-slate-50 dark:bg-slate-900 p-4 rounded-[1rem] border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                    <div className="bg-white dark:bg-slate-800 p-2 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700"><Calendar size={14} className="text-primary" /></div>
                    <span className="font-medium">{new Date(ev.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                    <div className="bg-white dark:bg-slate-800 p-2 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700"><MapPin size={14} className="text-primary" /></div>
                    <span className="font-medium">{ev.venue}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 md:py-24 bg-slate-50 dark:bg-slate-950/50">
        <div className="healthcare-container">
          <div className="relative bg-primary rounded-[2.5rem] p-10 md:p-16 text-center overflow-hidden shadow-2xl">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-64 h-64 bg-black/10 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary-foreground mb-4">
                Stay Informed
              </h2>
              <p className="text-primary-foreground/90 mb-10 max-w-2xl mx-auto text-lg leading-relaxed">
                Subscribe to our newsletter for the latest environmental news, policy updates, and insights 
                from ECAS Institute.
              </p>
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto bg-white/10 p-2 rounded-2xl backdrop-blur-sm border border-white/20">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={subStatus.loading}
                  required
                  placeholder="Enter your email address..." 
                  className="flex-1 h-12 px-6 rounded-xl bg-white text-slate-900 border-0 focus:ring-2 focus:ring-primary/50 placeholder:text-slate-400 font-medium outline-none disabled:opacity-50"
                />
                <Button type="submit" variant="hero" size="lg" disabled={subStatus.loading} className="rounded-xl h-12 px-8 font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50">
                  {subStatus.loading ? "..." : "Subscribe"}
                </Button>
              </form>
              {subStatus.message && (
                <div className={`mt-6 text-sm font-bold p-3 rounded-lg backdrop-blur-md max-w-lg mx-auto border ${subStatus.type === 'success' ? 'bg-green-500/20 text-green-100 border-green-500/30' : 'bg-red-500/20 text-red-100 border-red-500/30'}`}>
                  {subStatus.message}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Newsroom;
