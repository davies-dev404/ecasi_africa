import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  GraduationCap, BookOpen, Megaphone, FileText, Users, Handshake,
  Download, Award, Users2, Brain, Leaf, Thermometer, ShieldAlert,
  Flame, Briefcase, Database, Landmark, Tractor, Trees, MessageSquare,
  ChevronDown, Quote, CheckCircle2, MapPin
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import ScrollAnimation from '@/components/ScrollAnimation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const components = [
  {
    icon: GraduationCap,
    title: "Training",
    text: "We will continue to work with our partners to provide targeted training to policymakers, decision-makers, businesses and other stakeholders to enhance their understanding of climate change and its relevance to various sectors. This also includes building the capacity of educators to effectively teach about climate change."
  },
  {
    icon: BookOpen,
    title: "Education",
    text: "We are working with partners such as Universities, Ministry of Environment, Ministry of Education, Parliament, Kenya Institute for Curriculum Development and the Kenya School of Governance among others to integrate climate change into curricula at all levels of formal education, from primary schools to universities. This includes developing comprehensive educational materials, such as lesson plans, videos, and infographics, to effectively communicate the science, causes, and impacts of climate change."
  },
  {
    icon: Megaphone,
    title: "Public Awareness",
    text: "we are conducting public outreach campaigns to raise awareness about climate change issues, promote sustainable practices, and encourage community engagement in climate action."
  },
  {
    icon: FileText,
    title: "Public Access to Information",
    text: "We work with the media to ensure that information about climate change is readily available and accessible to the public, empowering individuals to make informed decisions and participate in climate action."
  },
  {
    icon: Users,
    title: "Public Participation",
    text: "We are encouraging public participation in policy-making processes and the implementation of climate change policies, fostering a sense of ownership and responsibility."
  },
  {
    icon: Handshake,
    title: "International Cooperation",
    text: "We seek to foster collaboration and knowledge sharing among development partners, governments, organizations, and communities to accelerate climate action."
  }
];

const trainingAreas = [
  { icon: Leaf, label: "Environment" },
  { icon: Thermometer, label: "Climate Change" },
  { icon: Flame, label: "Energy" },
  { icon: ShieldAlert, label: "Human Resource and Safety" },
  { icon: Briefcase, label: "Business & Project Management" },
  { icon: Database, label: "Data, IT and AI trainings" },
  { icon: Landmark, label: "Leadership" },
  { icon: Tractor, label: "Agriculture" },
  { icon: Trees, label: "Forests & Biodiversity" },
  { icon: MessageSquare, label: "Communication" }
];

const methodologies = [
  "Competency-based curricula aligned with market needs",
  "Interactive formats including case studies, group work, and simulations",
  "Blended learning options",
  "Regular syllabus updates to incorporate emerging trends and technological changes",
  "Post-training evaluations to ensure continuous improvement",
  "Expert facilitators and trainers with real-world experience",
  "Peer learning and networking"
];

const audiences = [
  "Local, County, and National Government Officials",
  "Private Sector / SMEs / Businesses",
  "Media and Young Researchers",
  "Established Professionals",
  "Youths and Job Seekers",
  "CSO and NGO Representatives",
  "Community and Farmer Representatives"
];

const trainingsDone = [
  { task: "Training Care-Givers on VSLA as a climate change residence strategy", client: "Compassion International" },
  { task: "Technical TOT on Resilience & Livelihoods for ABLI-G Project Staff", client: "UNHCR - Garissa" },
  { task: "Carbon Markets and Nature-Based Solutions in Naivasha, Kenya", client: "NETFUND" },
  { task: "Climate Finance (Budgeting, Coding and Tracking) for Gambian Delegates", client: "Ministry of Finance - Gambia" },
  { task: "Masterclass in Carbon Markets & Emissions Trading in Nairobi, Kenya", client: "Stakeholders in Climate Change" },
  { task: "Climate Negotiation Training Workshop", client: "AYICC" },
  { task: "Training in Empowered Worldview Training for Climate Resilient Communities", client: "Christian Impact Mission" },
  { task: "Training in Climate Change Master Class (Adaptation, Mitigation, Finance)", client: "SNV and OXFAM" },
  { task: "Training of Young Climate Diplomats", client: "German Embassy in Kenya, Transparency International" },
  { task: "Environmental Management Systems", client: "University of Nairobi" }
];



