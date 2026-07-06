import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index.jsx";
import About from "./pages/About.jsx";
import GoverningCouncil from "./pages/GoverningCouncil.jsx";
import CleanAirProgramme from "./pages/CleanAirProgramme.jsx";
import Newsroom from "./pages/Newsroom.jsx";
import Contact from "./pages/Contact.jsx";
import NotFound from "./pages/NotFound.jsx";
import CookieBanner from "./components/CookieBanner.jsx";

import NewsDetail from "./pages/NewsDetail.jsx";
import Gallery from "./pages/Gallery.jsx";
import Resources from "./pages/Resources.jsx";
import Publications from "./pages/Publications.jsx";
import PoliciesLaws from "./pages/PoliciesLaws.jsx";
import Reports from "./pages/Reports.jsx";
import Videos from "./pages/Videos.jsx";
import Books from "./pages/Books.jsx";
import PolicyBriefs from "./pages/PolicyBriefs.jsx";
import OurHistory from "./pages/OurHistory.jsx";
import OurStrategicFocus from "./pages/OurStrategicFocus.jsx";
import OurTeam from "./pages/OurTeam.jsx";
import OurPolicies from "./pages/OurPolicies.jsx";
import Partners from "./pages/Partners.jsx";
import Governance from "./pages/Governance.jsx";
import TheoryOfChange from "./pages/TheoryOfChange.jsx";
import Vacancies from "./pages/Vacancies.jsx";
import TrainingEducation from "./pages/TrainingEducation.jsx";
import ResearchSystematicObservation from "./pages/ResearchSystematicObservation.jsx";
import EnablingEnvironment from "./pages/EnablingEnvironment.jsx";
import AdaptationMitigation from "./pages/AdaptationMitigation.jsx";
import GhgInventories from "./pages/GhgInventories.jsx";
import InstitutionalCapacityBuilding from "./pages/InstitutionalCapacityBuilding.jsx";
import ClimateChangeProgramming from "./pages/ClimateChangeProgramming.jsx";
import NationalCommunications from "./pages/NationalCommunications.jsx";
import Energy from "./pages/Energy.jsx";
import Agriculture from "./pages/Agriculture.jsx";
import Transport from "./pages/Transport.jsx";
import Waste from "./pages/Waste.jsx";
import Forests from "./pages/Forests.jsx";
import Mining from "./pages/Mining.jsx";
import Oceans from "./pages/Oceans.jsx";
import Migration from "./pages/Migration.jsx";
import Water from "./pages/Water.jsx";
import ExecutiveTraining from "./pages/ExecutiveTraining.jsx";
import ResearchConsultancy from "./pages/ResearchConsultancy.jsx";
import Training from "./pages/Training.jsx";
import PolicyAnalysis from "./pages/PolicyAnalysis.jsx";

import Analytics from "@/components/Analytics";
import ScrollToTop from "@/components/ScrollToTop";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Analytics />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/governing-council" element={<GoverningCouncil />} />
          <Route path="/specialties/clean-air-programme" element={<CleanAirProgramme />} />
          <Route path="/specialties/energy" element={<Energy />} />
          <Route path="/specialties/sustainable-agriculture-and-food-systems" element={<Agriculture />} />
          <Route path="/specialties/transport" element={<Transport />} />
          <Route path="/specialties/waste-and-circular-economy" element={<Waste />} />
          <Route path="/specialties/forests" element={<Forests />} />
          <Route path="/specialties/mining-extractives" element={<Mining />} />
          <Route path="/specialties/oceans-marine" element={<Oceans />} />
          <Route path="/specialties/security-migration" element={<Migration />} />
          <Route path="/specialties/water" element={<Water />} />
          <Route path="/newsroom" element={<Newsroom />} />
          <Route path="/news/:id" element={<NewsDetail />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/resources/publications" element={<Publications />} />
          <Route path="/resources/policies-and-laws" element={<PoliciesLaws />} />
          <Route path="/resources/reports" element={<Reports />} />
          <Route path="/resources/videos" element={<Videos />} />
          <Route path="/resources/books" element={<Books />} />
          <Route path="/resources/policy-briefs" element={<PolicyBriefs />} />
          <Route path="/our-history" element={<OurHistory />} />
          <Route path="/our-strategic-focus" element={<OurStrategicFocus />} />
          <Route path="/our-team" element={<OurTeam />} />
          <Route path="/our-policies" element={<OurPolicies />} />
          <Route path="/partners" element={<Partners />} />
          <Route path="/governance" element={<Governance />} />
          <Route path="/theory-of-change" element={<TheoryOfChange />} />
          <Route path="/vacancies" element={<Vacancies />} />
          <Route path="/training-education-public-awareness" element={<TrainingEducation />} />
          <Route path="/research-systematic-observation" element={<ResearchSystematicObservation />} />
          <Route path="/creation-enabling-environment" element={<EnablingEnvironment />} />
          <Route path="/adaptation-mitigation-assessments" element={<AdaptationMitigation />} />
          <Route path="/ghg-inventories" element={<GhgInventories />} />
          <Route path="/institutional-capacity-building" element={<InstitutionalCapacityBuilding />} />
          <Route path="/climate-change-programming" element={<ClimateChangeProgramming />} />
          <Route path="/national-communications" element={<NationalCommunications />} />
          <Route path="/training-2" element={<Training />} />
          <Route path="/institute-overview" element={<ExecutiveTraining />} />
          <Route path="/executive-training/:slug" element={<ExecutiveTraining />} />
          <Route path="/policy-analysis" element={<PolicyAnalysis />} />
          <Route path="/research/:slug" element={<ResearchConsultancy />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <CookieBanner />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
