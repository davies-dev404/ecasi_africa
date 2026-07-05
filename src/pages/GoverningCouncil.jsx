import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SEO from '@/components/SEO';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Award, BookOpen, Globe2, Users, MapPin, Briefcase, GraduationCap, Star, ChevronRight } from 'lucide-react';

const councilMembers = [
  {
    name: "Prof. Shem O. Wandiga",
    role: "Chairperson, Governing Council",
    initials: "SW",
    image: "https://ecasiafrica.org/wp-content/uploads/2024/06/wandiga.jpg",
    tags: ["Chemistry", "Environmental Science", "UNESCO", "University of Nairobi"],
    stats: [
      { icon: BookOpen, label: "Publications", value: "70+ Papers" },
      { icon: GraduationCap, label: "Education", value: "Howard, Maryland & Case" },
      { icon: Award, label: "Specialty", value: "Environmental Chemistry" },
    ],
    bio: [
      "Prof. Wandiga was born in Karachuonyo, Homa Bay County in 1939. He received his early education at Kamagambo School and Pine Forge Institute, Pennsylvania. He received his B.Sc., M.Sc and Ph.D degrees at Howard, Maryland and Case universities respectively.",
      "He joined the Department of Chemistry at the University of Nairobi in 1972, where he has held various positions, including Chairman and Professor of Chemistry, Principal of College of Biological and Physical Sciences, Deputy Vice Chancellor, and Founder Director of the Institute for Climate Change and Adaptation.",
      "He was a member of many national and international scientific organizations, including Chairman, Natural Sciences Committee of the Kenya National Commission of UNESCO, a member of the International Society for Trace Element Research in Humans and Coordinator of the Eastern and Southern Africa Environmental Chemistry Network.",
      "Prof. Wandiga has had a long-standing research interest in coordination chemistry, and environmental and pollution chemistry. He has to date published over 70 scientific papers mainly in the area of coordination and analytical chemistry. His recent achievement involves the identification of termites as a major biological source of methane and carbon dioxide emission of the tropics.",
    ],
  },
  {
    name: "Jacob Olonde",
    role: "CEO & Secretary to the Board",
    initials: "JO",
    image: "https://ecasiafrica.org/wp-content/uploads/2024/06/IMG_6632.jpg",
    tags: ["Environmentalist", "Climate Advisor", "Author", "Mentor"],
    stats: [
      { icon: Users, label: "Mentored", value: "500+ Youths" },
      { icon: Globe2, label: "Coverage", value: "Africa, Asia & Europe" },
      { icon: Briefcase, label: "Experience", value: "10+ Years" },
    ],
    bio: [
      "Jacob Olonde is an environmentalist, mentor, author and Founder/CEO of the Environmental Capacity and Sustainability Institute based in Nairobi, Kenya. He has over 10 years of experience working and engaging in advisory, research, training and mentorship roles.",
      "He is a member of the national expert team of negotiators under the AGN. He currently supports the Office of the Special Climate Envoy in the Executive Office of the President of Kenya as Climate Advisor. He previously worked at the Institute for Climate Change and Adaptation, Council of Governors, World Wide Fund for Nature (WWF), Ministry of Environment, Groots Kenya.",
      "He has a master's degree in Environmental Law from the University of Nairobi and an undergraduate degree in Environmental Planning and Management from Kenyatta University. He is a fellow of the Danida Fellowship Center (DFC) and serves as the Secretary General of the DANIDA Alumni Network- Kenya.",
      "His greatest professional achievements include founding ECAS Institute, mentoring over 500 youths, contributing to the delivery of the African Leaders Nairobi Declaration on Climate Change, and contributing to the AMCEN, Summit of the Future, UNEA, IPBES and the Conference of the Parties to the UNFCCC (COPs) among other regional and global processes.",
    ],
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 }
  }
};

