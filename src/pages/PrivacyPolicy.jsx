import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ShieldCheck, FileText, Lock, UserCheck, Eye, Server, RefreshCw, Cookie } from 'lucide-react';

const PrivacyPolicy = () => {
  const sections = [
    {
      icon: ShieldCheck,
      title: "Data Collection",
      content: "We collect essential information including contact details, name, and email when you subscribe to our newsletters, register for training courses, or engage with our consultancy services. We may also collect anonymized usage data when you browse our site."
    },
    {
      icon: FileText,
      title: "Use of Information",
      content: "Your data is used to provide relevant environmental policy updates, course materials, newsletter distribution, and to improve our capacity building programs. We use data to tailor our research and advisory services."
    },
    {
      icon: Lock,
      title: "Data Security",
      content: "We implement industry-standard encryption, strict access controls, and regular security audits to protect your personal information from unauthorized access, ensuring the integrity of our platform."
    },
    {
      icon: Server,
      title: "Information Sharing",
      content: "We do not sell your personal information. We only share data with authorized third-party service providers who assist in our operations (such as email delivery), or when legally required by regional authorities."
    },
    {
      icon: UserCheck,
      title: "Your Rights",
      content: "You have the right to access, update, or delete your personal data. You can unsubscribe from our communications at any time. Contact us to exercise your data rights under applicable data protection laws."
    },
    {
      icon: Cookie,
      title: "Digital Privacy & Cookies",
      content: "Our website uses cookies and third-party tracking to enhance user experience and analyze traffic. By using our site, you consent to the use of cookies. You can manage your preferences through your browser settings."
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
              Privacy Policy
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8 border-l-4 border-ecasi-green pl-4 drop-shadow-md">
              Your privacy is our priority. ECASI AFRICA is committed to protecting your personal information with the highest standards of security and transparency.
            </p>
          </div>
        </div>
      </section>

      {/* Content Grid */}
      <main className="ecasi-container py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
          {sections.map((section, index) => (
            <div key={index} className="bg-card border border-border/50 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-ecasi-green/10 flex items-center justify-center text-ecasi-green mb-6 group-hover:scale-110 transition-transform">
                <section.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-serif font-bold text-ecasi-navy mb-4">
                {section.title}
              </h3>
              <p className="text-ecasi-body leading-relaxed">
                {section.content}
              </p>
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-16 bg-ecasi-section rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-2xl font-serif font-bold text-ecasi-navy mb-4">Questions about your privacy?</h2>
          <p className="text-ecasi-body mb-8 max-w-2xl mx-auto">
            If you have any questions or concerns about how we handle your data, please contact our team.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
             <div className="flex items-center gap-3 text-lg font-semibold text-ecasi-green">
                <ShieldCheck className="w-5 h-5" />
                <span>info@ecasiafrica.org</span>
             </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
