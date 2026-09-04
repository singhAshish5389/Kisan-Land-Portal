import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Landmark, ArrowRight, CheckCircle2, ShieldCheck, Zap, Share2 } from 'lucide-react';

const Home = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  return (
    <div className="space-y-16 py-6 md:py-12 animate-fadeIn">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto space-y-8 px-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-primary border border-emerald-100 rounded-full font-medium text-sm">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          {t('home.badge')}
        </div>
        
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-slate-800 leading-tight">
          {t('home.title1')} <br className="hidden sm:inline" />
          <span className="text-primary">{t('home.title2')}</span>
        </h1>
        
        <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          {t('home.subtitle')}
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
          {user ? (
            <Link
              to="/dashboard"
              className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-light text-white font-bold text-lg px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {t('home.goToDashboard')}
              <ArrowRight className="h-5 w-5" />
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-light text-white font-bold text-lg px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {t('home.registerProfile')}
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 bg-white hover:bg-emerald-50/50 text-primary font-bold text-lg px-8 py-4 rounded-2xl border-2 border-emerald-100 shadow-sm transition-all duration-200"
              >
                {t('home.signIn')}
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="bg-white rounded-3xl border border-emerald-100/60 p-8 md:p-12 shadow-sm space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl font-bold text-slate-800">{t('home.featuresTitle')}</h2>
          <p className="text-slate-600">
            {t('home.featuresSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="space-y-4 p-6 rounded-2xl bg-emerald-50/40 border border-emerald-100/20">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">{t('home.feature1Title')}</h3>
            <p className="text-slate-600 leading-relaxed text-sm">
              {t('home.feature1Desc')}
            </p>
          </div>

          {/* Feature 2 */}
          <div className="space-y-4 p-6 rounded-2xl bg-emerald-50/40 border border-emerald-100/20">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">{t('home.feature2Title')}</h3>
            <p className="text-slate-600 leading-relaxed text-sm">
              {t('home.feature2Desc')}
            </p>
          </div>

          {/* Feature 3 */}
          <div className="space-y-4 p-6 rounded-2xl bg-emerald-50/40 border border-emerald-100/20">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Share2 className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">{t('home.feature3Title')}</h3>
            <p className="text-slate-600 leading-relaxed text-sm">
              {t('home.feature3Desc')}
            </p>
          </div>
        </div>
      </section>

      {/* Instructions / Flow Section */}
      <section className="max-w-5xl mx-auto space-y-10">
        <h2 className="text-3xl font-bold text-center text-slate-800">{t('home.howToTitle')}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-3 p-4">
            <div className="mx-auto h-12 w-12 rounded-full bg-accent text-slate-900 font-bold text-xl flex items-center justify-center shadow-md">
              1
            </div>
            <h4 className="font-bold text-slate-800">{t('home.step1')}</h4>
            <p className="text-sm text-slate-500">{t('home.step1Desc')}</p>
          </div>
          
          <div className="space-y-3 p-4">
            <div className="mx-auto h-12 w-12 rounded-full bg-accent text-slate-900 font-bold text-xl flex items-center justify-center shadow-md">
              2
            </div>
            <h4 className="font-bold text-slate-800">{t('home.step2')}</h4>
            <p className="text-sm text-slate-500">{t('home.step2Desc')}</p>
          </div>

          <div className="space-y-3 p-4">
            <div className="mx-auto h-12 w-12 rounded-full bg-accent text-slate-900 font-bold text-xl flex items-center justify-center shadow-md">
              3
            </div>
            <h4 className="font-bold text-slate-800">{t('home.step3')}</h4>
            <p className="text-sm text-slate-500">{t('home.step3Desc')}</p>
          </div>

          <div className="space-y-3 p-4">
            <div className="mx-auto h-12 w-12 rounded-full bg-accent text-slate-900 font-bold text-xl flex items-center justify-center shadow-md">
              4
            </div>
            <h4 className="font-bold text-slate-800">{t('home.step4')}</h4>
            <p className="text-sm text-slate-500">{t('home.step4Desc')}</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

