import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

/**
 * Reusable photo-backed hero banner for Research, Consultancy, Programmes,
 * Resources, and institutional pages — replaces flat solid-green headers with
 * section-specific imagery and high-contrast white typography.
 */
const PageHeroBanner = ({
  title,
  subtitle = '',
  image = '/images/Gallery/regulation_training_group.jpg',
  fallbackImage = '/images/Gallery/training_workshop_session.jpg',
  icon: IconComponent = null,
  breadcrumbs = [],
}) => {
  return (
    <section className="relative pt-14 pb-10 md:pt-16 md:pb-12 text-white text-center overflow-hidden bg-[#032e42]">
      {/* Section-Specific Photograph */}
      <img
        src={image}
        alt={title}
        onError={(e) => {
          if (fallbackImage && !e.currentTarget.dataset.fallbackApplied) {
            e.currentTarget.dataset.fallbackApplied = '1';
            e.currentTarget.src = fallbackImage;
          }
        }}
        className="absolute inset-0 w-full h-full object-cover object-center scale-105"
      />

      {/* Executive Navy-to-Emerald Readability Overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(125deg, rgba(3, 46, 66, 0.84) 0%, rgba(3, 46, 66, 0.74) 52%, rgba(0, 77, 30, 0.78) 100%)',
        }}
      />

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        {IconComponent && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/15 backdrop-blur-md border border-white/25 mb-4 shadow-md"
          >
            <IconComponent size={26} className="text-white" />
          </motion.div>
        )}

        <motion.h1
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="!text-white text-2xl sm:text-3xl md:text-4xl font-bold uppercase tracking-wide drop-shadow-md leading-snug max-w-4xl mx-auto"
          style={{ fontFamily: "'Fira Sans', sans-serif" }}
        >
          {title}
        </motion.h1>

        {subtitle && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="text-white/95 text-sm md:text-base max-w-2xl mx-auto mt-2.5 text-center font-normal"
          >
            {subtitle}
          </motion.p>
        )}

        {breadcrumbs && breadcrumbs.length > 0 && (
          <motion.nav
            aria-label="Breadcrumb"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.45, delay: 0.15 }}
            className="flex flex-wrap items-center justify-center gap-2 mt-3 text-xs md:text-sm text-white/85 font-medium"
            style={{ fontFamily: "'Roboto', sans-serif" }}
          >
            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <span key={`${crumb.label}-${idx}`} className="inline-flex items-center gap-2">
                  {idx > 0 && <span className="text-white/50">/</span>}
                  {crumb.path && !isLast ? (
                    <Link
                      to={crumb.path}
                      className="text-white/90 hover:text-emerald-300 transition-colors"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className={isLast ? 'text-emerald-300 font-semibold' : 'text-white/85'}>
                      {crumb.label}
                    </span>
                  )}
                </span>
              );
            })}
          </motion.nav>
        )}
      </div>
    </section>
  );
};

export default PageHeroBanner;
