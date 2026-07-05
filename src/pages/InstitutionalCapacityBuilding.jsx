import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const InstitutionalCapacityBuilding = () => {
  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Institutional capacity-building and Reskilling"
        description="Our institutional capacity-building and reskilling programme for climate change focuses on enhancing the ability of organizations and individuals to effectively address climate change challenges."
      />
      <Header />

      {/* ── Page Title & Breadcrumb Banner ── */}
      <section className="bg-ecasi-green pt-28 pb-6 text-white text-center">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-xl md:text-2xl font-bold uppercase tracking-wide leading-snug">
            Institutional capacity-building and Reskilling
          </h1>
          <div className="flex items-center justify-center gap-2 mt-3 text-xs md:text-sm text-white/80 font-medium">
            <Link to="/" className="text-white/80 hover:text-white transition-colors">Home</Link>
            <span className="text-white/40">/</span>
            <span className="text-white/80">Programmes</span>
            <span className="text-white/40">/</span>
            <span className="text-white/80">Climate Change Action</span>
            <span className="text-white/40">/</span>
            <span className="text-white font-semibold">Institutional capacity-building and Reskilling</span>
          </div>
        </div>
      </section>

      {/* ── Main Content Area ── */}
      <main className="max-w-[800px] mx-auto px-6 py-12 font-sans text-[#676767] leading-relaxed">
        {/* Centered Image */}
        <div className="mb-10 flex justify-center">
          <img
            src="https://ecasiafrica.org/wp-content/uploads/2025/05/IMG_20241112_163109285-768x512.jpg"
            alt="Institutional Capacity Building"
            className="w-full max-w-[650px] h-auto border border-gray-200 shadow-sm rounded-lg"
            onError={(e) => {
              e.target.src = "https://ecasiafrica.org/wp-content/uploads/2024/05/ecas-1.jpg";
            }}
          />
        </div>

        {/* Introductory Paragraph */}
        <p className="text-base md:text-lg text-[#008000] font-medium text-justify mb-10 leading-relaxed">
          Our institutional capacity-building and reskilling programme for climate change focuses on enhancing the ability of organizations and individuals to effectively address climate change challenges. This involves strengthening institutional frameworks, developing technical expertise, and fostering collaboration to implement climate policies and achieve climate goals. The programme is crucial for African countries, enabling them to adapt to climate impacts and fulfill their commitments under international agreements like the UNFCCC, UNSDGs, and Paris Agreement.
        </p>

        {/* Key Aspects Header */}
        <h2 className="text-lg md:text-xl font-bold text-[#032e42] mb-4">
          Key aspects of these programs include:
        </h2>

        {/* Key Aspects Numbered List */}
        <ol className="space-y-4 list-decimal pl-5 text-sm md:text-base mb-10">
          <li>
            <strong className="text-[#032e42]">Developing technical expertise:</strong> Training programs, workshops, and capacity-building initiatives are essential for building the skills and knowledge needed to address climate change.
          </li>
          <li>
            <strong className="text-[#032e42]">Strengthening institutional frameworks:</strong> This involves improving coordination and collaboration between government agencies, research institutions, and civil society organizations.
          </li>
          <li>
            <strong className="text-[#032e42]">Improving data collection and analysis:</strong> Investing in data management systems and analytical tools helps in understanding climate change impacts and developing evidence-based policies.
          </li>
          <li>
            <strong className="text-[#032e42]">Promoting knowledge-sharing and best practices:</strong> Facilitating exchange of knowledge and experiences between different actors enhances the effectiveness of climate action.
          </li>
          <li>
            <strong className="text-[#032e42]">Fostering collaboration and partnerships:</strong> Building strong partnerships between various stakeholders is crucial for successful climate action.
          </li>
        </ol>

        {/* Main Deliverables / Details Lettered List */}
        <ol className="space-y-4 list-[lower-alpha] pl-5 text-sm md:text-base border-t pt-8">
          <li>Strengthening coordination, collaboration and partnerships between government ministries, agencies and departments, as well as partnerships with research institutions, international organizations and civil society organizations, to enhance coordination efforts, knowledge-sharing and exchange of best practices and to leverage expertise and resources;</li>
          <li>Supporting the works of established institutions and bodies, such as ministries, departments and national focal points, to oversee the formulation and update of climate-related policies, coordinate activities and implement international climate agreements;</li>
          <li>Building technical expertise through training programmes, workshops and capacity-building initiatives to ensure that the necessary skills and knowledge for effectively addressing climate change challenges are developed;</li>
          <li>Improving capacity for data collection and analysis in order to better understand the impacts of climate change and develop evidence-based policies and measures by investing in data management systems, conducting research studies and using advanced analytical tools;</li>
          <li>Promoting public awareness and participation initiatives in order to build resilience through workshops, seminars and public consultations to educate the public about climate change and encourage active participation in mitigation and adaptation activities, as well as encouraging the integration of climate awareness and sustainability into decision making and action at all levels of society;</li>
          <li>Enhancing policy and regulatory frameworks that support institutional capacity-building for climate change mitigation and adaptation efforts by setting targets, establishing standards, creating incentives to encourage sustainable practices, and establishing clear roles and responsibilities within ministries, as well as providing the necessary resources and support for effective policy implementation;</li>
          <li>Establishing monitoring mechanisms to assess the effectiveness of institutional capacity-building efforts and to help in identifying areas for improvement in order to ensure effective resource allocation.</li>
          <li>Enhancing the knowledge and skills of institutions and individuals involved in climate change governance and management with regard to climate change science, policy implementation, international climate agreements, aligning national policies with global goals, and coordinating climate action across sectors and levels of government;</li>
          <li>Strengthening collaboration and coordination among government ministries and agencies, as well as non-governmental organizations, to ensure data provision and effective implementation of climate policies;</li>
          <li>Reinforcing institutional capacity-building in areas such as climate planning, project management, policy integration, accessing and managing financial resources for climate change initiatives and establishing long-term policies and strategies for sustainable development;</li>
        </ol>
      </main>

      <Footer />
    </div>
  );
};

export default InstitutionalCapacityBuilding;
