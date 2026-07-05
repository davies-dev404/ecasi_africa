import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const NationalCommunications = () => {
  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="National Communications"
        description="The National Communications (NC) Programme is an initiative to help African countries fulfill their reporting obligations under the UNFCCC."
      />
      <Header />

      {/* ── Page Title & Breadcrumb Banner ── */}
      <section className="bg-ecasi-green pt-28 pb-6 text-white text-center">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-xl md:text-2xl font-bold uppercase tracking-wide leading-snug">
            National Communications
          </h1>
          <div className="flex items-center justify-center gap-2 mt-3 text-xs md:text-sm text-white/80 font-medium">
            <Link to="/" className="text-white/80 hover:text-white transition-colors">Home</Link>
            <span className="text-white/40">/</span>
            <span className="text-white/80">Programmes</span>
            <span className="text-white/40">/</span>
            <span className="text-white/80">Climate Change Action</span>
            <span className="text-white/40">/</span>
            <span className="text-white font-semibold">National Communications</span>
          </div>
        </div>
      </section>

      {/* ── Main Content Area ── */}
      <main className="max-w-[800px] mx-auto px-6 py-12 font-sans text-[#676767] leading-relaxed">
        {/* Centered Image */}
        <div className="mb-10 flex justify-center">
          <img
            src="https://ecasiafrica.org/wp-content/uploads/2025/05/1717137016602-1024x545.jpg"
            alt="National Communications Workshop"
            className="w-full max-w-[650px] h-auto border border-gray-200 shadow-sm rounded-lg"
            onError={(e) => {
              e.target.src = "https://ecasiafrica.org/wp-content/uploads/2024/05/ecas-1.jpg";
            }}
          />
        </div>

        {/* Introductory Highlight Paragraphs */}
        <div className="space-y-4 mb-10 text-base md:text-lg text-[#008000] font-medium text-justify leading-relaxed">
          <p>
            The National Communications (NC) Programme is an initiative to help African countries fulfill their reporting obligations under the UNFCCC (United Nations Framework Convention on Climate Change). It provides support for developing and submitting National Communications, which are comprehensive reports detailing a country’s progress in addressing climate change. These reports include information on greenhouse gas inventories, Nationally Determined Contributions (NDCs), climate change impacts, adaptation strategies, and the support received or needed.
          </p>
          <p>
            The UNFCCC requires all Parties to submit National Communications, which serve as a key mechanism for transparency and accountability in climate action.
          </p>
        </div>

        {/* Section Heading */}
        <h2 className="text-lg md:text-xl font-bold text-[#032e42] mb-6">
          Components of this Programme
        </h2>

        {/* Supporting Partners text and list */}
        <div className="mb-8">
          <p className="text-sm md:text-base mb-4 font-semibold text-[#032e42]">
            Therefore, we support our partners to deliver the following:
          </p>
          <ul className="space-y-4 list-disc pl-5 text-sm md:text-base text-justify">
            <li>
              <strong className="text-[#032e42]">Support for Countries:</strong>
              <span className="ml-1">We provide financial and technical assistance to help countries prepare and submit their National Communications.</span>
            </li>
            <li>
              <strong className="text-[#032e42]">Capacity Building:</strong>
              <span className="ml-1">The program helps in building national capacity for climate change assessment, planning, and reporting.</span>
            </li>
            <li>
              <strong className="text-[#032e42]">Monitoring and Evaluation:</strong>
              <span className="ml-1">A unified monitoring and evaluation system is often used to track the progress of the program and the effectiveness of the support provided.</span>
            </li>
          </ul>
        </div>

        {/* Reports typical inclusions */}
        <div className="border-t pt-8">
          <p className="text-sm md:text-base mb-4 font-semibold text-[#032e42]">
            These reports typically include:
          </p>
          <ul className="space-y-4 list-disc pl-5 text-sm md:text-base text-justify">
            <li>
              <strong className="text-[#032e42]">Greenhouse Gas Inventory:</strong>
              <span className="ml-1">A detailed accounting of a country’s emissions and removals of greenhouse gases.</span>
            </li>
            <li>
              <strong className="text-[#032e42]">Nationally Determined Contributions (NDCs):</strong>
              <span className="ml-1">Information on the country’s commitments to reduce emissions and adapt to climate change impacts, as outlined in the Paris Agreement.</span>
            </li>
            <li>
              <strong className="text-[#032e42]">Climate Change Impacts and Adaptation:</strong>
              <span className="ml-1">Assessment of the climate change impacts already experienced and planned adaptation measures.</span>
            </li>
            <li>
              <strong className="text-[#032e42]">Support Received and Required:</strong>
              <span className="ml-1">Information on the financial, technological, and capacity-building support received or needed to implement climate actions.</span>
            </li>
          </ul>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NationalCommunications;
