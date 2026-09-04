import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { 
  Landmark, Search, Eye, Download, Printer, ArrowLeft, RefreshCw, AlertCircle, X, HelpCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { LoadingSpinner, SkeletonRow, SkeletonDocument } from '../components/SkeletonLoader';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const AllPlots = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { t, lang } = useLanguage();

  // Search and modal states
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedPlot, setSelectedPlot] = useState(null);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  // 1. Debounce Search Term (improves performance, reduces re-renders)
  useEffect(() => {
    setLoadingMessage(t('plots.searching'));
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setLoadingMessage('');
    }, 400); // 400ms debounce delay
    return () => clearTimeout(timer);
  }, [searchTerm, t]);

  // 2. Fetch All Plots
  const { 
    data: plots = [], 
    isLoading: isPlotsLoading,
    error: plotsError
  } = useQuery({
    queryKey: ['allPlots'],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE_URL}/plots`);
      return res.data;
    }
  });

  // 3. Fetch Selected Land Record (Khatauni) for Modal Preview
  const { 
    data: landRecordData, 
    isLoading: isRecordLoading, 
    refetch: refetchRecord,
    isRefetching: isRecordRefetching 
  } = useQuery({
    queryKey: ['landRecord', selectedPlot?._id],
    queryFn: async () => {
      if (!selectedPlot?._id) return null;
      const res = await axios.get(`${API_BASE_URL}/land-records/${selectedPlot._id}`);
      return res.data;
    },
    enabled: !!selectedPlot?._id,
  });

  const handleOpenRecord = (plot) => {
    setSelectedPlot(plot);
    setIsRecordModalOpen(true);
  };

  const handlePrintRecord = () => {
    window.print();
  };

  // Text Download layout for record
  const handleDownloadRecord = (plot, record) => {
    if (!record) return;
    const ownerName = plot.ownerId?.name || 'Unknown';
    const relation = plot.ownerId?.relation || 'Self';
    
    const content = `========================================================
MERI KHATAUNI - DIGITAL LAND RECORD CERTIFICATE
========================================================
Verification Date: ${new Date(record.verifiedAt).toLocaleString('en-IN')}
Document Ref ID  : ${record.documentId}
Bhulekh Khata Code: ${record.bhulekhCode}
--------------------------------------------------------
LAND OWNER DETAILS:
Name             : ${ownerName}
Relation         : ${relation}
--------------------------------------------------------
PLOT GEOGRAPHY DETAILS:
Village (Gram)   : ${plot.village}
Tehsil           : ${plot.tehsil}
District         : ${plot.district}
State            : ${plot.state || 'N/A'}
--------------------------------------------------------
LAND SPECIFICATIONS:
Khata Number     : ${plot.khataNo || 'N/A'}
Gata/Khasra No   : ${plot.gataNo || 'N/A'}
Fasli Year       : ${record.fasliYear}
Land Type Code   : ${record.landType}
Area (Hectares)  : ${record.areaHectares} Hect.
Revenue (Lagaan) : Rs. ${record.lagaanRevenueRs}
--------------------------------------------------------
REGISTERED SHAREHOLDERS (CO-SHARERS):
${record.shareholders.map((sh, idx) => `${idx + 1}. ${sh.name} (${sh.relation}) - Share: ${sh.share}`).join('\n')}
--------------------------------------------------------
LIABILITIES / LIENS / REMARKS:
${record.remarks}
========================================================
Disclaimer: This is a verified simulated ledger representation
of official Bhulekh data saved on Meri Khatauni.
========================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Khatauni_${plot.village}_Khata_${plot.khataNo || '0'}_Gata_${plot.gataNo || '0'}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter plots list based on search term
  const filteredPlots = plots.filter((plot) => {
    const search = debouncedSearch.toLowerCase().trim();
    if (!search) return true;

    const ownerName = (plot.ownerId?.name || '').toLowerCase();
    const village = (plot.village || '').toLowerCase();
    const khata = (plot.khataNo || '').toLowerCase();
    const gata = (plot.gataNo || '').toLowerCase();
    const district = (plot.district || '').toLowerCase();

    return (
      ownerName.includes(search) ||
      village.includes(search) ||
      khata.includes(search) ||
      gata.includes(search) ||
      district.includes(search)
    );
  });

  return (
    <div className="space-y-8 py-4 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-800 p-6 rounded-3xl border border-emerald-100/60 dark:border-gray-700 shadow-sm no-print transition-colors">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link to="/dashboard" className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-750 text-slate-500">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-gray-100">{t('plots.title')}</h1>
          </div>
          <p className="text-slate-500 dark:text-gray-400 font-medium">
            {t('plots.subtitle')}
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md w-full no-print">
        <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
          <Search className="h-5 w-5" />
        </span>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t('plots.search')}
          className="block w-full pl-11 pr-4 py-3.5 bg-white dark:bg-gray-800 dark:text-gray-100 border border-emerald-100 dark:border-gray-750 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base transition-all font-semibold shadow-sm"
        />
        {loadingMessage && (
          <span className="absolute inset-y-0 right-0 pr-4 flex items-center text-xs font-semibold text-primary animate-pulse">
            {loadingMessage}
          </span>
        )}
      </div>

      {/* Plots Table */}
      {isPlotsLoading ? (
        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-emerald-100 dark:border-gray-750 shadow-sm overflow-hidden no-print">
          <div className="p-6">
            <p className="text-sm text-slate-400 font-bold mb-4 uppercase tracking-wider">{t('common.loading')}</p>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-emerald-100/50 bg-emerald-50/20 text-slate-500 font-bold text-xs uppercase tracking-wider">
                  <th className="p-4">{t('plot.ownerName')}</th>
                  <th className="p-4">{t('plot.khataNo')}</th>
                  <th className="p-4">{t('plot.gataNo')}</th>
                  <th className="p-4">{t('plot.village')}</th>
                  <th className="p-4">{t('plots.actions')}</th>
                </tr>
              </thead>
              <tbody>
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </tbody>
            </table>
          </div>
        </div>
      ) : filteredPlots.length === 0 ? (
        <div className="text-center p-12 bg-white dark:bg-gray-800 rounded-3xl border border-emerald-100 dark:border-gray-700 shadow-sm space-y-4 no-print transition-colors">
          <Landmark className="h-12 w-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-700 dark:text-gray-200">{t('plots.noMatch')}</h3>
          <p className="text-slate-500 dark:text-gray-400 max-w-sm mx-auto text-sm">
            {t('plots.trySearch')}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-emerald-100/60 dark:border-gray-750 shadow-sm overflow-hidden no-print transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm sm:text-base">
              <thead>
                <tr className="border-b border-emerald-100/50 bg-emerald-50/20 text-slate-600 dark:text-gray-300 font-bold text-xs uppercase tracking-wider">
                  <th className="p-4 pl-6">{t('plot.ownerName')}</th>
                  <th className="p-4">{t('plot.khataNo')}</th>
                  <th className="p-4">{t('plot.gataNo')}</th>
                  <th className="p-4">{t('plot.village')}</th>
                  <th className="p-4 pr-6 text-right">{t('plots.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-gray-750 font-medium">
                {filteredPlots.map((plot) => (
                  <tr key={plot._id} className="text-slate-700 dark:text-gray-300 hover:bg-slate-50/40 dark:hover:bg-gray-750/30 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="font-bold text-slate-800 dark:text-gray-100">{plot.ownerId?.name || 'Unknown'}</div>
                      <div className="text-xs text-slate-400 dark:text-gray-500 font-semibold uppercase">{plot.ownerId?.relation === 'Self' ? t('dash.primaryOwner') : plot.ownerId?.relation || t('dash.family')}</div>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-gray-400 font-bold">{plot.khataNo || t('plot.notAvailable')}</td>
                    <td className="p-4 text-slate-600 dark:text-gray-400 font-bold">{plot.gataNo || t('plot.notAvailable')}</td>
                    <td className="p-4 font-bold text-slate-800 dark:text-gray-100">{plot.village || t('plot.notAvailable')}</td>
                    <td className="p-4 pr-6 text-right space-x-2">
                      <button
                        onClick={() => handleOpenRecord(plot)}
                        className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-primary dark:hover:bg-primary hover:text-white dark:text-emerald-400 dark:hover:text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all border border-emerald-100/30 dark:border-emerald-900/30"
                      >
                        <Eye className="h-3.5 w-3.5" /> {t('plots.view')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DETAILED LAND RECORD MODAL (KHATAUNI CERTIFICATE) */}
      {isRecordModalOpen && selectedPlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm print:absolute print:inset-0 print:bg-white print:p-0 print:z-0">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-emerald-50 dark:border-gray-700 flex flex-col print:h-auto print:max-h-full print:border-none print:shadow-none print:w-full">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-emerald-50 dark:border-gray-700 no-print">
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-gray-100 flex items-center gap-2">
                  <Landmark className="text-primary h-5 w-5" /> {t('dash.khatauniRecords')}
                </h3>
                <p className="text-xs text-slate-400 dark:text-gray-500 mt-0.5">
                  {t('plot.village')}: {selectedPlot.village} • {t('plot.khataNo')}: {selectedPlot.khataNo || t('plot.notAvailable')} • {t('plot.gataNo')}: {selectedPlot.gataNo || t('plot.notAvailable')}
                </p>
              </div>
              <button 
                onClick={() => { setIsRecordModalOpen(false); setSelectedPlot(null); }}
                className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-gray-700 hover:text-slate-600 focus:outline-none"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 md:p-8 flex-grow space-y-6 print:p-0 print:space-y-4">
              
              {isRecordLoading || isRecordRefetching ? (
                <div className="no-print">
                  <SkeletonDocument />
                  <p className="text-center text-sm font-semibold text-slate-600 dark:text-gray-400 animate-pulse mt-4">
                    {t('common.loading')}
                  </p>
                </div>
              ) : landRecordData?.record ? (
                <>
                  {/* Official Header */}
                  <div className="text-center space-y-1 pb-4 border-b border-emerald-100 dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-gray-100 tracking-tight">GOVERNMENT LAND RECORD AGENCY</h2>
                    <h3 className="text-md font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-widest">
                      Form RoC-9: Khatauni Ledger Certificate
                    </h3>
                    <div className="flex justify-center gap-8 text-xs font-semibold text-slate-500 dark:text-gray-400 pt-1">
                      <span>Doc ID: <strong className="text-slate-700 dark:text-slate-300">{landRecordData.record.documentId}</strong></span>
                      <span>Verified: <strong className="text-slate-700 dark:text-slate-300">{new Date(landRecordData.record.verifiedAt).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN')}</strong></span>
                    </div>
                  </div>

                  {/* Primary Grid info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-emerald-50/20 dark:bg-emerald-950/20 p-5 rounded-2xl border border-emerald-100/30 dark:border-emerald-900/30">
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">{t('plot.ownerName')}</h4>
                      <div className="space-y-0.5">
                        <p className="text-base font-bold text-slate-800 dark:text-gray-100">{selectedPlot.ownerId?.name || 'Unknown'}</p>
                        <p className="text-xs font-medium text-slate-500 dark:text-gray-400">
                          {t('family.relation')}: {selectedPlot.ownerId?.relation === 'Self' ? t('dash.primaryOwner') : selectedPlot.ownerId?.relation || t('dash.family')}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">{t('nav.plots')}</h4>
                      <p className="text-sm font-bold text-slate-700 dark:text-gray-300 leading-tight">
                        {t('plot.village')}: {selectedPlot.village}, {t('plot.tehsil')}: {selectedPlot.tehsil}<br />
                        {t('plot.district')}: {selectedPlot.district}, {selectedPlot.state || 'Uttar Pradesh'}
                      </p>
                    </div>
                  </div>

                  {/* Land Specifications */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-50 dark:bg-gray-900 p-4 rounded-xl border border-slate-100 dark:border-gray-700">
                      <span className="text-slate-400 block text-xs font-bold uppercase tracking-wider">{t('plot.khataNo')}</span>
                      <span className="font-extrabold text-slate-700 dark:text-gray-200 text-lg">{selectedPlot.khataNo || t('plot.notAvailable')}</span>
                    </div>
                    <div className="bg-slate-50 dark:bg-gray-900 p-4 rounded-xl border border-slate-100 dark:border-gray-700">
                      <span className="text-slate-400 block text-xs font-bold uppercase tracking-wider">{t('plot.gataNo')}</span>
                      <span className="font-extrabold text-slate-700 dark:text-gray-200 text-lg">{selectedPlot.gataNo || t('plot.notAvailable')}</span>
                    </div>
                    <div className="bg-slate-50 dark:bg-gray-900 p-4 rounded-xl border border-slate-100 dark:border-gray-700">
                      <span className="text-slate-400 block text-xs font-bold uppercase tracking-wider">Area (Hectares)</span>
                      <span className="font-extrabold text-primary dark:text-emerald-400 text-lg">{landRecordData.record.areaHectares}</span>
                    </div>
                    <div className="bg-slate-50 dark:bg-gray-900 p-4 rounded-xl border border-slate-100 dark:border-gray-700">
                      <span className="text-slate-400 block text-xs font-bold uppercase tracking-wider">Fasli Year</span>
                      <span className="font-bold text-slate-700 dark:text-gray-200 text-sm">{landRecordData.record.fasliYear}</span>
                    </div>
                  </div>

                  {/* Shareholder Table */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-gray-100 border-b border-slate-100 dark:border-gray-750 pb-1.5">Registered Co-sharers</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-gray-900 text-slate-500 dark:text-gray-400 font-semibold border-b border-slate-100 dark:border-gray-700">
                            <th className="p-3">Shareholder Name</th>
                            <th className="p-3">Relationship</th>
                            <th className="p-3 text-right">Ownership Share</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-gray-750">
                          {landRecordData.record.shareholders.map((sh, idx) => (
                            <tr key={idx} className="text-slate-700 dark:text-gray-300">
                              <td className="p-3 font-semibold">{sh.name}</td>
                              <td className="p-3 text-slate-500 dark:text-gray-400 text-xs font-medium">{sh.relation}</td>
                              <td className="p-3 text-right font-bold text-emerald-800 dark:text-emerald-400">{sh.share}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Remarks & Mortgages */}
                  <div className="bg-amber-50/30 border border-amber-100 dark:border-amber-900/35 p-4 rounded-xl flex gap-3 items-start">
                    <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-xs font-bold text-amber-800 dark:text-amber-500 uppercase tracking-wider">Liabilities & Remarks</h5>
                      <p className="text-sm text-slate-700 dark:text-gray-300 font-semibold mt-1">
                        {landRecordData.record.remarks}
                      </p>
                    </div>
                  </div>

                  {/* Print signature footer */}
                  <div className="hidden print:flex justify-between items-end pt-12 mt-12 border-t border-dashed border-slate-300">
                    <div className="text-xs text-slate-400 font-semibold">
                      This is a computer generated ledger document.<br />
                      Saved digitally on: {new Date(selectedPlot.createdAt).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN')}<br />
                      Verified via: Meri Khatauni Secure System.
                    </div>
                    <div className="text-center space-y-4">
                      <div className="h-10 w-28 border-b border-slate-300"></div>
                      <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Authorized Registrar Sign</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-8 text-center bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 font-semibold rounded-2xl no-print">
                  Failed to load details. Please try again.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {landRecordData?.record && !(isRecordLoading || isRecordRefetching) && (
              <div className="p-6 border-t border-emerald-50 dark:border-gray-700 bg-slate-50/50 dark:bg-gray-900/40 flex flex-wrap justify-between items-center gap-4 rounded-b-3xl no-print">
                <span className="text-xs font-semibold text-slate-400 dark:text-gray-500">
                  Data Source: {landRecordData.source === 'official_api' ? 'Official Bhulekh API' : 'Simulated Sandbox Ledger'}
                </span>
                
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => handleDownloadRecord(selectedPlot, landRecordData.record)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-slate-100 dark:bg-gray-700 hover:bg-slate-200 dark:hover:bg-gray-650 text-slate-700 dark:text-gray-200 font-bold text-sm px-4 py-2.5 rounded-xl border border-slate-200 dark:border-gray-600 transition-all"
                  >
                    <Download className="h-4 w-4" /> {t('dash.downloads')}
                  </button>
                  <button
                    onClick={handlePrintRecord}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-primary hover:bg-primary-light text-white font-bold text-sm px-4 py-2.5 rounded-xl shadow-sm transition-all"
                  >
                    <Printer className="h-4 w-4" /> {t('plots.print')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AllPlots;

