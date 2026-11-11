import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const BASE_URL = 'https://ecasiafrica.org';
const today = new Date().toISOString().split('T')[0];

// Load course slugs from coursesData.json
const coursesDataPath = path.join(rootDir, 'src', 'data', 'coursesData.json');
let courseSlugs = [];
try {
  const raw = fs.readFileSync(coursesDataPath, 'utf8');
  const data = JSON.parse(raw);
  courseSlugs = Object.keys(data);
} catch (err) {
  console.error('Error reading coursesData.json:', err);
}

// 1. Primary Pages (High priority executive training focus)
const primaryPages = [
  { loc: '/', priority: '1.0', changefreq: 'daily' },
  { loc: '/institute-overview', priority: '0.95', changefreq: 'daily' },
  { loc: '/courses', priority: '0.95', changefreq: 'daily' },
  { loc: '/executive-training', priority: '0.95', changefreq: 'daily' },
  { loc: '/register', priority: '0.90', changefreq: 'weekly' },
  { loc: '/about', priority: '0.80', changefreq: 'monthly' },
  { loc: '/contact', priority: '0.80', changefreq: 'monthly' },
  { loc: '/our-history', priority: '0.70', changefreq: 'monthly' },
  { loc: '/our-strategic-focus', priority: '0.70', changefreq: 'monthly' },
  { loc: '/governance', priority: '0.70', changefreq: 'monthly' },
  { loc: '/governing-council', priority: '0.70', changefreq: 'monthly' },
  { loc: '/our-team', priority: '0.70', changefreq: 'monthly' },
  { loc: '/our-policies', priority: '0.60', changefreq: 'monthly' },
  { loc: '/partners', priority: '0.75', changefreq: 'monthly' },
  { loc: '/vacancies', priority: '0.70', changefreq: 'weekly' },
  { loc: '/newsroom', priority: '0.80', changefreq: 'weekly' },
  { loc: '/gallery', priority: '0.65', changefreq: 'monthly' },
  { loc: '/search', priority: '0.60', changefreq: 'weekly' },
];

// 2. Beyond the Classroom Excursion Pages
const excursionPages = [
  { loc: '/beyond-the-classroom', priority: '0.85', changefreq: 'weekly' },
  { loc: '/beyond-the-classroom/giraffe-centre', priority: '0.80', changefreq: 'weekly' },
  { loc: '/beyond-the-classroom/above-the-city', priority: '0.80', changefreq: 'weekly' },
  { loc: '/beyond-the-classroom/nairobi-safari-walk', priority: '0.80', changefreq: 'weekly' },
  { loc: '/beyond-the-classroom/city-walk', priority: '0.80', changefreq: 'weekly' },
  { loc: '/beyond-the-classroom/nairobi-shopping', priority: '0.80', changefreq: 'weekly' },
];

// 3. Specialties & Programmes
const specialtyPages = [
  { loc: '/programmes', priority: '0.80', changefreq: 'weekly' },
  { loc: '/specialties/clean-air-programme', priority: '0.75', changefreq: 'monthly' },
  { loc: '/specialties/energy', priority: '0.75', changefreq: 'monthly' },
  { loc: '/specialties/sustainable-agriculture-and-food-systems', priority: '0.75', changefreq: 'monthly' },
  { loc: '/specialties/transport', priority: '0.75', changefreq: 'monthly' },
  { loc: '/specialties/waste-and-circular-economy', priority: '0.75', changefreq: 'monthly' },
  { loc: '/specialties/forests', priority: '0.75', changefreq: 'monthly' },
  { loc: '/specialties/mining-extractives', priority: '0.75', changefreq: 'monthly' },
  { loc: '/specialties/oceans-marine', priority: '0.75', changefreq: 'monthly' },
  { loc: '/specialties/security-migration', priority: '0.75', changefreq: 'monthly' },
  { loc: '/specialties/water', priority: '0.75', changefreq: 'monthly' },
];

