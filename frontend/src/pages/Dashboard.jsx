import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

import { 
  Users, Landmark, Calendar, Plus, ChevronRight, X, Loader2, Info
} from 'lucide-react';
import { SkeletonCard, LoadingSpinner } from '../components/SkeletonLoader';
import SearchableDropdown from '../components/SearchableDropdown';
import upDistricts from '../data/upDistricts';
import upTehsils from '../data/upTehsils';


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const Dashboard = () => {
  const { user } = useAuth();
  const { lang, t } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Modal states
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isPlotModalOpen, setIsPlotModalOpen] = useState(false);

  // Form states - Member
  const [memberName, setMemberName] = useState('');
  const [memberRelation, setMemberRelation] = useState('');
  const [memberPhoto, setMemberPhoto] = useState(null);
  const [memberPhotoPreview, setMemberPhotoPreview] = useState('');
  const [memberError, setMemberError] = useState('');

  // Form states - Plot
  const [plotOwnerId, setPlotOwnerId] = useState('');
  const [plotKhata, setPlotKhata] = useState('');
  const [plotGata, setPlotGata] = useState('');
  const [plotVillage, setPlotVillage] = useState('');
  const [plotTehsil, setPlotTehsil] = useState('');
  const [plotDistrict, setPlotDistrict] = useState('');
  const [plotState, setPlotState] = useState('Uttar Pradesh');
  const [plotError, setPlotError] = useState('');

  // 1. Fetch Family Members
  const { 
    data: familyMembers = [], 
    isLoading: isFamilyLoading,
    error: familyFetchError
  } = useQuery({
    queryKey: ['familyMembers'],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE_URL}/family`);
      return res.data;
    }
  });

  // 2. Fetch All Plots
  const { 
    data: allPlots = [], 
    isLoading: isPlotsLoading,
    error: plotsFetchError
  } = useQuery({
    queryKey: ['allPlots'],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE_URL}/plots`);
      return res.data;
    }
  });

  // 3. Mutation to add Family Member
  const addMemberMutation = useMutation({
    mutationFn: async (formData) => {
      const res = await axios.post(`${API_BASE_URL}/family`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['familyMembers'] });
      setIsMemberModalOpen(false);
      resetMemberForm();
    },
    onError: (err) => {
      setMemberError(err.response?.data?.message || 'Failed to add family member');
    }
  });

  // 4. Mutation to add Plot
  const addPlotMutation = useMutation({
    mutationFn: async (plotData) => {
      const res = await axios.post(`${API_BASE_URL}/plots`, plotData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allPlots'] });
      setIsPlotModalOpen(false);
      resetPlotForm();
    },
    onError: (err) => {
      setPlotError(err.response?.data?.message || 'Failed to save plot details');
    }
  });

  const resetMemberForm = () => {
    setMemberName('');
    setMemberRelation('');
    setMemberPhoto(null);
    setMemberPhotoPreview('');
    setMemberError('');
  };

  const resetPlotForm = () => {
    setPlotOwnerId('');
    setPlotKhata('');
    setPlotGata('');
    setPlotVillage('');
    setPlotTehsil('');
    setPlotDistrict('');
    setPlotState('Uttar Pradesh');
    setPlotError('');
  };

  const handleMemberPhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        setMemberError(t('common.imageSize'));
        return;
      }
      setMemberPhoto(file);
      setMemberPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleMemberSubmit = (e) => {
    e.preventDefault();
    setMemberError('');
    if (!memberName) {
      setMemberError(t('common.nameRequired'));
      return;
    }

    const formData = new FormData();
    formData.append('name', memberName.trim());
    formData.append('relation', memberRelation.trim());
    if (memberPhoto) {
      formData.append('photo', memberPhoto);
    }

    addMemberMutation.mutate(formData);
  };

  const handlePlotSubmit = (e) => {
    e.preventDefault();
    setPlotError('');
    if (!plotOwnerId || !plotKhata || !plotGata || !plotVillage || !plotTehsil || !plotDistrict) {
      setPlotError(t('plot.fillRequired'));
      return;
    }

    addPlotMutation.mutate({
      ownerId: plotOwnerId,
      khataNo: plotKhata.trim(),
      gataNo: plotGata.trim(),
      village: plotVillage.trim(),
      tehsil: plotTehsil.trim(),
      district: plotDistrict.trim(),
      state: plotState.trim(),
    });
  };

  // Compute Statistics
  const totalFamily = familyMembers.length;
  const totalPlotsCount = allPlots.length;

  const getLastUpdatedTime = () => {
    if (allPlots.length === 0 && familyMembers.length === 0) {
      return t('dash.noEntries');
    }
    const plotDates = allPlots.map(p => new Date(p.updatedAt).getTime());
    const memberDates = familyMembers.map(m => new Date(m.updatedAt).getTime());
    const allDates = [...plotDates, ...memberDates];
    
    if (allDates.length === 0) return t('dash.noEntries');
    
    const maxDate = new Date(Math.max(...allDates));
    return maxDate.toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helper for profile avatars
  const getAvatarUrl = (photo) => {
    return photo || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent('Farmer')}&backgroundColor=1b5e20&textColor=ffffff`;
  };

  const isPageLoading = isFamilyLoading || isPlotsLoading;

  // Render government service cards
  const services = [
    { nameHi: 'UP भूलेख', nameEn: 'UP Bhulekh', url: 'https://upbhulekh.gov.in', icon: '🗺️', color: 'from-amber-500 to-orange-600' },
    { nameHi: 'ई-गन्ना', nameEn: 'E-Ganna', url: 'https://caneup.in', icon: '🌾', color: 'from-emerald-500 to-teal-600' },
    { nameHi: 'PM-किसान', nameEn: 'PM-Kisan', url: 'https://pmkisan.gov.in', icon: '💰', color: 'from-blue-500 to-indigo-600' },
    { nameHi: 'UP धान/गेहूं MSP पंजीकरण', nameEn: 'UP Dhan/Gehu MSP', url: 'https://fcs.up.gov.in', icon: '📈', color: 'from-green-500 to-emerald-600' },
  ];

  return (
    <div className="space-y-10 py-4 animate-fadeIn">
      {/* Welcome & Greetings */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-800 p-6 rounded-3xl border border-emerald-100/60 dark:border-gray-700 shadow-sm transition-colors duration-200">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-gray-100">
            {t('dash.welcome')}, <span className="text-primary dark:text-emerald-400">{user?.name}</span>
          </h1>
          <p className="text-slate-500 dark:text-gray-400 font-medium mt-1">
            {t('dash.subtitle')}
          </p>
        </div>
        <div className="flex flex-wrap gap-3 w-full sm:w-auto">
          <button
            onClick={() => setIsMemberModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-primary hover:bg-primary-light text-white font-bold px-5 py-3 rounded-2xl text-sm shadow-sm transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus className="h-4 w-4" /> {t('dash.addMember')}
          </button>
          <button
            onClick={() => setIsPlotModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-accent hover:bg-amber-500 text-slate-900 font-bold px-5 py-3 rounded-2xl text-sm shadow-sm transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus className="h-4 w-4" /> {t('dash.addPlot')}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-emerald-100/60 dark:border-gray-700 shadow-sm flex items-center gap-4 transition-colors">
          <div className="h-14 w-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/55 text-primary dark:text-emerald-400 flex items-center justify-center">
            <Users className="h-7 w-7" />
          </div>
          <div>
            <p className="text-slate-500 dark:text-gray-400 text-sm font-semibold">{t('dash.totalFamily')}</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-gray-100">{isPageLoading ? '...' : totalFamily}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-emerald-100/60 dark:border-gray-700 shadow-sm flex items-center gap-4 transition-colors">
          <div className="h-14 w-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/55 text-primary dark:text-emerald-400 flex items-center justify-center">
            <Landmark className="h-7 w-7" />
          </div>
          <div>
            <p className="text-slate-500 dark:text-gray-400 text-sm font-semibold">{t('dash.totalPlots')}</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-gray-100">{isPageLoading ? '...' : totalPlotsCount}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-emerald-100/60 dark:border-gray-700 shadow-sm flex items-center gap-4 transition-colors">
          <div className="h-14 w-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/55 text-primary dark:text-emerald-400 flex items-center justify-center">
            <Calendar className="h-7 w-7" />
          </div>
          <div>
            <p className="text-slate-500 dark:text-gray-400 text-sm font-semibold">{t('dash.lastUpdated')}</p>
            <p className="text-base font-bold text-slate-800 dark:text-gray-100 line-clamp-1">
              {isPageLoading ? t('common.loading') : getLastUpdatedTime()}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Access to Government Services (Bilingual support added) */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-gray-100">{t('dash.govtServices')}</h2>
          <Link to="/services" className="text-primary hover:underline font-bold text-sm flex items-center gap-1">
            {t('plots.view')} {t('nav.govtServices')} <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {services.map((service, index) => (
            <a
              key={index}
              href={service.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white dark:bg-gray-800 border border-emerald-100/60 dark:border-gray-700 rounded-2xl p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-all group hover:-translate-y-0.5 cursor-pointer"
            >
              <span className={`w-10 h-10 rounded-xl bg-gradient-to-br ${service.color} text-white flex items-center justify-center text-lg mb-4 shadow-inner`}>
                {service.icon}
              </span>
              <div>
                <p className="font-bold text-slate-800 dark:text-gray-200 text-sm group-hover:text-primary transition-colors">
                  {lang === 'hi' ? service.nameHi : service.nameEn}
                </p>
                <span className="text-[10px] text-primary font-bold inline-flex items-center gap-0.5 mt-1">
                  {t('govt.openPortal')} <ChevronRight className="h-2.5 w-2.5" />
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Family Member Section */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-gray-100">{t('dash.landRecords')}</h2>
          <Link to="/family" className="text-primary hover:underline font-bold text-sm flex items-center gap-1">
            {t('dash.manageFamily')} <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {isPageLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : familyMembers.length === 0 ? (
          <div className="text-center p-12 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-emerald-200 dark:border-gray-700 space-y-4 transition-colors">
            <Users className="h-12 w-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-700 dark:text-gray-200">{t('dash.noProfiles')}</h3>
            <p className="text-slate-500 dark:text-gray-400 max-w-sm mx-auto text-sm">
              {t('dash.createProfile')}
            </p>
            <button
              onClick={() => setIsMemberModalOpen(true)}
              className="bg-primary hover:bg-primary-light text-white font-bold px-6 py-3 rounded-2xl text-sm"
            >
              {t('dash.addMemberProfile')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {familyMembers.map((member) => {
              const plotsCount = allPlots.filter(p => p.ownerId?._id === member._id || p.ownerId === member._id).length;
              return (
                <div
                  key={member._id}
                  className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-emerald-100/50 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between hover:-translate-y-0.5"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <img
                      src={getAvatarUrl(member.photo)}
                      alt={member.name}
                      onError={(e) => {
                        e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(member.name)}&backgroundColor=1b5e20&textColor=ffffff`;
                      }}
                      className="h-14 w-14 rounded-full object-cover border border-emerald-100 dark:border-gray-700 shadow-inner"
                    />
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-gray-100 text-lg leading-tight">{member.name}</h3>
                      <span className="inline-block text-xs font-semibold px-2 py-0.5 mt-1 bg-emerald-50 dark:bg-emerald-950/50 text-primary dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900 rounded-md">
                        {member.relation === 'Self' ? t('dash.primaryOwner') : member.relation || t('dash.family')}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-t border-slate-50 dark:border-gray-750 pt-4 mt-auto">
                    <span className="text-sm font-semibold text-slate-500 dark:text-gray-400">
                      {plotsCount} {t('dash.plotSaved')}
                    </span>
                    <button
                      onClick={() => navigate(`/family/${member._id}/plots`)}
                      className="bg-emerald-50 hover:bg-primary hover:text-white dark:bg-emerald-950 dark:text-emerald-400 dark:hover:bg-emerald-500 dark:hover:text-white text-primary font-bold text-sm px-4 py-2.5 rounded-xl transition-all"
                    >
                      {t('dash.viewPlots')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL 1: ADD FAMILY MEMBER */}
      {isMemberModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-emerald-50">
            <div className="flex justify-between items-center p-6 border-b border-emerald-50">
              <h3 className="text-xl font-bold text-slate-800">Add Family Member</h3>
              <button 
                onClick={() => { setIsMemberModalOpen(false); resetMemberForm(); }}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleMemberSubmit} className="p-6 space-y-6">
              {memberError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-semibold">
                  {memberError}
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Full Name *</label>
                <input
                  type="text"
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  placeholder="e.g. Ram Singh"
                  className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white text-base font-semibold"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Relation (Optional)</label>
                <input
                  type="text"
                  value={memberRelation}
                  onChange={(e) => setMemberRelation(e.target.value)}
                  placeholder="e.g. Spouse, Son, Father"
                  className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white text-base font-semibold"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Photo (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleMemberPhotoChange}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-primary hover:file:bg-emerald-100"
                />
                {memberPhotoPreview && (
                  <img
                    src={memberPhotoPreview}
                    alt="Preview"
                    className="mt-3 h-20 w-20 rounded-full object-cover border border-emerald-100"
                  />
                )}
              </div>

              <button
                type="submit"
                disabled={addMemberMutation.isPending}
                className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-light text-white font-bold text-lg py-3.5 rounded-2xl transition-all disabled:opacity-75"
              >
                {addMemberMutation.isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" /> Saving Member...
                  </>
                ) : (
                  'Save Member'
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD PLOT */}
      {isPlotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-emerald-50">
            <div className="flex justify-between items-center p-6 border-b border-emerald-50">
              <h3 className="text-xl font-bold text-slate-800">Add Plot Land Details</h3>
              <button 
                onClick={() => { setIsPlotModalOpen(false); resetPlotForm(); }}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handlePlotSubmit} className="p-6 space-y-5">
              {plotError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-semibold">
                  {plotError}
                </div>
              )}

              {/* Owner Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Select Land Owner *</label>
                <select
                  value={plotOwnerId}
                  onChange={(e) => setPlotOwnerId(e.target.value)}
                  className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white text-base font-semibold"
                  required
                >
                  <option value="">-- Choose Family Member --</option>
                  {familyMembers.map(m => (
                    <option key={m._id} value={m._id}>{m.name} {m.relation ? `(${m.relation})` : ''}</option>
                  ))}
                </select>
              </div>

              {/* Numbers */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">Khata Number *</label>
                  <input
                    type="text"
                    value={plotKhata}
                    onChange={(e) => setPlotKhata(e.target.value)}
                    placeholder="e.g. 15"
                    className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white text-base font-semibold"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">Gata / Khasra *</label>
                  <input
                    type="text"
                    value={plotGata}
                    onChange={(e) => setPlotGata(e.target.value)}
                    placeholder="e.g. 101"
                    className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white text-base font-semibold"
                    required
                  />
                </div>
              </div>

              {/* Geographic Info */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Village / Gram *</label>
                <input
                  type="text"
                  value={plotVillage}
                  onChange={(e) => setPlotVillage(e.target.value)}
                  placeholder="e.g. Rampur"
                  className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white text-base font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">{t('plot.district')}</label>
                  <SearchableDropdown
                    options={upDistricts}
                    value={plotDistrict}
                    onChange={(val) => {
                      setPlotDistrict(val);
                      setPlotTehsil(''); // Clear tehsil when district changes
                    }}
                    placeholder={t('plot.selectDistrict')}
                    searchPlaceholder={t('plot.searchDistrict')}
                    emptyMessage={t('plots.noMatch')}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">{t('plot.tehsil')}</label>
                  <SearchableDropdown
                    options={plotDistrict ? (upTehsils[plotDistrict] || []) : []}
                    value={plotTehsil}
                    onChange={(val) => setPlotTehsil(val)}
                    placeholder={plotDistrict ? t('plot.selectTehsil') : t('plot.selectDistrictFirst')}
                    searchPlaceholder={t('plot.searchTehsil')}
                    emptyMessage={t('plots.noMatch')}
                    disabled={!plotDistrict}
                  />
                </div>
              </div>


              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">State (Optional)</label>
                <input
                  type="text"
                  value={plotState}
                  onChange={(e) => setPlotState(e.target.value)}
                  placeholder="e.g. Uttar Pradesh"
                  className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white text-base font-semibold"
                />
              </div>

              <button
                type="submit"
                disabled={addPlotMutation.isPending}
                className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-light text-white font-bold text-lg py-3.5 rounded-2xl transition-all disabled:opacity-75"
              >
                {addPlotMutation.isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" /> Saving Plot...
                  </>
                ) : (
                  'Save Plot Details'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
