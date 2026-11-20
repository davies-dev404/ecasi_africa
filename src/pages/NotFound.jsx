import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error attempted to access non-existent route", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <SEO
        title="Page Not Found | ECAS Institute"
        description="The requested page could not be found on ECAS Institute. Explore our executive training courses and capacity building programmes."
        noIndex
      />
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="text-center max-w-lg bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h1 className="mb-3 text-5xl font-black text-[#032e42]">404</h1>
          <p className="mb-2 text-xl font-bold text-slate-800">Page not found</p>
          <p className="mb-6 text-sm text-slate-600">
            The page you are looking for may have been moved or renamed. Explore ECAS Institute courses or return home below.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/"
              className="px-5 py-2.5 rounded-xl bg-[#032e42] hover:bg-[#05435e] text-white text-sm font-bold transition"
            >
              Return to Home
            </Link>
            <Link
              to="/institute-overview"
              className="px-5 py-2.5 rounded-xl bg-[#008000] hover:bg-[#006600] text-white text-sm font-bold transition"
            >
              Browse Executive Courses
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
