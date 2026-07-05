import { useEffect } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Tag, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { newsItems } from '@/data/newsData';

const NewsDetail = () => {
  const { id } = useParams();
  const article = newsItems.find(item => item.id === id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!article) {
    return <Navigate to="/newsroom" replace />;
  }

  return (
    <div className="min-h-screen bg-background font-sans">
      <Header />

      {/* Hero / Header Section */}
      <div className="bg-[#1e3a8a] text-white pt-32 pb-20">
        <div className="healthcare-container">
           <Link to="/newsroom" className="inline-flex items-center text-teal-300 hover:text-white mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Newsroom
           </Link>
           
           <div className="flex flex-wrap items-center gap-4 text-sm font-medium mb-4 opacity-90">
              <span className="px-3 py-1 bg-white/20 rounded-full flex items-center gap-2">
                 <Tag className="w-3 h-3" />
                 {article.category}
              </span>
              <span className="flex items-center gap-2">
                 <Calendar className="w-4 h-4" />
                 {article.date}
              </span>
           </div>

           <h1 className="text-3xl md-5xl font-serif font-bold leading-tight max-w-4xl">
             {article.title}
           </h1>
        </div>
      </div>

      <main className="healthcare-container py-12">
         <div className="grid lg:grid-cols-3 gap-12">
            
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
               {/* Featured Image */}
               <div className="aspect-video rounded-2xl overflow-hidden shadow-healthcare-lg">
                  <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
               </div>

               {/* Article Body */}
               <div 
                  className="prose prose-lg max-w-none prose-headings-serif prose-headings-[#1e3a8a] prose-p-muted-foreground prose-a-primary"
                  dangerouslySetInnerHTML={{ __html: article.content }}
               />
               
               {/* Share Section (Placeholder) */}
               <div className="border-t border-border pt-8 mt-12 flex items-center justify-between">
                  <h4 className="font-serif font-bold text-lg">Share this article</h4>
                  <div className="flex gap-2">
                     <Button variant="outline" size="icon" className="rounded-full">
                        <Share2 className="w-4 h-4" />
                     </Button>
                  </div>
               </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-8">
               <div className="bg-muted/30 p-6 rounded-xl border border-border/50">
                  <h3 className="font-serif font-bold text-xl mb-4">Latest News</h3>
                  <div className="space-y-4">
                     {newsItems.filter(item => item.id !== article.id).slice(0, 3).map(item => (
                        <Link key={item.id} to={`/news/${item.id}`} className="block group">
                           <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-1">
                              {item.title}
                           </h4>
                           <span className="text-xs text-muted-foreground">{item.date}</span>
                        </Link>
                     ))}
                  </div>
               </div>
               
               <div className="bg-primary text-primary-foreground p-8 rounded-xl text-center">
                  <h3 className="font-serif font-bold text-xl mb-4">Stay Connected</h3>
                  <p className="opacity-90 mb-6 text-sm">Subscribe to our newsletter for the latest updates.</p>
                  <Button variant="secondary" className="w-full">Subscribe</Button>
               </div>
            </div>

         </div>
      </main>

      <Footer />
    </div>
  );
};

export default NewsDetail;
