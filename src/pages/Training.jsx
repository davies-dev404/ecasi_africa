import { GraduationCap } from 'lucide-react';
import SEO from '@/components/SEO';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageHeroBanner from '@/components/PageHeroBanner';

const Training = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SEO
        title="Training - ECASI AFRICA"
        description="ECASI Training"
      />
      <Header />

      {/* ── Page Title & Breadcrumb Banner ── */}
      <PageHeroBanner
        title="Training"
        image="/images/courses/executive_training.jpg"
        icon={GraduationCap}
        breadcrumbs={[
          { label: 'Home', path: '/' },
          { label: 'Training' },
        ]}
      />

      {/* ── Main Content ── */}
      <main className="flex-grow py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          {/* Content will be added later as requested by the user */}
          <div className="clear"></div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Training;
