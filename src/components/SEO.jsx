import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, keywords, image, url, type = "website", schema }) => {
  const siteTitle = "ECAS Institute";
  const defaultTitle = "ECAS Institute | Executive Training, Short Courses & Capacity Building in Africa";
  const fullTitle = title
    ? title.includes("ECAS")
      ? title
      : `${title} | ${siteTitle}`
    : defaultTitle;

  const defaultDescription =
    "ECAS Institute is a premier Pan-African executive training institution delivering 200+ accredited short courses, professional certifications, and corporate capacity building across Climate Finance, Public Financial Management, ESG, Carbon Markets, AI & Technology, Governance, and Project Management in Nairobi, Mombasa, Dubai, Kuala Lumpur (Malaysia), and Online.";

  const defaultImage = "https://ecasiafrica.org/images/courses/executive_training.jpg";
  const defaultKeywords =
    "executive training Nairobi, professional short courses Kenya, capacity building Africa, climate finance training Africa, public financial management courses, ESG certification Africa, carbon markets and trading course, corporate governance training, AI in project management, procurement short courses, NITA accredited training institution, ECAS Institute, ECASI Africa, executive training Dubai, training Kuala Lumpur Malaysia";

  const currentUrl = url || (typeof window !== "undefined" ? window.location.href : "https://ecasiafrica.org/");
  const canonicalUrl = url || (typeof window !== "undefined" ? `${window.location.origin}${window.location.pathname}` : "https://ecasiafrica.org/");

  return (
    <Helmet>
      {/* Standard Metadata */}
      <title>{fullTitle}</title>
      <meta name="description" content={description || defaultDescription} />
      <meta name="keywords" content={keywords || defaultKeywords} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#032e42" />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="google-site-verification" content="K3tyeQb5qs4t6mrjxytSj80FvaoI69hmo6L7qEEN9x4" />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:image" content={image || defaultImage} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:site_name" content="ECAS Institute" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description || defaultDescription} />
      <meta name="twitter:image" content={image || defaultImage} />
      <meta name="twitter:site" content="@ecasinstitute" />

      {/* Structured Data (JSON-LD) for Google Rich Snippets */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
