import { Link } from 'react-router-dom';
import { Facebook, Instagram, Linkedin, Youtube } from 'lucide-react';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="ecasi-footer">
      {/* Main Footer Body */}
      <div className="max-w-[1476px] mx-auto px-4 lg:px-16 pt-16 pb-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10 mb-12">

          {/* Column 1: Brand */}
          <div className="col-span-2 lg:col-span-1 space-y-5">
            <Link to="/" className="flex items-center gap-3">
              <div className="bg-white rounded-lg flex items-center justify-center p-1.5 flex-shrink-0">
                <img src="/logo.png" alt="ECASI Africa Logo" className="h-10 w-auto object-contain mix-blend-multiply" />
              </div>
            </Link>

            <p className="text-white/75 text-sm leading-relaxed">
              Environmental Capacities and Sustainability Institute (ECAS Institute) is an independent Pan-African think tank advancing sustainable development through research, policy advisory, technical assistance, consultancy, and capacity strengthening.
            </p>

            {/* Social Icons */}
            <div className="flex gap-3">
              {[
                { icon: Facebook, label: "Facebook", href: "https://www.facebook.com/ECASInstitute" },
                { icon: Instagram, label: "Instagram", href: "https://www.instagram.com/ecasiafrica/" },
                { label: "X", href: "https://twitter.com/ecasiafrica", custom: true },
                { icon: Linkedin, label: "LinkedIn", href: "https://www.linkedin.com/company/ecas-institute" },
                { icon: Youtube, label: "YouTube", href: "https://www.youtube.com/@ecasiafrica" },
              ].map((s, i) => (
                <a
                  key={i}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center transition-colors text-white"
                >
                  {s.custom ? (
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
                      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
                    </svg>
                  ) : (
                    <s.icon size={15} />
                  )}
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Programmes / Quick Links */}
          <div>
            <h4 className="text-white font-bold text-base uppercase tracking-wider mb-5 pb-3 border-b border-white/20"
              style={{ fontFamily: "'Fira Sans', sans-serif" }}>
              PROGRAMMES
            </h4>
            <ul className="ecasi-footer-list space-y-1">
              {[
                { label: "Programmes", path: "/our-strategic-focus" },
                { label: "About Us", path: "/about" },
                { label: "Training", path: "/training-education-public-awareness" },
                { label: "Research", path: "/research/overview" },
                { label: "Resources", path: "/resources" },
                { label: "Contact Us", path: "/contact" },
              ].map(({ label, path }) => (
                <li key={label} className="flex items-center gap-2 py-1">
                  <span className="text-white/40 text-base">›</span>
                  <Link to={path} className="text-white/75 hover:text-white text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Specialties / Research */}
          <div>
            <h4 className="text-white font-bold text-base uppercase tracking-wider mb-5 pb-3 border-b border-white/20"
              style={{ fontFamily: "'Fira Sans', sans-serif" }}>
              Our Focus Areas
            </h4>
            <ul className="ecasi-footer-list space-y-1">
              {[
                { label: "Air Quality Programme", path: "/specialties/clean-air-programme" },
                { label: "Climate Change Action", path: "/climate-change-programming" },
                { label: "Renewable Energy and Just Transition", path: "/specialties/energy" },
                { label: "Agriculture and Food Systems", path: "/specialties/sustainable-agriculture-and-food-systems" },
                { label: "Sustainable Transport & E-Mobility", path: "/specialties/transport" },
                { label: "Waste & Circular Economy", path: "/specialties/waste-and-circular-economy" },
                { label: "Natural Resources Management", path: "/specialties/forests" },
              ].map(({ label, path }) => (
                <li key={label} className="flex items-center gap-2 py-1">
                  <span className="text-white/40 text-base">›</span>
                  <Link to={path} className="text-white/75 hover:text-white text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Upcoming Events / Profiles */}
          <div className="col-span-2 lg:col-span-1">
            <h4 className="text-white font-bold text-base uppercase tracking-wider mb-5 pb-3 border-b border-white/20"
              style={{ fontFamily: "'Fira Sans', sans-serif" }}>
              Our Profiles
            </h4>
            <div className="space-y-4">
              <a href="/ECASI_Training_Profile.pdf" target="_blank" rel="noopener noreferrer" className="block bg-white/10 rounded p-3 hover:bg-white/15 transition-colors cursor-pointer">
                <p className="text-white text-sm font-semibold leading-snug" style={{ fontFamily: "'Roboto', sans-serif" }}>
                  Download Training Profile
                </p>
                <div className="text-white/60 text-xs mt-1">PDF Document</div>
              </a>
              <a href="/ECASI_Research_Profile_2025.pdf" target="_blank" rel="noopener noreferrer" className="block bg-white/10 rounded p-3 hover:bg-white/15 transition-colors cursor-pointer">
                <p className="text-white text-sm font-semibold leading-snug" style={{ fontFamily: "'Roboto', sans-serif" }}>
                  Download Research Profile 2025
                </p>
                <div className="text-white/60 text-xs mt-1">PDF Document</div>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/60 text-center">
          <p>Copyright © ECAS Institute, {year}. powered by JengaWeb</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
