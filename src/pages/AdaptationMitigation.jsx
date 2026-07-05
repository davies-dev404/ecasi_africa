import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const AdaptationMitigation = () => {
  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Adaptation and Mitigation Assessments"
        description="Climate change adaptation and mitigation assessments are crucial for addressing the impacts of a changing climate."
      />
      <Header />

      {/* ── Page Title & Breadcrumb Banner ── */}
      <section className="bg-ecasi-green pt-28 pb-6 text-white text-center">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-wide">
            Adaptation and Mitigation Assessments
          </h1>
          <div className="flex items-center justify-center gap-2 mt-2 text-xs md:text-sm text-white/80 font-medium">
            <Link to="/" className="text-white/80 hover:text-white transition-colors">Home</Link>
            <span className="text-white/40">/</span>
            <span className="text-white/80">Programmes</span>
            <span className="text-white/40">/</span>
            <span className="text-white/80">Climate Change Action</span>
            <span className="text-white/40">/</span>
            <span className="text-white font-semibold">Adaptation and Mitigation Assessments</span>
          </div>
        </div>
      </section>

      {/* ── Main Content Area ── */}
      <main className="max-w-[800px] mx-auto px-6 py-12 font-sans text-[#676767] leading-relaxed">
        {/* Introductory paragraph */}
        <p className="text-base md:text-lg text-[#008000] font-medium text-justify mb-10 leading-relaxed">
          Climate change adaptation and mitigation assessments are crucial for addressing the impacts of a changing climate. Adaptation focuses on adjusting to the effects of climate change, while mitigation aims to reduce greenhouse gas emissions and slow down climate change. These assessments help evaluate vulnerability, identify suitable actions, and prioritize efforts to build resilience and reduce risks.
        </p>

        {/* Centered Image */}
        <div className="mb-10 flex justify-center">
          <img
            src="https://ecasiafrica.org/wp-content/uploads/2025/05/hd-768x576.jpg"
            alt="Adaptation and Mitigation Assessments"
            className="w-full max-w-[650px] h-auto border border-gray-200 shadow-sm rounded-lg"
            onError={(e) => {
              e.target.src = "https://ecasiafrica.org/wp-content/uploads/2024/05/ecas-1.jpg";
            }}
          />
        </div>

        {/* Section 1: Adaptation */}
        <div className="mb-10">
          <h2 className="text-lg md:text-xl font-bold text-[#032e42] mb-6 leading-snug">
            1. We undertake measures to build capacity for vulnerability adaptation assessment, including:
          </h2>
          
          <ul className="space-y-4 list-disc pl-5 text-sm md:text-base text-justify">
            <li>Institutional strengthening by improving coordination mechanisms and establishing units or departments and enhancing availability of resources and tools for vulnerability assessment.</li>
            <li>Training individuals involved in vulnerability assessment, mobilizing climate finance for implementing adaptation policies and measures, and mainstreaming and upscaling climate change in sectoral and county development plans.</li>
            <li>Promoting education, research and awareness-raising through workshops and seminars to disseminate knowledge and share best practices in relation to assessing vulnerability and implementing adaptation measures.</li>
            <li>Integrating consideration of gender and youth into NAP policies and actions related to vulnerability and adaptation assessment.</li>
            <li>Promoting stakeholder engagement, inter alia, by providing training on participatory approaches, facilitating multi-stakeholder dialogues and incorporating local knowledge and perspectives into vulnerability and adaptation assessment.</li>
            <li>Enhancing knowledge on scenario planning techniques to enable assessment of future climate impacts and development of adaptation strategies at the institutional and individual level.</li>
            <li>Enhancing institutional capacity to collect, analyse and interpret data for vulnerability and adaptation assessment.</li>
          </ul>
        </div>

        {/* Section 2: Mitigation */}
        <div className="mb-10 border-t pt-8">
          <h2 className="text-lg md:text-xl font-bold text-[#032e42] mb-6 leading-snug">
            We support implementation of mitigation options in several sectors:
          </h2>
          
          <ul className="space-y-4 list-disc pl-5 text-sm md:text-base text-justify">
            <li>
              <strong>Agriculture</strong>, including providing climate-smart agriculture, adopting alternative livelihoods, promoting improved grasses and legumes for ruminant feeding, controlling nitrate use, extending analysis-based fertilizer use, establishing agriculture-based specialized organized industrial zones, and implementing land consolidation and environment-based agricultural land protection programmes.
            </li>
            <li>
              <strong>Energy</strong>, including providing alternative sources of energy, lobbying government to implement off-grid power supply for households, developing and scaling up alternative renewable energy programmes to diversify energy sources, upgrading existing technologies, transitioning to renewable energy sources like solar and wind power, and promoting sustainable practices.
            </li>
            <li>
              <strong>Transport</strong>, including implementing policies and measures to encourage modal shift to public transport, strengthening railway transport, blending ethanol and biodiesel in gasoline and diesel types respectively, and promoting use of electric and hybrid vehicles.
            </li>
            <li>
              <strong>Tourism Infrastructure</strong>, including increasing demand for green and climate resilient buildings, and increasing investment in the development of and promoting climate resilient infrastructure.
            </li>
            <li>
              <strong>Cross-Cutting</strong>, including implementing policies and measures for establishing an emissions trading system, implementing MRV of emissions, establishing a voluntary carbon market, encouraging eco-design and energy labelling, and promoting local climate change action plans.
            </li>
          </ul>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdaptationMitigation;
