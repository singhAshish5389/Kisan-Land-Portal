import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Menu, X, LogOut, User, Users, Landmark, Home, LayoutDashboard, Globe } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { lang, toggleLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navLinks = user
    ? [
        { path: '/', labelKey: 'nav.home', icon: Home },
        { path: '/dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard },
        { path: '/family', labelKey: 'nav.family', icon: Users },
        { path: '/plots', labelKey: 'nav.plots', icon: Landmark },
        { path: '/services', labelKey: 'nav.govtServices', icon: Globe },
        { path: '/profile', labelKey: 'nav.profile', icon: User },
      ]
    : [
        { path: '/', labelKey: 'nav.home', icon: Home },
        { path: '/login', labelKey: 'nav.login', icon: null },
        { path: '/register', labelKey: 'nav.register', icon: null },
      ];

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-emerald-100 shadow-sm no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl" role="img" aria-label="wheat">🌾</span>
              <span className="font-bold text-xl sm:text-2xl text-primary tracking-tight font-sans">
                Meri <span className="text-accent-dark">Khatauni</span>
              </span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    active
                      ? 'bg-emerald-50 text-primary border-b-2 border-primary shadow-sm'
                      : 'text-slate-600 hover:text-primary hover:bg-emerald-50/50'
                  }`}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  {t(link.labelKey)}
                </Link>
              );
            })}

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 ml-2 px-3 py-2 text-slate-600 hover:text-primary hover:bg-emerald-50/50 rounded-xl text-sm font-semibold border border-slate-200 transition-all duration-200"
              aria-label="Toggle language"
            >
              <span>{lang === 'hi' ? '🇮🇳' : '🇬🇧'}</span>
              <span>{lang === 'hi' ? 'English' : 'हिंदी'}</span>
            </button>

            {user && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 ml-4 px-4 py-2 bg-emerald-50 text-red-700 hover:bg-red-50 rounded-xl text-sm font-semibold border border-red-100 transition-all duration-200"
              >
                <LogOut className="h-4 w-4" />
                {t('nav.logout')}
              </button>
            )}
          </div>

          {/* Hamburger button */}
          <div className="flex md:hidden items-center gap-2">
            {/* Language Toggler for Mobile */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-2.5 py-1.5 text-slate-600 hover:text-primary hover:bg-emerald-50 rounded-xl text-xs font-semibold border border-slate-200"
              aria-label="Toggle language"
            >
              <span>{lang === 'hi' ? '🇮🇳' : '🇬🇧'}</span>
              <span>{lang === 'hi' ? 'EN' : 'हिं'}</span>
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-primary hover:bg-emerald-50 transition-all focus:outline-none"
              aria-expanded="false"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-emerald-100 animate-slideDown">
          <div className="px-2 pt-2 pb-4 space-y-1 sm:px-3">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold transition-all duration-200 ${
                    active
                      ? 'bg-primary text-white shadow-md'
                      : 'text-slate-600 hover:bg-emerald-50/50 hover:text-primary'
                  }`}
                >
                  {Icon && <Icon className="h-5 w-5" />}
                  {t(link.labelKey)}
                </Link>
              );
            })}

            {user && (
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 bg-red-50 text-red-700 hover:bg-red-100 rounded-xl text-base font-semibold border border-red-100/50 transition-all text-left"
              >
                <LogOut className="h-5 w-5" />
                {t('nav.logout')}
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

