import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShieldCheck, Database, Server, Code2, Globe } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-forest-900 text-slate-300 pt-16 pb-12 border-t border-forest-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand & Purpose */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-forest-700 flex items-center justify-center text-white shadow-md">
                <Heart className="w-5 h-5 fill-warm-400 text-warm-400" />
              </div>
              <span className="text-2xl font-black text-white tracking-tight">KindWave</span>
            </Link>

            <p className="text-sm text-slate-300 leading-relaxed max-w-sm">
              A modern, transparent crowdfunding and charitable donation platform engineered with the complete MERN stack. Connecting compassionate givers with transformative causes globally.
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-forest-800 text-forest-200 border border-forest-700">
                <Database className="w-3.5 h-3.5" /> MongoDB
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-forest-800 text-forest-200 border border-forest-700">
                <Server className="w-3.5 h-3.5" /> Express & Node
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-forest-800 text-forest-200 border border-forest-700">
                <Code2 className="w-3.5 h-3.5" /> React + Vite
              </span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-white transition">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/campaigns" className="hover:text-white transition">
                  All Campaigns
                </Link>
              </li>
              <li>
                <Link to="/campaigns/create" className="hover:text-white transition">
                  Start a Fundraiser
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white transition">
                  Donor Dashboard
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-white transition">
                  Admin Panel
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              Causes
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/campaigns?category=Medical" className="hover:text-white transition">
                  Medical & Healthcare
                </Link>
              </li>
              <li>
                <Link to="/campaigns?category=Education" className="hover:text-white transition">
                  Education & Literacy
                </Link>
              </li>
              <li>
                <Link to="/campaigns?category=Environment" className="hover:text-white transition">
                  Environment & Climate
                </Link>
              </li>
              <li>
                <Link to="/campaigns?category=Animal Welfare" className="hover:text-white transition">
                  Animal Welfare & Rescue
                </Link>
              </li>
              <li>
                <Link to="/campaigns?category=Community" className="hover:text-white transition">
                  Community Development
                </Link>
              </li>
              <li>
                <Link to="/campaigns?category=Emergency" className="hover:text-white transition">
                  Emergency Relief
                </Link>
              </li>
            </ul>
          </div>

          {/* Demonstration Notice */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              Project Viva Info
            </h4>
            <div className="bg-forest-800/80 rounded-2xl p-4 border border-forest-700 text-xs space-y-2.5 text-slate-300">
              <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                <ShieldCheck className="w-4 h-4" /> Academic Capstone Project
              </div>
              <p className="leading-normal">
                This web application demonstrates production-ready full-stack patterns: JWT auth, RESTful MongoDB transactions, and responsive Tailwind UI.
              </p>
              <div className="pt-2 border-t border-forest-700/60 text-slate-400">
                Demo payments simulate real Stripe/Razorpay webhook state transitions.
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-forest-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} KindWave Platform. Built for Full Stack Web Development Demonstration.</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-emerald-400" /> Desktop Localhost Deployment
            </span>
            <span>REST API Active</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
