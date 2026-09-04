import React from 'react';
import { useLanguage } from '../context/LanguageContext';

// Government service items configured mapping directly to links
const SERVICES_DATA = [
  {
    key: 'govt.bhulekh',
    descKey: 'govt.bhulekhDesc',
    url: 'https://upbhulekh.gov.in',
    icon: '🗺️',
    color: 'from-amber-500 to-orange-600'
  },
  {
    key: 'govt.eganna',
    descKey: 'govt.egannaDesc',
    url: 'https://caneup.in',
    icon: '🌾',
    color: 'from-emerald-500 to-teal-600'
  },
  {
    key: 'govt.pmkisan',
    descKey: 'govt.pmkisanDesc',
    url: 'https://pmkisan.gov.in',
    icon: '💰',
    color: 'from-blue-500 to-indigo-600'
  },
  {
    key: 'govt.msp',
    descKey: 'govt.mspDesc',
    url: 'https://fcs.up.gov.in',
    icon: '📈',
    color: 'from-green-500 to-emerald-600'
  },
  {
    key: 'govt.kcc',
    descKey: 'govt.kccDesc',
    url: 'https://www.psbloansin59minutes.com/kisan-credit-card',
    icon: '💳',
    color: 'from-purple-500 to-indigo-600'
  },
  {
    key: 'govt.weather',
    descKey: 'govt.weatherDesc',
    url: 'https://mausam.imd.gov.in',
    icon: '☀️',
    color: 'from-sky-500 to-blue-600'
  },
  {
    key: 'govt.cropAdvisory',
    descKey: 'govt.cropAdvisoryDesc',
    url: 'https://krishi.up.gov.in',
    icon: '📋',
    color: 'from-lime-500 to-green-600'
  },
  {
    key: 'govt.helpCenter',
    descKey: 'govt.helpCenterDesc',
    url: '/help',
    isLocal: true,
    icon: '📞',
    color: 'from-rose-500 to-red-600'
  }
];

export default function GovServices() {
  const { t } = useLanguage();

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-800 rounded-2xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 text-9xl pointer-events-none font-bold">UP</div>
        <div className="relative z-10 space-y-2 max-w-2xl">
          <span className="inline-block bg-emerald-500/30 text-emerald-100 text-xs px-2.5 py-1 rounded-full uppercase tracking-wider font-semibold">
            {t('nav.govtServices')}
          </span>
          <h1 className="text-2xl md:text-3xl font-bold font-serif tracking-tight">{t('govt.title')}</h1>
          <p className="text-emerald-100 text-sm md:text-base leading-relaxed">
            {t('govt.subtitle')}
          </p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {SERVICES_DATA.map((service, index) => {
          const isLocal = service.isLocal;
          
          return (
            <a
              key={index}
              href={service.url}
              target={isLocal ? '_self' : '_blank'}
              rel="noopener noreferrer"
              className="group bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-300 flex flex-col justify-between transform hover:-translate-y-1 touch-manipulation focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <div className="space-y-4">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${service.color} text-white flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                  {service.icon}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 dark:text-gray-100 text-base group-hover:text-emerald-600 transition-colors">
                    {t(service.key)}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-xs mt-1 leading-relaxed">
                    {t(service.descKey)}
                  </p>
                </div>
              </div>
              <div className="mt-6 flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform">
                <span>{t('govt.openPortal')}</span>
                <svg className="w-3.5 h-3.5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
