import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Landmark } from 'lucide-react';


const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { t } = useLanguage();

  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-10 mt-12 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Footer Top */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 pb-8 border-b border-slate-800">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-2">
            <span className="text-2xl" role="img" aria-label="wheat">🌾</span>
            <span className="font-bold text-xl text-white tracking-tight font-sans">
              Meri <span className="text-accent">Khatauni</span>
            </span>
          </div>

          {/* Nav links */}
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm font-semibold">
            <Link to="/about" className="hover:text-white transition-all">{t('footer.about')}</Link>
            <Link to="/privacy" className="hover:text-white transition-all">{t('footer.privacy')}</Link>
            <Link to="/terms" className="hover:text-white transition-all">{t('footer.terms')}</Link>
            <Link to="/contact" className="hover:text-white transition-all">{t('footer.contact')}</Link>
            <Link to="/help" className="hover:text-white transition-all">{t('footer.help')}</Link>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-semibold">
          <p>© {currentYear} Meri Khatauni. {t('footer.rights')}</p>
          <p className="flex items-center gap-1">
            <Landmark className="h-3.5 w-3.5 text-primary-light" /> {t('footer.tagline')}
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
