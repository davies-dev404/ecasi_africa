import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { RefreshCw, Eye, Monitor, Keyboard, FileAudio, Hand } from 'lucide-react';

const Accessibility = () => {
  const features = [
    {
      icon: Eye,
      title: "Visual Accommodations",
      content: "We provide high-contrast modes, scalable typography without loss of functionality, and ensure all images and visual data have descriptive alt-text for screen readers."
    },
    {
      icon: Keyboard,
      title: "Keyboard Navigation",
      content: "Our entire platform is fully navigable using only a keyboard. Focus states are clearly defined so users always know where they are on the page."
    },
    {
      icon: Monitor,
      title: "Screen Reader Optimization",
      content: "We use semantic HTML5 and ARIA (Accessible Rich Internet Applications) landmarks to ensure our content is logically structured and easily interpreted by screen reading software."
    },
    {
      icon: FileAudio,
      title: "Multimedia Accessibility",
      content: "All video content related to our training and programs includes closed captions, and transcripts are provided for major audio and video publications."
    },
    {
      icon: Hand,
      title: "Motor & Cognitive Support",
      content: "We avoid complex interactions that require precise timing or movements. Our language is clear and concise, supporting users with cognitive disabilities."
    },
    {
      icon: RefreshCw,
      title: "Continuous Improvement",
      content: "We regularly audit our platform against WCAG 2.1 AA standards and actively incorporate user feedback to continuously improve our digital accessibility."
    }
  ];

  return (
    <div className="min-h-screen bg-background font-sans">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-20 bg-ecasi-navy text-white">
        <div className="ecasi-container relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 leading-tight drop-shadow-lg text-white">
              Accessibility Statement
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8 border-l-4 border-ecasi-green pl-4 drop-shadow-md">
              ECASI AFRICA is committed to digital inclusion. We strive to ensure our research, resources, and capacity building programs are accessible to everyone, regardless of ability or technology.
            </p>
          </div>
        </div>
      </section>

      {/* Content Grid */}
      <main className="ecasi-container py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-card border border-border/50 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-ecasi-green/10 flex items-center justify-center text-ecasi-green mb-6 group-hover:scale-110 transition-transform">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-serif font-bold text-ecasi-navy mb-4">
                {feature.title}
              </h3>
              <p className="text-ecasi-body leading-relaxed">
                {feature.content}
              </p>
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-16 bg-ecasi-section rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-2xl font-serif font-bold text-ecasi-navy mb-4">Need Accessibility Assistance?</h2>
          <p className="text-ecasi-body mb-8 max-w-2xl mx-auto">
            If you encounter any barriers while accessing our resources, please let us know. We are dedicated to providing alternative formats and resolving issues promptly.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
             <div className="flex items-center gap-3 text-lg font-semibold text-ecasi-green">
                <UniversalAccess className="w-5 h-5" />
                <span>info@ecasiafrica.org</span>
             </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Accessibility;