const Doctors = () => {
  return (
    <div className="min-h-screen bg-slate-50/50">
      <SEO
        title="Governing Council"
        description="Meet the ECAS Institute Governing Council — members with diverse skills providing governance oversight to ensure the Institute functions to the highest standards in executing its mission."
      />
      <Header />

      {/* Hero Banner */}
      <section className="bg-primary pt-28 pb-12 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\\'20\\' height=\\'20\\' viewBox=\\'0 0 20 20\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'%23ffffff\\' fill-opacity=\\'1\\' fill-rule=\\'evenodd\\'%3E%3Ccircle cx=\\'3\\' cy=\\'3\\' r=\\'3\\'/%3E%3Ccircle cx=\\'13\\' cy=\\'13\\' r=\\'3\\'/%3E%3C/g%3E%3C/svg%3E')" }}></div>
        <div className="healthcare-container relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4 drop-shadow-md">Governing Council</h1>
            <p className="text-white/90 text-lg max-w-2xl mx-auto leading-relaxed font-medium">
              Diverse expertise providing governance oversight to ensure ECAS Institute executes its mission to the highest standards.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Intro Card */}
      <section className="py-16">
        <div className="healthcare-container">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-3xl p-8 md:p-10 border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] max-w-5xl mx-auto relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-2 h-full bg-primary"></div>
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0 shadow-inner">
                <Star className="h-8 w-8 text-primary" />
              </div>
              <p className="text-slate-600 leading-relaxed text-lg font-medium text-center md:text-left">
                ECAS Institute's Governing Council consists of members with diverse skills. The primary mandate
                of the Governing Council is to provide governance oversight in ensuring the Institute functions
                to the highest standards to execute its mission. The Governing Council has delegated the
                day-to-day management to the Chief Executive Officer who is assisted by senior management teams.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Council Members */}
      <section className="pb-24">
        <div className="healthcare-container max-w-6xl mx-auto">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="space-y-16"
          >
            {councilMembers.map((member, index) => (
              <motion.div 
                key={index} 
                variants={itemVariants}
                className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden group hover:shadow-2xl hover:border-primary/20 transition-all duration-500"
              >
                <div className={`flex flex-col ${index % 2 !== 0 ? 'lg:flex-row-reverse' : 'lg:flex-row'}`}>
                  
                  {/* Photo & Quick Stats Side */}
                  <div className="w-full lg:w-[400px] p-8 bg-slate-50 border-b lg:border-b-0 lg:border-r border-slate-100 flex flex-col items-center justify-start relative overflow-hidden">
                    {/* Decorative background shape */}
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>
                    
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="w-56 h-56 rounded-[2rem] overflow-hidden shadow-lg border-4 border-white z-10 mb-6"
                    >
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover object-top"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.classList.add('flex', 'items-center', 'justify-center', 'bg-primary/10');
                          e.target.parentElement.innerHTML = `<span class="text-5xl font-serif font-bold text-primary">${member.initials}</span>`;
                        }}
                      />
                    </motion.div>
                    
                    <div className="text-center z-10 mb-6 w-full">
                      <h3 className="text-2xl font-serif font-bold text-slate-800 mb-2">{member.name}</h3>
                      <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-full font-semibold text-sm">
                        <Award className="w-4 h-4" />
                        {member.role}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 justify-center z-10 mb-8">
                      {member.tags.map((tag) => (
                        <span key={tag} className="text-xs px-3 py-1 bg-white border border-slate-200 text-slate-600 rounded-lg shadow-sm font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="w-full space-y-3 z-10">
                      {member.stats.map(({ icon: Icon, label, value }, i) => (
                        <motion.div 
                          key={label}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + (i * 0.1) }}
                          className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm border border-slate-100"
                        >
                          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0 text-primary">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">{label}</p>
                            <p className="text-sm font-bold text-slate-800">{value}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Bio Content Side */}
                  <div className="w-full lg:flex-1 p-8 md:p-12 flex flex-col justify-center bg-white relative">
                    <div className="absolute top-12 right-12 text-slate-100/50 pointer-events-none">
                      <BookOpen className="w-64 h-64" strokeWidth={0.5} />
                    </div>
                    
                    <div className="relative z-10">
                      <div className="flex items-center gap-4 mb-8">
                        <div className="h-px bg-primary/30 flex-1"></div>
                        <span className="text-primary font-bold text-sm tracking-widest uppercase">Biography</span>
                        <div className="h-px bg-primary/30 flex-1"></div>
                      </div>
                      
                      <div className="space-y-5">
                        {member.bio.map((para, i) => (
                          <motion.div 
                            key={i}
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ delay: 0.4 + (i * 0.1) }}
                            className="flex gap-4"
                          >
                            {i === 0 && (
                              <div className="w-1.5 h-auto bg-primary rounded-full flex-shrink-0 mt-1.5 mb-1.5" />
                            )}
                            <p className={`text-slate-600 leading-relaxed text-base ${i === 0 ? 'font-medium text-slate-700' : ''}`}>
                              {para}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Doctors;
