import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ShieldCheck, FileText, Lock, UserCheck, Eye, Server, RefreshCw, Cookie } from 'lucide-react';

const PrivacyPolicy = () => {
  const sections = [
    {
      icon: ShieldCheck,
      title: "Data Collection",
      content: "We collect essential information including contact details, date of birth, and government ID. Crucially, we collect Protected Health Information (PHI) such as medical history, diagnoses, test results, and treatment plans necessary for your care."
    },
    {
      icon: FileText,
      title: "Use of Information",
      content: "Your data is used to provide medical treatment, process insurance claims, schedule appointments, and improve our healthcare services. We may de-identify data for medical research purposes with strict ethical oversight."
    },
    {
      icon: Lock,
      title: "Data Security",
      content: "We implement medical-grade encryption, strict access controls, and regular security audits to protect your personal and medical information from unauthorized access."
    },
    {
      icon: Server,
      title: "Information Sharing",
      content: "We share your PHI only with authorized specialists involved in your care, insurance providers for billing, reference laboratories for testing, or when legally required by health authorities."
    },
    {
      icon: UserCheck,
      title: "Your Rights",
      content: "You have the right to access your medical records, request corrections to errors, request a restriction on certain uses, and receive an accounting of disclosures. Contact our Privacy Officer to exercise these rights."
    },
    {
      icon: Cookie,
      title: "Digital Privacy",
      content: "Our website uses cookies to enhance user experience and analyze traffic. These track non-personal usage data and can be managed through your browser settings."
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
              Privacy Policy
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8 border-l-4 border-teal-300 pl-4 drop-shadow-md">
              Your privacy is our priority. We are committed to protecting your personal and health information with the highest standards of security and confidentiality.
            </p>
          </div>
        </div>
        <div className="absolute inset-0 bg-[#1e3a8a] opacity-90 mix-blend-overlay"></div>
      </section>

      {/* Content Grid */}
      <main className="healthcare-container py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
          {sections.map((section, index) => (
            <div key={index} className="bg-card border border-border/50 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                <section.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-serif font-bold text-[#1e3a8a] mb-4">
                {section.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {section.content}
              </p>
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-16 bg-muted/30 rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-2xl font-serif font-bold text-[#1e3a8a] mb-4">Questions about your privacy?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            If you have any questions or concerns about how we handle your data, please contact our Data Protection Officer.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
             <div className="flex items-center gap-3 text-lg font-semibold text-primary">
                <ShieldCheck className="w-5 h-5" />
                <span>privacy@HOPEspecialisthospital.org</span>
             </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
