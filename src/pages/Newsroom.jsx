import { useState } from 'react';
import { Calendar, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { eventsData } from '@/data/eventsData';
import SEO from '@/components/SEO';

const Newsroom = () => {
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
        title="Events & Programs"
        description="Upcoming events, programs, and initiatives from ECAS Institute (ECASI Africa)."
      />
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-[50vh] flex items-center justify-center text-center overflow-hidden">
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
              ECASI
            </span>
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 leading-tight tracking-tight">
              Events & <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-emerald-200 drop-shadow-sm">Programs</span>
            </h1>
            <p className="text-lg md:text-2xl text-white/90 font-light max-w-2xl mx-auto leading-relaxed">
              Discover our latest events, training programs, and initiatives across Africa.
            </p>
          </div>
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
