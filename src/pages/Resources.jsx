import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import ScrollAnimation from '@/components/ScrollAnimation';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Scale,
  FileText,
  Image as ImageIcon,
  Video,
  Book,
  FileBadge,
  ArrowRight
} from 'lucide-react';

const resourcesLinks = [
  {
    title: 'Gallery',
    path: '/gallery',
    icon: ImageIcon,
    description: 'Explore visual highlights from our projects, events, and fieldwork across Africa.',
    color: 'bg-blue-50 text-blue-600',
    hover: 'group-hover:bg-blue-600 group-hover:text-white',
  },
  {
    title: 'Publications',
    path: '/resources/publications',
    icon: BookOpen,
    description: 'Read our latest research papers, journals, and articles on sustainable development.',
    color: 'bg-green-50 text-green-600',
    hover: 'group-hover:bg-green-600 group-hover:text-white',
  },
  {
    title: 'Policies and Laws',
    path: '/resources/policies-and-laws',
    icon: Scale,
    description: 'Access comprehensive frameworks, policies, and legal documents related to our focus areas.',
    color: 'bg-purple-50 text-purple-600',
    hover: 'group-hover:bg-purple-600 group-hover:text-white',
  },
  {
    title: 'Reports',
    path: '/resources/reports',
    icon: FileText,
    description: 'Dive into our detailed annual reports, impact assessments, and project summaries.',
    color: 'bg-orange-50 text-orange-600',
    hover: 'group-hover:bg-orange-600 group-hover:text-white',
  },

  {
    title: 'Videos',
    path: '/resources/videos',
    icon: Video,
    description: 'Watch documentaries, webinars, and informational videos from ECAS Institute.',
    color: 'bg-red-50 text-red-600',
    hover: 'group-hover:bg-red-600 group-hover:text-white',
  },
  {
    title: 'Books',
    path: '/resources/books',
    icon: Book,
    description: 'Browse our collection of published books covering key environmental and climate topics.',
    color: 'bg-indigo-50 text-indigo-600',
    hover: 'group-hover:bg-indigo-600 group-hover:text-white',
  },
  {
    title: 'Policy Briefs',
    path: '/resources/policy-briefs',
    icon: FileBadge,
    description: 'Concise summaries and recommendations for policymakers and stakeholders.',
    color: 'bg-teal-50 text-teal-600',
    hover: 'group-hover:bg-teal-600 group-hover:text-white',
  },
];

const Resources = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <SEO
        title="Resources Hub"
        description="Access ECASI Africa's extensive collection of publications, policies, reports, videos, books, and policy briefs."
      />
      <Header />

      {/* Hero Section */}
      <section className="bg-ecasi-green pt-24 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          {/* Subtle background pattern */}
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        
        <div className="max-w-[1200px] mx-auto px-4 relative z-10 text-center">
          <ScrollAnimation animation="fade-up">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Resources Hub
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto text-center leading-relaxed">
              Empowering change through knowledge. Access our comprehensive library of research, policies, reports, and multimedia content.
            </p>
          </ScrollAnimation>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 flex-grow">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {resourcesLinks.map((resource, index) => {
              const Icon = resource.icon;
              return (
                <ScrollAnimation key={index} delay={index * 100} animation="fade-up">
                  <Link
                    to={resource.path}
                    className="group block h-full bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-ecasi-green/30 transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
                  >
                    <div className="p-8 h-full flex flex-col">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-colors duration-300 ${resource.color} ${resource.hover}`}>
                        <Icon size={28} />
                      </div>
                      
                      <h3 className="text-2xl font-bold text-ecasi-navy mb-3 group-hover:text-ecasi-green transition-colors">
                        {resource.title}
                      </h3>
                      
                      <p className="text-gray-600 leading-relaxed mb-8 flex-grow">
                        {resource.description}
                      </p>
                      
                      <div className="mt-auto flex items-center text-sm font-semibold text-ecasi-green group-hover:text-ecasi-red transition-colors">
                        <span>Explore {resource.title}</span>
                        <ArrowRight size={16} className="ml-2 transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                </ScrollAnimation>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Call to Action */}
      <section className="bg-white py-20 border-t border-gray-100">
        <div className="max-w-[1200px] mx-auto px-4">
          <ScrollAnimation>
            <div className="bg-ecasi-section rounded-3xl p-10 md:p-16 text-center relative overflow-hidden">
              <div className="relative z-10 max-w-2xl mx-auto">
                <h2 className="text-3xl font-bold text-ecasi-navy mb-4">Need specific research data?</h2>
                <p className="text-gray-600 mb-8 text-lg">
                  Can't find what you're looking for? Reach out to our research and consultancy team for tailored insights and data.
                </p>
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center px-8 py-4 bg-ecasi-green text-white rounded-lg font-semibold hover:bg-ecasi-red transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 duration-200"
                >
                  Contact Our Team
                </Link>
              </div>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Resources;
