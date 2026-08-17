import { Link } from 'react-router-dom';
import { Facebook, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

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
              <img src="/logo_transparent.png" alt="ECASI Africa Logo" className="h-14 w-auto object-contain" />
            </Link>

            <p className="text-white/75 text-sm leading-relaxed">
              Environmental Capacities and Sustainability Institute (ECAS Institute) is an independent Pan-African think tank advancing sustainable development through research, policy advisory, technical assistance, consultancy, and capacity strengthening.
            </p>

            <div className="text-white/70 text-xs space-y-2 pt-1">
              <p className="flex items-center gap-2">
                <MapPin size={14} className="text-white/80 shrink-0" />
                <span>P.O. Box 37193-00100, Nairobi Kenya</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone size={14} className="text-white/80 shrink-0" />
                <a href="tel:+254728925306" className="hover:underline hover:text-white transition-colors">+254 728 925 306</a>
                <span>/</span>
                <a href="tel:+254736356738" className="hover:underline hover:text-white transition-colors">+254 736 356 738</a>
              </p>
              <p className="flex items-center gap-2 mt-1">
                {/* Custom WhatsApp SVG */}
                <svg viewBox="0 0 24 24" className="w-[14px] h-[14px] text-white/80 shrink-0 fill-current" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                </svg>
                <span className="font-semibold text-white/80">WhatsApp:</span>
                <a href="https://wa.me/254728925306" target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-white transition-colors">
                  +254 728 925 306
                </a>
              </p>
            </div>

            {/* Social Icons */}
            <div className="flex flex-wrap gap-3">
              {[
                { icon: Facebook, label: "Facebook", href: "https://www.facebook.com/ECASInstitute" },
                { icon: Instagram, label: "Instagram", href: "https://www.instagram.com/ecasiafrica/" },
                { label: "X", href: "https://twitter.com/ecasiafrica", custom: true },
                { icon: Linkedin, label: "LinkedIn", href: "https://www.linkedin.com/company/ecas-institute" },
                { icon: Mail, label: "Email", href: "mailto:info@ecasiafrica.org" },
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
          <p>Copyright © ECAS Institute, {year}.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