// 4. Research & Consultancy Pages
const researchPages = [
  { loc: '/research', priority: '0.75', changefreq: 'weekly' },
  { loc: '/research/overview', priority: '0.75', changefreq: 'weekly' },
  { loc: '/research/consulting', priority: '0.75', changefreq: 'weekly' },
  { loc: '/consultancy', priority: '0.75', changefreq: 'weekly' },
  { loc: '/research/climate-finance', priority: '0.70', changefreq: 'monthly' },
  { loc: '/research/climate-adaptation', priority: '0.70', changefreq: 'monthly' },
  { loc: '/research/climate-change-mitigation', priority: '0.70', changefreq: 'monthly' },
  { loc: '/research/climate-and-technology', priority: '0.70', changefreq: 'monthly' },
  { loc: '/research/energy-transition', priority: '0.70', changefreq: 'monthly' },
  { loc: '/research/just-transition', priority: '0.70', changefreq: 'monthly' },
  { loc: '/research/agriculture-and-food-systems-2', priority: '0.70', changefreq: 'monthly' },
  { loc: '/research/natural-resources', priority: '0.70', changefreq: 'monthly' },
  { loc: '/research/environmental-law-and-governance', priority: '0.70', changefreq: 'monthly' },
  { loc: '/research/transport-and-e-mobility', priority: '0.70', changefreq: 'monthly' },
  { loc: '/research/waste-and-circular-economy-2', priority: '0.70', changefreq: 'monthly' },
  { loc: '/research/assessments', priority: '0.70', changefreq: 'monthly' },
  { loc: '/research/baseline-study', priority: '0.70', changefreq: 'monthly' },
  { loc: '/research/policy-reviews-and-assessments', priority: '0.70', changefreq: 'monthly' },
  { loc: '/research/policy-analysis', priority: '0.70', changefreq: 'monthly' },
  { loc: '/research/strategic-environmental-assessments-sea-2', priority: '0.70', changefreq: 'monthly' },
  { loc: '/research/environmental-and-social-impact-assessment', priority: '0.70', changefreq: 'monthly' },
  { loc: '/research/environmental-and-social-management-plans-esmp', priority: '0.70', changefreq: 'monthly' },
  { loc: '/research/environmental-audits', priority: '0.70', changefreq: 'monthly' },
  { loc: '/research/energy-audits', priority: '0.70', changefreq: 'monthly' },
  { loc: '/research/scoping-studies', priority: '0.70', changefreq: 'monthly' },
  { loc: '/research/rapporteur-and-reporting-services', priority: '0.70', changefreq: 'monthly' },
];

// 5. Resources & Publications
const resourcePages = [
  { loc: '/resources', priority: '0.70', changefreq: 'weekly' },
  { loc: '/resources/publications', priority: '0.70', changefreq: 'weekly' },
  { loc: '/resources/reports', priority: '0.70', changefreq: 'weekly' },
  { loc: '/resources/policy-briefs', priority: '0.70', changefreq: 'weekly' },
  { loc: '/resources/policies-and-laws', priority: '0.65', changefreq: 'monthly' },
  { loc: '/resources/videos', priority: '0.65', changefreq: 'monthly' },
  { loc: '/resources/books', priority: '0.65', changefreq: 'monthly' },
];

// 6. All Individual Executive Training Courses
const coursePages = courseSlugs.map((slug) => ({
  loc: `/executive-training/${slug}`,
  priority: '0.85',
  changefreq: 'weekly',
}));

const allPages = [
  ...primaryPages,
  ...excursionPages,
  ...specialtyPages,
  ...researchPages,
  ...resourcePages,
  ...coursePages,
];

