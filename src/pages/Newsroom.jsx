import { Link } from 'react-router-dom';
import { Calendar, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { newsItems } from '@/data/newsData';

import SEO from '@/components/SEO';

const Newsroom = () => {
  const featuredNews = newsItems.find(item => item.featured);
  const regularNews = newsItems.filter(item => !item.featured);

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Newsroom"
        description="Latest news, updates, events, and research insights from ECAS Institute (ECASI Africa). Stay informed about our sustainable development impact."
      />
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-[500px] flex items-center">
        <div className="absolute inset-0 w-full h-full">
          <img 
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80" 
            alt="Newsroom" 
            fetchPriority="high"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-teal-900/80 via-teal-800/60 to-transparent mix-blend-multiply" />
          <div className="absolute inset-0 bg-black/10" />
        </div>

        <div className="healthcare-container relative z-10 py-20">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6 leading-tight animate-slide-up drop-shadow-lg">
              Newsroom
            </h1>
            <p className="text-lg md:text-xl text-white mb-8 border-l-4 border-teal-300 pl-4 animate-slide-up drop-shadow-md" style={{ animationDelay: '0.1s' }}>
              Latest news, announcements, and developments from Environmental Capacities and Sustainability (ECAS) Institute.
            </p>
          </div>
        </div>
      </section>

      {/* Featured News */}
      {featuredNews && (
        <section className="healthcare-section">
          <div className="healthcare-container">
            <div className="bg-accent rounded-2xl overflow-hidden shadow-healthcare">
              <div className="grid lg:grid-cols-2">
                <div className="aspect-video lg:h-auto relative overflow-hidden group">
                  <img 
                    src={featuredNews.image} 
                    alt={featuredNews.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                </div>
                <div className="p-8 md:p-12 flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                      {featuredNews.category}
                    </span>
                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {featuredNews.date}
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-4">
                    {featuredNews.title}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    {featuredNews.excerpt}
                  </p>
                  <Link to={`/news/${featuredNews.id}`}>
                    <Button variant="healthcare">
                      Read Full Story
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* News Grid */}
      <section className="healthcare-section bg-muted/50">
        <div className="healthcare-container">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-2xl font-serif font-bold text-foreground">Latest News</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">All</Button>
              <Button variant="ghost" size="sm">Announcements</Button>
              <Button variant="ghost" size="sm">Research</Button>
              <Button variant="ghost" size="sm">Community</Button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularNews.map((item, index) => (
              <article key={index} className="healthcare-card group cursor-pointer flex flex-col h-full">
                <div className="aspect-video bg-accent rounded-lg mb-5 overflow-hidden">
                   <img src={item.image} alt={item.title} loading="eager" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-2 py-1 bg-accent text-accent-foreground text-xs font-medium rounded">
                    {item.category}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {item.date}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                  <Link to={`/news/${item.id}`}>
                    {item.title}
                  </Link>
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-3 flex-grow">
                  {item.excerpt}
                </p>
                <Link to={`/news/${item.id}`} className="text-primary text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all mt-auto">
                  Read More <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Load More Articles
            </Button>
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="healthcare-section">
        <div className="healthcare-container">
          <div className="bg-primary rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-primary-foreground mb-4">
              Stay Informed
            </h2>
            <p className="text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
              Subscribe to our newsletter for the latest environmental news, policy updates, and insights 
              from ECAS Institute.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-1 h-12 px-4 rounded-lg border-0 focus:ring-2 focus:ring-primary-foreground/20"
              />
              <Button variant="hero" size="lg">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Newsroom;
