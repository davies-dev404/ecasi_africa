import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { AlertTriangle, CheckCircle, Scale, Gavel, Users, Copyright, FileWarning, CreditCard } from 'lucide-react';

const TermsOfService = () => {
  const terms = [
    {
      icon: Scale,
      title: "Agreement to Terms",
      content: "By accessing our website and using our services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services. These terms apply to all visitors, users, and others who access the Service."
    },
    {
      icon: AlertTriangle,
      title: "Medical Disclaimer",
      content: "The content on this website is for informational purposes only and does not constitute medical advice, diagnosis, or treatment. Always seek the advice of your physician for any medical condition. In an emergency, call emergency services immediately."
    },
    {
      icon: Users,
      title: "User Conduct",
      content: "We expect all patients and visitors to treat others with respect. This includes keeping appointments, following agreed treatment plans, and showing respect to hospital staff and other patients. Abusive or discriminatory behavior will not be tolerated."
    },
    {
      icon: CreditCard,
      title: "Payment Terms",
      content: "Services are billable according to our current fee schedule. We accept most major insurance plans, but it is your responsibility to verify coverage. Co-payments and deductibles are due at the time of service."
    },
    {
      icon: Copyright,
      title: "Intellectual Property",
      content: "The content, features, and functionality, including distinct branding, logos, and structure of this website are the property of ECAS Institute and protected by copyright laws. You may not reproduce, distribute, or create derivative works without express written permission."
    },
    {
      icon: FileWarning,
      title: "Limitation of Liability",
      content: "In no event shall ECAS Institute be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of, or inability to use, our digital services or website content."
    },
    {
      icon: Gavel,
      title: "Termination",
      content: "We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms."
    },
    {
      icon: CheckCircle,
      title: "Governing Law",
      content: "These Terms shall be governed and construed in accordance with the laws of Kenya, without regard to its conflict of law provisions. Any disputes shall be resolved in the courts of Kenya."
    }
  ];

  return (
    <div className="min-h-screen bg-background font-sans">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-20 bg-[#1e3a8a] text-white">
        <div className="healthcare-container relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 leading-tight drop-shadow-lg">
              Terms of Service
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8 border-l-4 border-teal-300 pl-4 drop-shadow-md">
              Please read these terms carefully before using our services. They outline the rules and regulations for the use of ECAS Institute&apos;s Website and Services.
            </p>
          </div>
        </div>
        <div className="absolute inset-0 bg-[#1e3a8a] opacity-90 mix-blend-overlay"></div>
      </section>

      {/* Content Grid */}
      <main className="healthcare-container py-20">
        <div className="grid md:grid-cols-2 gap-8">
          {terms.map((term, index) => (
            <div key={index} className="bg-card border border-border/50 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                <term.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-serif font-bold text-[#1e3a8a] mb-4">
                {term.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {term.content}
              </p>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center text-sm text-muted-foreground">
            Last Updated: {new Date().toLocaleDateString()}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsOfService;