console.log(`Generating sitemap with ${allPages.length} URLs (including ${coursePages.length} training courses)...`);

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${allPages
  .map(
    (page) => `  <url>
    <loc>${BASE_URL}${page.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

// Write to public/sitemap.xml
const publicSitemapPath = path.join(rootDir, 'public', 'sitemap.xml');
fs.writeFileSync(publicSitemapPath, xml, 'utf8');
console.log(`✓ Successfully wrote ${publicSitemapPath}`);

// Write to dist/sitemap.xml if dist directory exists
const distDir = path.join(rootDir, 'dist');
if (fs.existsSync(distDir)) {
  const distSitemapPath = path.join(distDir, 'sitemap.xml');
  fs.writeFileSync(distSitemapPath, xml, 'utf8');
  console.log(`✓ Successfully wrote ${distSitemapPath}`);
}

// Generate robots.txt with AI Crawlers explicitly enabled
const robotsTxt = `# ECAS Institute (ECASI Africa) robots.txt
# Focus: Executive Training, Short Courses & Professional Capacity Building

User-agent: *
Allow: /

# Explicit AI Search Engine Crawlers (Google AI Overviews, Gemini, OpenAI Search, Perplexity, Claude, Applebot)
User-agent: Google-Extended
Allow: /

User-agent: GoogleOther
Allow: /

User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: Applebot-Extended
Allow: /

# Sitemaps & LLM Context
Sitemap: https://ecasiafrica.org/sitemap.xml
`;

const publicRobotsPath = path.join(rootDir, 'public', 'robots.txt');
fs.writeFileSync(publicRobotsPath, robotsTxt, 'utf8');
console.log(`✓ Successfully wrote ${publicRobotsPath}`);

if (fs.existsSync(distDir)) {
  const distRobotsPath = path.join(distDir, 'robots.txt');
  fs.writeFileSync(distRobotsPath, robotsTxt, 'utf8');
  console.log(`✓ Successfully wrote ${distRobotsPath}`);
}

// Generate llms.txt (Authoritative Knowledge Base for LLMs & AI Search)
const llmsTxt = `# ECAS Institute (ECASI Africa)

> Premier Pan-African executive training institution, professional capacity building centre, and environmental policy think tank.

Founded in 2011 and accredited by the National Industrial Training Authority (NITA) and NEMA, ECAS Institute empowers leaders, civil servants, corporate executives, and international development professionals across Africa, the Middle East, and Asia.

## Core Executive Training Faculties

- [Climate Finance & Public Financial Management (PFM)](https://ecasiafrica.org/institute-overview?category=Financial%20Management): Climate-responsive budgeting, climate fiscal frameworks, green bonds, green finance taxonomy, adaptation finance, and PFM reforms.
- [Governance, Leadership & Public Sector Transformation](https://ecasiafrica.org/institute-overview?category=Governance%2C%20Leadership%20%26%20Public%20Sector%20Transformation): Ethics, anti-corruption, strategic leadership, office productivity with AI, diplomatic protocol, change management, and policy design thinking.
- [Carbon Markets, ESG & Corporate Sustainability](https://ecasiafrica.org/institute-overview?category=Carbon%20Markets%20%26%20ESG): Carbon accounting, emissions trading, agricultural carbon credits, ESG risk disclosure (IFRS/GRI), and sustainable business strategy.
- [Environment, Climate Change & Sustainability](https://ecasiafrica.org/institute-overview?category=Climate%20Change%20%26%20Sustainability): Climate mitigation/adaptation, air quality management, renewable energy transition, nature-based solutions (NbS), and climate-smart forestry.
- [Data, Artificial Intelligence, IT & Cybersecurity](https://ecasiafrica.org/institute-overview?category=Data%2C%20Artificial%20Intelligence%2C%20IT%20%26%20Cybersecurity): Big data analytics, AI in project management, executive machine learning, secure software engineering, Power BI, and data governance.
- [Project Management, Procurement & M&E](https://ecasiafrica.org/institute-overview?category=Project%20Management%2C%20Procurement%20%26%20M%26E): Public procurement and asset management, MEAL, outcome harvesting, PPP structuring (SPV), feasibility studies, and grant proposal writing.

## Delivery Formats & Global Training Destinations

- **Classroom (In-Person)**: Delivered in executive venues across Nairobi (Kenya), Mombasa (Kenya), Naivasha (Kenya), Arusha (Tanzania), Dar es Salaam (Tanzania), Kigali (Rwanda), Dubai (UAE), and Kuala Lumpur (Malaysia).
- **Virtual (Online Cohorts)**: Interactive, live instructor-led executive cohorts.
- **Tailored In-House Corporate Training**: Customized on-site programmes designed specifically for ministries, state corporations, NGOs, financial institutions, and multinational teams.

## Beyond the Classroom — Nairobi Excursion Programme

Every executive cohort in Nairobi includes curated networking excursions:
- [Magical Visit to the Giraffe Centre](https://ecasiafrica.org/beyond-the-classroom/giraffe-centre): Hand-feeding endangered Rothschild giraffes in Lang'ata.
- [Above the City: KICC Rooftop & Helipad](https://ecasiafrica.org/beyond-the-classroom/above-the-city): 360-degree panoramic skyline views from the historic KICC tower.
- [Nairobi Safari Walk](https://ecasiafrica.org/beyond-the-classroom/nairobi-safari-walk): KWS biodiversity showcase and elevated timber canopy boardwalk.
- [The City Walk & Nairobi Expressway](https://ecasiafrica.org/beyond-the-classroom/city-walk): Exploring modern urban infrastructure and Nairobi Green City (NGC).
- [A Taste of Nairobi Shopping](https://ecasiafrica.org/beyond-the-classroom/nairobi-shopping): Authentic Maasai Market crafts, Kenyan AA coffee & Mount Kenya purple tea.

## Key Links & Resources

- [Course Finder (All 200+ Courses)](https://ecasiafrica.org/institute-overview)
- [Course Registration](https://ecasiafrica.org/register)
- [Institutional Overview](https://ecasiafrica.org/about)
- [Sitemap](https://ecasiafrica.org/sitemap.xml)
- [Contact & Admissions](https://ecasiafrica.org/contact)
- Email: info@ecasiafrica.org
- Official Website: https://ecasiafrica.org
`;

const publicLlmsPath = path.join(rootDir, 'public', 'llms.txt');
fs.writeFileSync(publicLlmsPath, llmsTxt, 'utf8');
console.log(`✓ Successfully wrote ${publicLlmsPath}`);

if (fs.existsSync(distDir)) {
  const distLlmsPath = path.join(distDir, 'llms.txt');
  fs.writeFileSync(distLlmsPath, llmsTxt, 'utf8');
  console.log(`✓ Successfully wrote ${distLlmsPath}`);
}

console.log('Sitemap & robots.txt generation complete!');