const faqs = [
  {
    q: "What kind of training do you offer?",
    a: "We offer Professional training in management skills, technical training, energy management training, natural resources management, Sales and Customer care skills and other specialized areas."
  },
  {
    q: "Are your registered under the National Industrial Training Authority?",
    a: "Yes, we are."
  },
  {
    q: "Who delivers the training courses?",
    a: "Our training team is composed of well qualified trainers with over 10 years industry experience and a proven track record of delivering training to organizations in the private, public and NGO sectors."
  },
  {
    q: "When do the training courses take place?",
    a: "All our courses take place throughout the year as either Open House or In House respectively. See our course schedule in the course catalogue."
  },
  {
    q: "Can the course be tailored to my requirements?",
    a: "Absolutely, all our training courses can be customized in consultation with the trainees/participants. In addition, we can also combine elements of different workshops to create own unique course."
  },
  {
    q: "Do I get a certificate after the training?",
    a: "Yes, you get a Certificate of Participation."
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const TrainingEducation = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <SEO
        title="Training, Education & Public Awareness | ECASI Africa"
        description="Empowering individuals and communities with knowledge and skills to address climate change through formal education and targeted training."
      />
      <Header />

      {/* Green Banner Section */}
      <section className="bg-ecasi-green pt-28 pb-6 text-center text-white relative overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-4 relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 tracking-wide">
            Training, Education, and Public Awareness
          </h1>
          <div className="text-sm font-medium flex items-center justify-center gap-2 opacity-90">
            <Link to="/" className="hover:underline text-white">Home</Link>
            <span>&gt;</span>
            <span className="text-white/80">Training, Education, and Public Awareness</span>
          </div>
        </div>
      </section>

      {/* Main Content Body */}
      <section className="py-16 bg-white flex-grow">
        <div className="max-w-[1000px] mx-auto px-6">

          <ScrollAnimation animation="fade-up">
            <h2 className="text-2xl md:text-3xl font-bold text-[#5dade2] mb-6 text-center">
              Training, Education & Public Awareness (TEPA)
            </h2>

            <p className="text-gray-700 leading-relaxed text-base md:text-lg mb-10 text-justify">
              Our Training, Education, and Public Awareness (TEPA) program for climate change is a comprehensive approach to empower individuals and communities with the knowledge, skills, and motivation to address climate change. It encompasses various activities such as formal and non-formal education, public outreach, and capacity building through training. The ultimate goal is to foster behavioral changes, promote sustainable lifestyles, and encourage active participation in climate action.
            </p>
          </ScrollAnimation>

          {/* Key Components Section */}
          <ScrollAnimation animation="fade-up">
            <h3 className="text-2xl font-bold text-ecasi-navy mb-8 border-b pb-3">
              Key Components of a TEPA Program:
            </h3>
          </ScrollAnimation>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16"
          >
            {components.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-ecasi-green/30 transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="p-3 bg-ecasi-section rounded-xl text-ecasi-green group-hover:bg-ecasi-green group-hover:text-white transition-colors w-fit mb-4">
                      <Icon size={24} />
                    </div>
                    <h4 className="font-bold text-ecasi-navy text-lg mb-2">
                      {item.title}
                    </h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {item.text}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Classroom Image */}
          <ScrollAnimation animation="fade-up">
            <div className="mb-20">
              <img
                src="/images/courses/85079752_1227263344135855_2280708113273192448_n.jpg"
                alt="Training, Education & Public Awareness Session"
                className="w-full h-[400px] object-cover rounded-2xl shadow-lg border border-gray-100"
              />
              <p className="text-xs text-gray-500 mt-3 font-medium text-center">
                ECAS Institute capacity building workshop in progress
              </p>
            </div>
          </ScrollAnimation>

          {/* PDF Training Profile Integration Section */}
          <ScrollAnimation animation="fade-up">
            <div className="bg-gradient-to-br from-ecasi-navy to-ecasi-navy/90 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden mb-20">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-ecasi-green/10 rounded-full blur-2xl" />

              <div className="relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 border-b border-white/10 pb-6">
                  <div>
                    <span className="bg-ecasi-green text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2 inline-block">
                      Official Document
                    </span>
                    <h3 className="text-2xl md:text-3xl font-bold">
                      ECASI Training Profile
                    </h3>
                    <p className="text-white/80 text-sm mt-1">
                      Professional capacity development, coaching, and consulting services
                    </p>
                  </div>
                  <a
                    href="/pdfs/ECASI_Training_Profile.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="flex items-center gap-2 px-5 py-3 bg-ecasi-green hover:bg-white hover:text-ecasi-navy text-white font-bold rounded-xl transition-all shadow-md flex-shrink-0"
                  >
                    <Download size={18} />
                    Download Profile PDF
                  </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left Column: Key Training Areas */}
                  <div>
                    <h4 className="text-ecasi-green font-bold uppercase tracking-wider text-xs mb-4 flex items-center gap-2">
                      <Award size={16} />
                      Key Training Areas
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {trainingAreas.map((area, i) => {
                        const AreaIcon = area.icon;
                        return (
                          <div key={i} className="flex items-center gap-2 bg-white/5 rounded-lg p-2.5 hover:bg-white/10 transition-colors">
                            <AreaIcon size={14} className="text-ecasi-green flex-shrink-0" />
                            <span className="text-xs text-white/90 font-medium leading-tight">{area.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Column: methodology & registration */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-ecasi-green font-bold uppercase tracking-wider text-xs mb-3 flex items-center gap-2">
                        <Users2 size={16} />
                        Training Methodology
                      </h4>
                      <ul className="space-y-1.5 text-xs text-white/80 pl-4 list-disc">
                        {methodologies.slice(0, 5).map((method, idx) => (
                          <li key={idx}>{method}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                      <h5 className="font-bold text-sm text-white flex items-center gap-1.5">
                        <Award size={16} className="text-ecasi-green" />
                        NITA Registered Provider
                      </h5>
                      <p className="text-xs text-white/70 mt-1 leading-relaxed">
                        ECAS is recognized by the National Industrial Training Authority (NITA) as an official training provider and levy contributor.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Target Audience Section */}
                <div className="mt-8 pt-6 border-t border-white/10">
                  <h4 className="text-ecasi-green font-bold uppercase tracking-wider text-xs mb-3">
                    Target Audience
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {audiences.map((audience, i) => (
                      <span key={i} className="bg-white/10 text-white/90 text-xs px-3 py-1 rounded-full font-medium">
                        {audience}
                      </span>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </ScrollAnimation>

          {/* Trainings Done Table Section */}
          <ScrollAnimation animation="fade-up">
            <h3 className="text-2xl font-bold text-ecasi-navy mb-6">
              Selected Trainings Done [2014 - 2024]
            </h3>
            <div className="overflow-x-auto mb-20 bg-white rounded-2xl shadow-sm border border-gray-100">
              <table className="w-full text-sm text-left">
                <thead className="bg-ecasi-green text-white">
                  <tr>
                    <th className="px-6 py-4 font-semibold w-2/3">TASK</th>
                    <th className="px-6 py-4 font-semibold w-1/3 border-l border-white/20">CLIENT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {trainingsDone.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-gray-700 font-medium">{item.task}</td>
                      <td className="px-6 py-4 text-gray-500">{item.client}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ScrollAnimation>



          {/* FAQs Section */}
          <ScrollAnimation animation="fade-up">
            <h3 className="text-2xl font-bold text-ecasi-navy mb-8 text-center">
              Frequently Asked Questions
            </h3>
            <div className="max-w-[800px] mx-auto mb-20">
              <Accordion type="single" collapsible className="w-full space-y-4">
                {faqs.map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    className="bg-white border border-gray-100 rounded-xl px-6 shadow-sm data-[state=open]:border-ecasi-green/50 data-[state=open]:shadow-md transition-all"
                  >
                    <AccordionTrigger className="hover:no-underline text-ecasi-navy font-semibold text-left py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-ecasi-section text-ecasi-green flex items-center justify-center flex-shrink-0">
                          <span className="text-xs">Q</span>
                        </div>
                        {faq.q}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600 pl-9 pb-4 leading-relaxed">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </ScrollAnimation>

        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TrainingEducation;
