import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import ScrollAnimation from '@/components/ScrollAnimation';

const galleryCategories = [
  { id: 'all', label: 'All Photos' },
  { id: 'events', label: 'Events & Conferences' },
  { id: 'fieldwork', label: 'Field Work' },
  { id: 'training', label: 'Training Programs' },
  { id: 'community', label: 'Community Engagement' }
];

const galleryImages = [
  {
    src: "/images/research/1710846398420-1-1-1024x683.jpg",
    category: "fieldwork",
    title: "Field Research Session",
    description: "ECASI team conducting environmental field assessments."
  },
  {
    src: "/images/research/IMG_20241112_163109285-1024x683.jpg",
    category: "training",
    title: "Technical Training Workshop",
    description: "Participants engaged in a hands-on capacity building workshop."
  },
  {
    src: "/images/research/6Dec23-UNEA-6-Briefing-website-aspect-ratio-2000-1200-1024x614-1.jpg",
    category: "events",
    title: "UNEA-6 Briefing Session",
    description: "ECAS Institute representatives at the UNEA-6 briefing in December 2023."
  },
  {
    src: "/images/research/1713864387984-1024x768.jpg",
    category: "events",
    title: "Pan-African Conference",
    description: "Experts gathered for a high-level climate policy discussion."
  },
  {
    src: "/images/research/57213763_2128957177158658_1134502275364945920_n.jpg",
    category: "community",
    title: "Community Engagement",
    description: "Engaging local communities on environmental policies and their impact."
  },
  {
    src: "/images/courses/IMGM1984-1024x683.jpg",
    category: "training",
    title: "Executive Training Program",
    description: "Participants at ECASI's executive training on climate and sustainability."
  },
  {
    src: "/images/courses/20241003_133952069-1-1024x683.jpg",
    category: "training",
    title: "Carbon Markets Training",
    description: "Workshop participants learning about carbon trading and markets."
  },
  {
    src: "/images/courses/62262333_1035153403346851_5273722628304011264_n-1024x681.jpg",
    category: "events",
    title: "Regional Workshop",
    description: "ECASI hosted a regional workshop on climate change and food systems."
  },
  {
    src: "/images/courses/hd.jpg",
    category: "community",
    title: "Stakeholder Consultation",
    description: "A multi-stakeholder consultation session on sustainable development."
  },
  {
    src: "/images/programmes/migration-community.png",
    category: "community",
    title: "Migration & Community",
    description: "Addressing environment, migration, and mobility challenges in vulnerable communities."
  },
  {
    src: "/images/programmes/migration-team.png",
    category: "fieldwork",
    title: "Field Team Deployment",
    description: "ECASI field team during an environmental migration assessment."
  },
  {
    src: "/images/programmes/contact-hero.jpg",
    category: "fieldwork",
    title: "Coastal Programme",
    description: "Assessing marine ecosystem and coastal resource health."
  },
];

const GalleryImage = ({ image, categoryLabel }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  return (
    <div className="group relative overflow-hidden rounded-2xl shadow-sm bg-white border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="aspect-[4/3] overflow-hidden relative bg-gray-100">
        {!imageLoaded && !imgError && (
           <Skeleton className="absolute inset-0 w-full h-full" />
        )}
        {imgError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-ecasi-section text-ecasi-navy/50 text-sm p-4 text-center">
            <span>{image.title}</span>
          </div>
        ) : (
          <img 
            src={image.src} 
            alt={image.title} 
            className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
            onError={() => { setImgError(true); setImageLoaded(true); }}
          />
        )}
        {!imgError && (
          <div className="absolute inset-0 bg-gradient-to-t from-ecasi-navy/90 via-ecasi-navy/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
            <span className="text-ecasi-green text-xs font-bold uppercase tracking-wider mb-2">
              {categoryLabel}
            </span>
            <h3 className="text-white font-bold text-xl mb-1">{image.title}</h3>
            <p className="text-white/80 text-sm leading-relaxed">{image.description}</p>
          </div>
        )}
      </div>
    </div>
  );
};

const Gallery = () => {
  const [activeTab, setActiveTab] = useState("all");

  const filteredImages = activeTab === "all" 
    ? galleryImages 
    : galleryImages.filter(img => img.category === activeTab);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <SEO 
        title="Gallery | ECASI Africa"
        description="Explore photos from ECASI Africa training programmes, field research, community engagement events, and regional partnerships across Africa."
      />
      <Header />
      
      <section className="bg-ecasi-navy pt-24 pb-16 relative overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-4 relative z-10 text-center">
          <ScrollAnimation animation="fade-up">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Our Gallery</h1>
            <p className="text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
              A visual journey through our fieldwork, events, training programs, and community engagements driving sustainable development across Africa.
            </p>
          </ScrollAnimation>
        </div>
      </section>

      <section className="py-20 flex-grow">
        <div className="max-w-[1200px] mx-auto px-4">
          <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
            <div className="flex justify-center mb-12">
              <TabsList className="bg-white p-1.5 rounded-full border border-gray-200 shadow-sm flex flex-wrap justify-center h-auto">
                {galleryCategories.map(cat => (
                  <TabsTrigger 
                    key={cat.id} 
                    value={cat.id}
                    className="rounded-full px-6 py-2.5 data-[state=active]:bg-ecasi-green data-[state=active]:text-white data-[state=active]:shadow-md transition-all font-medium text-sm text-gray-600 m-1"
                  >
                    {cat.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <TabsContent value={activeTab} className="mt-0 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredImages.map((image, index) => (
                  <ScrollAnimation key={index} delay={index * 80}>
                    <GalleryImage 
                      image={image} 
                      categoryLabel={galleryCategories.find(c => c.id === image.category)?.label}
                    />
                  </ScrollAnimation>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {filteredImages.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg">No images found in this category.</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Gallery;
