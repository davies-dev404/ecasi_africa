import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ScrollText, AlertTriangle, FileCheck, Scale, Info, Globe } from 'lucide-react';

const TermsOfService = () => {
  const sections = [
    {
      icon: ScrollText,
      title: "1. Acceptance of Terms",
      content: "By accessing and using the ECASI AFRICA website and our services, you agree to comply with and be bound by these Terms of Service. If you disagree with any part of these terms, please do not use our platform."
    },
    {
      icon: FileCheck,
      title: "2. Intellectual Property",
      content: "All content, including research papers, course materials, policy briefs, logos, and graphics, is the intellectual property of ECAS Institute unless otherwise stated. You may not reproduce, distribute, or commercially exploit this content without our explicit written permission."
    },
    {
      icon: AlertTriangle,
      title: "3. User Conduct",
      content: "Users agree to use our platform and services for lawful purposes only. Any behavior that disrupts the website, attempts to gain unauthorized access, or harasses other users is strictly prohibited and will result in immediate termination of access."
    },
    {
      icon: Info,
      title: "4. Training & Courses",
      content: "Enrollment in our capacity building programs and executive training is subject to specific course terms, including payment, cancellation, and refund policies provided at the time of registration. Certificates are awarded at the discretion of ECASI AFRICA upon successful completion."
    },
    {
      icon: Globe,
      title: "5. Third-Party Links",
      content: "Our website may contain links to third-party websites or services that are not owned or controlled by ECASI AFRICA. We assume no responsibility for the content, privacy policies, or practices of any third-party websites."
    },
    {
      icon: Scale,
      title: "6. Limitation of Liability",
      content: "ECASI AFRICA provides research and advisory services 'as is'. We shall not be liable for any indirect, incidental, special, or consequential damages resulting from the use or inability to use our services or the information provided on this platform."
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
              Terms of Service
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8 border-l-4 border-ecasi-green pl-4 drop-shadow-md">
              Please read these terms carefully. They outline the rules, guidelines, and agreements for using the ECASI AFRICA platform and services.
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

        <div className="mt-16 bg-ecasi-section rounded-2xl p-8 md:p-12 text-center">
          <p className="text-ecasi-body text-sm">
            Last Updated: January 2026. ECASI AFRICA reserves the right to modify these terms at any time. Continued use of the website constitutes acceptance of the new terms.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsOfService;
