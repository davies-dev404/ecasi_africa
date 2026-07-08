import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SEO from '@/components/SEO';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Mail, Briefcase, Award, Linkedin, Twitter, Sparkles } from 'lucide-react';

const teamMembers = [
  {
    name: "Jacob Olonde",
    role: "Founder & Chief Executive Officer",
    image: "https://ecasiafrica.org/wp-content/uploads/2024/06/IMG_6632.jpg",
    department: "Leadership",
    email: "jolonde@ecasiafrica.org",
    initials: "JO",
  },
  {
    name: "Debra Aquino",
    role: "Human Resources and Operations",
    image: "/images/team/HR.png",
    department: "Human Resource",
    email: "debra@ecasiafrica.org",
    initials: "GG",
  },
  {
    name: "Gibson Gisore",
    role: "Legal & Policy Advisor",
    image: "https://ecasiafrica.org/wp-content/uploads/2024/06/Fro2fvzXoAMhCbn-1024x698.jpg",
    department: "Advisory",
    email: "daquino@ecasiafrica.org",
    initials: "GG",
  },
  {
    name: "Sharon Mwalasha",
    role: "Finance & Business Development",
    image: "/images/team/mwalasha.png",
    department: "Finance",
    email: "smwalasha@ecasiafrica.org",
    initials: "SM",
  },
  {
    name: "Gift Rioba",
    role: "Corporate Marketing and Communications Advisor",
    image: "/images/team/gift.jpeg",
    department: "Communications",
    email: "riobag@ecasiafrica.org",
    initials: "GR",
  },
  {
    name: "Derrick S.Israel",
    role: "Programs and Partnerships Manager",
    image: "/images/team/derrick.png",
    department: "Partnerships",
    email: "derrick@ecasiafrica.org",
    initials: "DI",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
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

const OurTeam = () => {
  return (
    <div className="min-h-screen bg-slate-50/50">
      <SEO
        title="Our Team"
        description="Meet the dedicated team of researchers, advisors, and professionals at ECAS Institute driving sustainable development, climate action, and capacity building across Africa."
      />
      <Header />

      {/* Page Banner */}
      <section className="bg-primary pt-28 pb-12 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\\'20\\' height=\\'20\\' viewBox=\\'0 0 20 20\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'%23ffffff\\' fill-opacity=\\'1\\' fill-rule=\\'evenodd\\'%3E%3Ccircle cx=\\'3\\' cy=\\'3\\' r=\\'3\\'/%3E%3Ccircle cx=\\'13\\' cy=\\'13\\' r=\\'3\\'/%3E%3C/g%3E%3C/svg%3E')" }}></div>
        <div className="healthcare-container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-3 drop-shadow-md">
              Our Team
            </h1>
            <p className="text-white/90 text-lg max-w-2xl mx-auto text-center font-medium">
              Meet the passionate experts and professional staff leading sustainable development initiatives across Africa.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Intro section */}
      <section className="py-16">
        <div className="healthcare-container">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto text-center mb-16 bg-white p-8 md:p-10 rounded-3xl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-5">
              <Sparkles className="h-4 w-4" />
              <span>African Expertise</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-800 mb-6">
              Dedicated to Continental Transformation
            </h2>
            <p className="text-slate-600 leading-relaxed text-base md:text-lg">
              Our multidisciplinary team combines extensive experience in environmental planning, policy negotiation, law, air quality science, sustainable finance, and development communications. Together, we work with governments, the private sector, and communities to design and implement sustainable solutions.
            </p>
          </motion.div>

          {/* Responsive grid of team members */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          >
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col relative after:absolute after:bottom-0 after:left-0 after:h-1.5 after:w-full after:bg-primary after:scale-x-0 group-hover:after:scale-x-100 after:transition-transform after:duration-300 after:origin-left"
              >
                {/* Decorative background shape */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none transition-transform duration-500 group-hover:scale-110"></div>

                {/* Photo container */}
                <div className="relative aspect-[4/5] overflow-hidden bg-slate-50 flex items-center justify-center p-4">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="w-full h-full rounded-[1.5rem] overflow-hidden shadow-inner relative z-10"
                  >
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover object-top"
                      loading="eager"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.classList.add('flex', 'items-center', 'justify-center', 'bg-primary/10');
                        e.target.parentElement.innerHTML = `<span class="text-5xl font-serif font-bold text-primary">${member.initials}</span>`;
                      }}
                    />
                  </motion.div>
                  <div className="absolute top-6 right-6 z-20">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-white/95 backdrop-blur-md text-slate-800 px-3 py-1.5 rounded-full shadow-md">
                      {member.department}
                    </span>
                  </div>
                </div>

                {/* Profile info */}
                <div className="p-6 flex-1 flex flex-col justify-between relative z-10 bg-white">
                  <div>
                    <h3 className="font-serif font-bold text-xl text-slate-800 group-hover:text-primary transition-colors leading-tight mb-2">
                      {member.name}
                    </h3>
                    <p className="text-primary font-semibold text-xs tracking-wide text-left">
                      {member.role}
                    </p>
                  </div>

                  {/* Footer card controls/details */}
                  <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
                    <a
                      href={`mailto:${member.email}`}
                      className="flex items-center gap-2 text-xs text-slate-500 hover:text-primary transition-colors font-medium bg-slate-50 px-3 py-2 rounded-xl"
                    >
                      <Mail className="h-4 w-4" />
                      <span className="truncate max-w-[130px]">{member.email}</span>
                    </a>
                    <div className="flex gap-1.5">
                      <a href="#" className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors shadow-sm" aria-label="LinkedIn">
                        <Linkedin className="h-4 w-4" />
                      </a>
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

export default OurTeam;
