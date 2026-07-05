import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Accessibility as AccessibilityIcon, Laptop, MessageSquare, CheckSquare, Heart, Settings, Smartphone } from 'lucide-react';

const Accessibility = () => {
  const features = [
    {
      icon: CheckSquare,
      title: "WCAG 2.1 Compliance",
      content: "Our website follows the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA. These guidelines explain how to make web content more accessible for people with disabilities and user-friendly for everyone."
    },
    {
      icon: Laptop,
      title: "Accessible Design",
      content: "We use semantic HTML markup for screen readers, keyboard navigation support, and sufficient color contrast ratios to assist users with visual impairments."
    },
    {
      icon: Settings,
      title: "Assistive Technology",
      content: "Our site is compatible with assistive technologies, including screen readers (NVDA, JAWS, VoiceOver), screen magnifiers, and speech recognition software on Windows, macOS, and mobile platforms."
    },
    {
      icon: Smartphone,
      title: "Mobile Accessibility",
      content: "Our website is fully responsive and accessible on all devices—desktops, tablets, and mobile phones—allowing you to access our services wherever you are."
    },
    {
      icon: Heart,
      title: "Continuous Improvement",
      content: "We are committed to continuously improving accessibility. If you encounter any barriers, please let us know immediately."
    },
    {
      icon: MessageSquare,
      title: "Feedback Welcome",
      content: "Your feedback helps us improve. If you have suggestions or encounter accessibility issues, please contact our support team."
    }
  ];

  return (
    <div className="min-h-screen bg-background font-sans">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-20 bg-[#1e3a8a] text-white">
        <div className="healthcare-container relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 leading-tight drop-shadow-lg flex items-center gap-4">
              <AccessibilityIcon className="w-12 h-12 md:w-16 md:h-16" />
              Accessibility Statement
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8 border-l-4 border-teal-300 pl-4 drop-shadow-md">
              We believe that healthcare should be accessible to everyone. We are dedicated to making our digital presence inclusive and easy to use for all members of our community.
            </p>
          </div>
        </div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
      </section>

      {/* Content Grid */}
      <main className="healthcare-container py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-card border border-border/50 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-serif font-bold text-[#1e3a8a] mb-4">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.content}
              </p>
            </div>
          ))}
        </div>

        {/* Contact Strip */}
        <div className="mt-16 bg-accent rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold text-[#1e3a8a] mb-2">Need Accessibility Assistance?</h3>
            <p className="text-muted-foreground">Contact our support team for help with any access issues.</p>
          </div>
          <Link to="/contact" className="bg-primary text-white font-bold py-3 px-8 rounded-lg hover:bg-primary/90 transition-colors">
            Contact Support
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Accessibility;
