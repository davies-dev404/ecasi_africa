import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const ResearchSystematicObservation = () => {
  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Research and Systematic Observation"
        description="This programme involves supporting and contributing to focused scientific research and continuous, standardized monitoring of the Earth’s climate system."
      />
      <Header />

      {/* ── Page Title & Breadcrumb Banner ── */}
      <section className="bg-ecasi-green pt-28 pb-6 text-white text-center">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-wide">
            Research and Systematic Observation
          </h1>
          <div className="flex items-center justify-center gap-2 mt-2 text-xs md:text-sm text-white/80 font-medium">
            <Link to="/" className="text-white/80 hover:text-white transition-colors">Home</Link>
            <span className="text-white/40">/</span>
            <span className="text-white/80">Programmes</span>
            <span className="text-white/40">/</span>
            <span className="text-white/80">Climate Change Action</span>
            <span className="text-white/40">/</span>
            <span className="text-white font-semibold">Research and Systematic Observation</span>
          </div>
        </div>
      </section>

      {/* ── Main Content Area ── */}
      <main className="max-w-[800px] mx-auto px-6 py-12 font-sans text-[#676767] leading-relaxed">
        {/* Centered Image */}
        <div className="mb-10 flex justify-center">
          <img
            src="https://ecasiafrica.org/wp-content/uploads/2025/08/57213763_2128957177158658_1134502275364945920_n-768x576.jpg"
            alt="Research and Systematic Observation"
            className="w-full max-w-[650px] h-auto border border-gray-100 shadow-sm"
            onError={(e) => {
              e.target.src = "https://ecasiafrica.org/wp-content/uploads/2024/05/ecas-1.jpg";
            }}
          />
        </div>

        {/* Introductory Paragraph with Highlight */}
        <p className="text-sm md:text-base mb-10 text-justify">
          This programme{" "}
          <mark className="bg-yellow-200 text-black px-1 font-medium">
            involves supporting and contributing to focused scientific research and continuous, standardized monitoring of the Earth’s climate system.
          </mark>{" "}
          This program is crucial for understanding climate change, its impacts, and for developing effective mitigation and adaptation strategies.
        </p>

        {/* Section Heading */}
        <h2 className="text-xl md:text-2xl font-bold text-ecasi-navy mb-6 font-serif border-b pb-2">
          Key Aspects of the Programme
        </h2>

        {/* Bullet List of Aspects */}
        <ul className="space-y-6 list-disc pl-5 text-sm md:text-base">
          <li>
            <strong className="text-ecasi-navy">Research:</strong>
            <p className="mt-1">
              This involves studying various aspects of climate change, including its causes, impacts, and potential solutions. Research areas include climate modeling, impacts on ecosystems and human societies, and the effectiveness of different mitigation and adaptation strategies.
            </p>
          </li>
          <li>
            <strong className="text-ecasi-navy">Systematic Observation:</strong>
            <p className="mt-1">
              This involves the continuous and standardized monitoring of the Earth’s climate system. This includes monitoring parameters like temperature, precipitation, greenhouse gas concentrations, sea levels, and ice cover. This data is essential for understanding climate trends and variability, and for validating climate models.
            </p>
          </li>
          <li>
            <strong className="text-ecasi-navy">Data Sharing and Management:</strong>
            <p className="mt-1">
              RSO programs emphasize the importance of free and open access to climate data and information. This facilitates collaboration, research, and the development of climate services.
            </p>
          </li>
          <li>
            <strong className="text-ecasi-navy">Capacity Building:</strong>
            <p className="mt-1">
              RSO programs also focus on building capacity in developing countries to participate in and benefit from climate research and observation efforts. This includes providing training, technology transfer, and financial support.
            </p>
          </li>
        </ul>
      </main>

      <Footer />
    </div>
  );
};

export default ResearchSystematicObservation;
