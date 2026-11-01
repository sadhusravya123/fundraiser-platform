import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Heart,
  PlusCircle,
  User,
  Shield,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
  Compass,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
    showToast('You have been logged out safely.');
    navigate('/');
  };

  const navLinkClasses = ({ isActive }) =>
    `px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
      isActive
        ? 'text-forest-800 bg-forest-100/70 font-bold'
        : 'text-slate-600 hover:text-forest-700 hover:bg-slate-100/60'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-cream-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-forest-800 to-forest-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform duration-200">
              <Heart className="w-6 h-6 fill-warm-400 text-warm-400" />
            </div>
            <div>
              <div className="text-xl font-extrabold text-forest-800 tracking-tight leading-none group-hover:text-forest-700 transition">
                KindWave
              </div>
              <div className="text-[10px] font-semibold tracking-wider uppercase text-slate-400 mt-0.5">
                MERN Fundraiser
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5">
            <NavLink to="/" className={navLinkClasses} end>
              Home
            </NavLink>
            <NavLink to="/campaigns" className={navLinkClasses}>
              <span className="flex items-center gap-1.5">
                <Compass className="w-4 h-4" /> Explore Campaigns
              </span>
            </NavLink>
            <NavLink
              to="/campaigns/create"
              className="px-4 py-2 rounded-xl text-sm font-semibold text-forest-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4 text-forest-600" /> Start a Fundraiser
            </NavLink>
          </nav>

          {/* Desktop User Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full border border-slate-200 hover:border-forest-600 hover:bg-cream-50 transition"
                >
                  <img
                    src={
                      user.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        user.name || 'User'
                      )}&background=1B4332&color=fff`
                    }
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-forest-600/20"
                  />
                  <div className="text-left text-xs">
                    <div className="font-bold text-slate-800 truncate max-w-[110px]">
                      {user.name}
                    </div>
                    <div className="text-[10px] font-medium text-forest-700 capitalize">
                      {user.role}
                    </div>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-20 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-4 py-2.5 border-b border-slate-100">
                        <p className="text-xs text-slate-400 font-medium">Signed in as</p>
                        <p className="text-sm font-bold text-slate-800 truncate">{user.email}</p>
                      </div>

                      <Link
                        to="/dashboard"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-forest-50 hover:text-forest-800 font-medium transition"
                      >
                        <LayoutDashboard className="w-4 h-4 text-forest-600" /> User Dashboard
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-amber-900 bg-amber-50/60 hover:bg-amber-100 font-medium transition"
                        >
                          <Shield className="w-4 h-4 text-amber-600" /> Admin Console
                        </Link>
                      )}

                      <div className="border-t border-slate-100 my-1" />

                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-medium transition"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-forest-700 transition"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-bold text-white bg-forest-700 hover:bg-forest-800 rounded-xl transition shadow-sm hover:shadow"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-forest-700 hover:bg-slate-100 rounded-xl transition"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-2 duration-150">
          <NavLink
            to="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-xl text-base font-semibold text-slate-700 hover:bg-forest-50"
            end
          >
            Home
          </NavLink>
          <NavLink
            to="/campaigns"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-xl text-base font-semibold text-slate-700 hover:bg-forest-50"
          >
            Explore Campaigns
          </NavLink>
          <NavLink
            to="/campaigns/create"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-xl text-base font-semibold text-forest-800 bg-emerald-50"
          >
            Start a Fundraiser
          </NavLink>

          {isAuthenticated ? (
            <div className="pt-3 border-t border-slate-100 space-y-1">
              <div className="px-3 py-2 flex items-center gap-3">
                <img
                  src={
                    user.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      user.name || 'User'
                    )}&background=1B4332&color=fff`
                  }
                  alt={user.name}
                  className="w-9 h-9 rounded-full object-cover"
                />
                <div>
                  <div className="font-bold text-sm text-slate-800">{user.name}</div>
                  <div className="text-xs text-slate-500">{user.email}</div>
                </div>
              </div>

              <NavLink
                to="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                User Dashboard
              </NavLink>

              {isAdmin && (
                <NavLink
                  to="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-sm font-semibold text-amber-800 bg-amber-50"
                >
                  Admin Console
                </NavLink>
              )}

              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-sm font-bold text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-sm font-bold text-white bg-forest-700 rounded-xl hover:bg-forest-800"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
