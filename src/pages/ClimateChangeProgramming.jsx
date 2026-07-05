import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const ClimateChangeProgramming = () => {
  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Integrated Programming for Climate Change"
        description="This is a comprehensive approach to addressing climate change by aligning various sectors and stakeholders."
      />
      <Header />

      {/* ── Page Title & Breadcrumb Banner ── */}
      <section className="bg-ecasi-green pt-28 pb-6 text-white text-center">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-xl md:text-2xl font-bold uppercase tracking-wide leading-snug">
            Integrated Programming for Climate Change
          </h1>
          <div className="flex items-center justify-center gap-2 mt-3 text-xs md:text-sm text-white/80 font-medium">
            <Link to="/" className="text-white/80 hover:text-white transition-colors">Home</Link>
            <span className="text-white/40">/</span>
            <span className="text-white/80">Programmes</span>
            <span className="text-white/40">/</span>
            <span className="text-white/80">Climate Change Action</span>
            <span className="text-white/40">/</span>
            <span className="text-white font-semibold">Integrated Programming for Climate Change</span>
          </div>
        </div>
      </section>

      {/* ── Main Content Area ── */}
      <main className="max-w-[800px] mx-auto px-6 py-12 font-sans text-[#676767] leading-relaxed">
        {/* Centered Image */}
        <div className="mb-10 flex justify-center">
          <img
            src="https://ecasiafrica.org/wp-content/uploads/2025/05/IMG-20201212-WA0046-768x576.jpg"
            alt="Integrated Programming for Climate Change"
            className="w-full max-w-[650px] h-auto border border-gray-200 shadow-sm rounded-lg"
            onError={(e) => {
              e.target.src = "https://ecasiafrica.org/wp-content/uploads/2024/05/ecas-1.jpg";
            }}
          />
        </div>

        {/* Introductory Highlight Paragraph */}
        <p className="text-base md:text-lg text-[#008000] font-medium text-justify mb-10 leading-relaxed">
          This is a comprehensive approach to addressing climate change by aligning various sectors and stakeholders. We emphasize the need for coordinated efforts across national and county governments, the private sector, civil society, and local communities to implement adaptation and mitigation strategies. This involves integrating climate considerations into various development plans and projects, ensuring a unified approach to building resilience and reducing greenhouse gas emissions.
        </p>

        {/* Section Heading */}
        <h2 className="text-lg md:text-xl font-bold text-[#032e42] mb-6">
          Key Components and Principles:
        </h2>

        {/* Bullet List */}
        <ul className="space-y-6 list-disc pl-5 text-sm md:text-base text-justify">
          <li>
            <strong className="text-[#032e42]">National Climate Change Action Plan (NCCAP):</strong>
            <span className="ml-1">
              We support our partners towards the implementation of the NCCAP which serves as the overarching framework for Kenya’s climate action, outlining priority areas and actions for both adaptation and mitigation.
            </span>
          </li>
          <li>
            <strong className="text-[#032e42]">Vertical Integration:</strong>
            <span className="ml-1">
              we promote coordination and collaboration between national and county governments, ensuring consistent policies, plans, and implementation across different levels.
            </span>
          </li>
          <li>
            <strong className="text-[#032e42]">Cross-sectoral Collaboration:</strong>
            <span className="ml-1">
              We encourage collaboration between various sectors, including agriculture, energy, water, health, and infrastructure, to address climate change impacts holistically.
            </span>
          </li>
          <li>
            <strong className="text-[#032e42]">Community Participation:</strong>
            <span className="ml-1">
              we emphasize the involvement of local communities in the planning and implementation of climate actions, ensuring that interventions are context-specific and responsive to local needs.
            </span>
          </li>
          <li>
            <strong className="text-[#032e42]">Capacity Building and Knowledge Management:</strong>
            <span className="ml-1">
              we focus on strengthening institutional and human capacity to enhance access to climate information and training for all segments of the population.
            </span>
          </li>
          <li>
            <strong className="text-[#032e42]">Financing and Resource Mobilization:</strong>
            <span className="ml-1">
              We aim to mobilize financial resources to support climate action initiatives, including both domestic and international sources.
            </span>
          </li>
          <li>
            <strong className="text-[#032e42]">Measurement, Reporting, and Verification (MRV):</strong>
            <span className="ml-1">
              we aim to establish a robust MRV system to track progress, measure the effectiveness of interventions, and ensure accountability.
            </span>
          </li>
        </ul>
      </main>

      <Footer />
    </div>
  );
};

export default ClimateChangeProgramming;
