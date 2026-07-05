import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const GhgInventories = () => {
  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="GHG inventories, emission database management and systems for collecting, managing and utilizing activity data and emission factors"
        description="Our Greenhouse Gas (GHG) Inventory programme for climate change promotes systems for quantifying a nation's emissions and removals of greenhouse gases, crucial for tracking progress towards climate goals."
      />
      <Header />

      {/* ── Page Title & Breadcrumb Banner ── */}
      <section className="bg-ecasi-green pt-28 pb-6 text-white text-center">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-xl md:text-2xl font-bold uppercase tracking-wide leading-snug max-w-4xl mx-auto">
            GHG inventories, emission database management and systems for collecting, managing and utilizing activity data and emission factors
          </h1>
          <div className="flex items-center justify-center gap-2 mt-3 text-xs md:text-sm text-white/80 font-medium">
            <Link to="/" className="text-white/80 hover:text-white transition-colors">Home</Link>
            <span className="text-white/40">/</span>
            <span className="text-white/80">Programmes</span>
            <span className="text-white/40">/</span>
            <span className="text-white/80">Climate Change Action</span>
            <span className="text-white/40">/</span>
            <span className="text-white font-semibold">GHG Inventories</span>
          </div>
        </div>
      </section>

      {/* ── Main Content Area ── */}
      <main className="max-w-[800px] mx-auto px-6 py-12 font-sans text-[#676767] leading-relaxed">
        {/* Centered Image */}
        <div className="mb-10 flex justify-center">
          <img
            src="https://ecasiafrica.org/wp-content/uploads/2025/05/6Dec23-UNEA-6-Briefing-website-aspect-ratio-2000-1200-1024x614-1-768x461.jpg"
            alt="UNEA-6 Briefing"
            className="w-full max-w-[650px] h-auto border border-gray-200 shadow-sm rounded-lg"
            onError={(e) => {
              e.target.src = "https://ecasiafrica.org/wp-content/uploads/2024/05/ecas-1.jpg";
            }}
          />
        </div>

        {/* Introductory Paragraph */}
        <p className="text-sm md:text-base mb-10 text-justify font-medium text-[#032e42]">
          Our Greenhouse Gas (GHG) Inventory programme for climate change promotes systems for quantifying a nation's emissions and removals of greenhouse gases, crucial for tracking progress towards climate goals. We employ Intergovernmental Panel on Climate Change (IPCC) methodological guidance. These inventories are essential for informed decision-making, policy development, and measuring the effectiveness of climate change mitigation efforts.
        </p>

        {/* Section Heading */}
        <h2 className="text-lg md:text-xl font-bold text-[#032e42] mb-6 border-b pb-2">
          Key Components and Processes:
        </h2>

        {/* Bullet List of Aspects */}
        <ul className="space-y-6 list-disc pl-5 text-sm md:text-base">
          <li>
            <strong className="text-[#032e42]">Capacity Building:</strong>
            <span className="ml-1">
              We deliver training programs, like the UNFCCC-GIR-CASTT program, in support of developing countries in building capacity for accurate and robust GHG inventory development and reporting.
            </span>
          </li>
          <li>
            <strong className="text-[#032e42]">IPCC Methodologies:</strong>
            <span className="ml-1">
              We promote the IPCC’s National Greenhouse Gas Inventories Programme (NGGIP) and methodologies for estimating GHG emissions and removals in developing countries.
            </span>
          </li>
          <li>
            <strong className="text-[#032e42]">Reporting under the UNFCCC:</strong>
            <span className="ml-1">
              We support developing countries, as parties to the UNFCCC, obligated to report their national GHG inventories, to track progress towards their climate commitments under the Paris Agreement.
            </span>
          </li>
          <li>
            <strong className="text-[#032e42]">Inventory Development:</strong>
            <span className="ml-1">
              we assist countries in identifying emission sources, selecting appropriate methodologies from the IPCC guidelines, collecting data, and calculating emissions and removals.
            </span>
          </li>
          <li>
            <strong className="text-[#032e42]">Expert Review:</strong>
            <span className="ml-1">
              We contribute to the UNFCCC expert reviews of national GHG inventories, providing feedback and promoting continuous improvement.
            </span>
          </li>
          <li>
            <strong className="text-[#032e42]">Biennial Update Reports (BURs):</strong>
            <span className="ml-1">
              We assist developing countries in preparing their BURs submissions to the UNFCCC, which include national GHG inventories, mitigation actions, and information on climate support needs.
            </span>
          </li>
        </ul>
      </main>

      <Footer />
    </div>
  );
};

export default GhgInventories;
