import SEO from '@/components/SEO';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageHeroBanner from '@/components/PageHeroBanner';
import { Wind } from 'lucide-react';
import { specialtiesData } from '@/data/specialtiesData';
import { sanitizeRichHtml } from '@/utils/htmlSanitizer';

const CleanAirProgramme = () => {
  const data = specialtiesData.find(s => s.id === 'clean-air-programme');

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SEO title="Air Quality Programme - ECASI AFRICA" description={data.shortDescription} />
      <Header />

      {/* Hero Section */}
      <PageHeroBanner
        title={data.title}
        image="/images/Gallery/breathe_cities_presentation.jpg"
        icon={Wind}
        breadcrumbs={[
          { label: 'Home', path: '/' },
          { label: 'Programmes', path: '/programmes' },
          { label: data.title },
        ]}
      />

      {/* Main Content */}
      <main className="flex-grow py-12 md:py-16 bg-gradient-to-b from-gray-50/50 to-white">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10 mb-8">
            <div 
              className="prose prose-lg prose-green max-w-none text-gray-700
                prose-headings:text-ecasi-navy prose-headings:font-bold
                prose-a:text-ecasi-green prose-a:no-underline hover:prose-a:underline
                prose-img:rounded-xl prose-img:shadow-md
                prose-li:marker:text-ecasi-green
                prose-strong:text-ecasi-navy"
              dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(data.fullDescription) }}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CleanAirProgramme;
