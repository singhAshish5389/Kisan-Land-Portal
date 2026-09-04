import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { 
  Landmark, ArrowLeft, RefreshCw, Eye, Download, Printer, Plus, Trash2, X, AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { LoadingSpinner, SkeletonDocument } from '../components/SkeletonLoader';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const MemberPlots = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { t, lang } = useLanguage();

  // Selected plot for modal details
  const [selectedPlot, setSelectedPlot] = useState(null);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [refreshingPlotId, setRefreshingPlotId] = useState(null);

  // 1. Fetch Family Member Details
  const { data: familyMembers = [] } = useQuery({
    queryKey: ['familyMembers'],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE_URL}/family`);
      return res.data;
    }
  });
  const currentMember = familyMembers.find(m => m._id === id);

  // 2. Fetch Plots for this family member
  const { 
    data: plots = [], 
    isLoading: isPlotsLoading, 
    error: plotsError 
  } = useQuery({
    queryKey: ['plots', id],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE_URL}/plots?ownerId=${id}`);
      return res.data;
    }
  });

  // 3. Fetch Land Record (Khatauni) details for selected plot
  const { 
    data: landRecordData, 
    isLoading: isRecordLoading, 
    refetch: refetchLandRecord,
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

  // 4. Delete Plot Mutation
  const deletePlotMutation = useMutation({
    mutationFn: async (plotId) => {
      await axios.delete(`${API_BASE_URL}/plots/${plotId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plots', id] });
      queryClient.invalidateQueries({ queryKey: ['allPlots'] });
    },
    onError: (err) => {
      alert(err.response?.data?.message || 'Failed to delete plot');
    }
  });

  const handleOpenRecord = (plot) => {
    setSelectedPlot(plot);
    setIsRecordModalOpen(true);
  };

  const handleRefreshRecord = async (plot) => {
    setRefreshingPlotId(plot._id);
    setSelectedPlot(plot);
    setIsRecordModalOpen(true);
    await refetchLandRecord();
    setRefreshingPlotId(null);
  };

  const handleDeletePlot = (plotId) => {
    if (window.confirm(t('family.deleteConfirm') + '?')) {
      deletePlotMutation.mutate(plotId);
    }
  };

  // Plain-text land record certificate download
  const handleDownloadRecord = (plot, record) => {
    if (!record) return;
    
    const content = `========================================================
MERI KHATAUNI - DIGITAL LAND RECORD CERTIFICATE
========================================================
Verification Date: ${new Date(record.verifiedAt).toLocaleString('en-IN')}
Document Ref ID  : ${record.documentId}
Bhulekh Khata Code: ${record.bhulekhCode}
--------------------------------------------------------
LAND OWNER DETAILS:
Name             : ${currentMember?.name}
Relation         : ${currentMember?.relation || 'Self'}
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

  // Printing utility
  const handlePrintRecord = () => {
    window.print();
  };

  return (
    <div className="space-y-8 py-4 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-800 p-6 rounded-3xl border border-emerald-100/60 dark:border-gray-700 shadow-sm no-print transition-colors">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link to="/dashboard" className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-750 text-slate-500">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-gray-100">
              {currentMember ? `${currentMember.name}'s ${t('dash.myPlots')}` : t('common.loading')}
            </h1>
          </div>
          <p className="text-slate-500 dark:text-gray-400 font-medium">
            {t('plots.subtitle')}
          </p>
        </div>
        
        {currentMember && (
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-950/60 text-primary dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900 rounded-full font-bold text-sm">
            {t('family.relation')}: {currentMember.relation === 'Self' ? t('dash.primaryOwner') : currentMember.relation || t('dash.family')}
          </span>
        )}
      </div>

      {/* Plot List */}
      {isPlotsLoading ? (
        <div className="space-y-6">
          <LoadingSpinner message={t('plots.searching')} />
        </div>
      ) : plots.length === 0 ? (
        <div className="text-center p-12 bg-white dark:bg-gray-800 rounded-3xl border border-emerald-100 dark:border-gray-700 shadow-sm space-y-4 transition-colors">
          <Landmark className="h-12 w-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-700 dark:text-gray-200">{t('dash.noEntries')}</h3>
          <p className="text-slate-500 dark:text-gray-400 max-w-sm mx-auto text-sm">
            {t('dash.createProfile')}
          </p>
          <Link
            to="/dashboard"
            className="inline-block bg-primary hover:bg-primary-light text-white font-bold px-6 py-3 rounded-2xl text-sm"
          >
            {t('dash.addPlot')}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 no-print">
          {plots.map((plot, idx) => (
            <div
              key={plot._id}
              className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-emerald-100/60 dark:border-gray-700 shadow-sm hover:shadow-md transition-all flex flex-col justify-between hover:-translate-y-0.5"
            >
              {/* Plot details */}
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-primary dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/65 px-3 py-1 rounded-xl text-sm border border-emerald-100 dark:border-emerald-900">
                    {t('dash.myPlots')} #{idx + 1}
                  </span>
                  <button
                    onClick={() => handleDeletePlot(plot._id)}
                    className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-all"
                    title="Remove plot"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm md:text-base pt-2">
                  <div>
                    <span className="text-slate-400 dark:text-gray-500 font-semibold block text-xs uppercase tracking-wider">{t('plot.khataNo')}</span>
                    <span className="font-bold text-slate-700 dark:text-gray-200">{plot.khataNo || t('plot.notAvailable')}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-gray-500 font-semibold block text-xs uppercase tracking-wider">{t('plot.gataNo')}</span>
                    <span className="font-bold text-slate-700 dark:text-gray-200">{plot.gataNo || t('plot.notAvailable')}</span>
                  </div>
                  <div className="col-span-2 border-t border-slate-50 dark:border-gray-750 my-1"></div>
                  <div>
                    <span className="text-slate-400 dark:text-gray-500 font-semibold block text-xs uppercase tracking-wider">{t('plot.village')}</span>
                    <span className="font-bold text-slate-700 dark:text-gray-200">{plot.village || t('plot.notAvailable')}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-gray-500 font-semibold block text-xs uppercase tracking-wider">{t('plot.tehsil')}</span>
                    <span className="font-bold text-slate-700 dark:text-gray-200">{plot.tehsil || t('plot.notAvailable')}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-gray-500 font-semibold block text-xs uppercase tracking-wider">{t('plot.district')}</span>
                    <span className="font-bold text-slate-700 dark:text-gray-200">{plot.district || t('plot.notAvailable')}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-gray-500 font-semibold block text-xs uppercase tracking-wider">State</span>
                    <span className="font-bold text-slate-700 dark:text-gray-200">{plot.state || 'Uttar Pradesh'}</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-3 border-t border-slate-100 dark:border-gray-700 pt-5 mt-6">
                <button
                  onClick={() => handleOpenRecord(plot)}
                  className="flex items-center justify-center gap-1.5 bg-primary hover:bg-primary-light text-white font-bold text-sm py-3 px-4 rounded-xl shadow-sm transition-all"
                >
                  <Eye className="h-4 w-4" /> {t('plots.view')}
                </button>
                <button
                  onClick={() => handleRefreshRecord(plot)}
                  className="flex items-center justify-center gap-1.5 bg-slate-50 dark:bg-gray-700 hover:bg-slate-100 dark:hover:bg-gray-650 text-slate-700 dark:text-gray-200 border border-slate-200 dark:border-gray-600 font-bold text-sm py-3 px-4 rounded-xl transition-all"
                >
                  <RefreshCw className="h-4 w-4" /> {lang === 'hi' ? 'ताज़ा करें' : 'Refresh'}
                </button>
              </div>
            </div>
          ))}
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
                        <p className="text-base font-bold text-slate-800 dark:text-gray-100">{currentMember?.name}</p>
                        <p className="text-xs font-medium text-slate-500 dark:text-gray-400">
                          {t('family.relation')}: {currentMember?.relation === 'Self' ? t('dash.primaryOwner') : currentMember?.relation || t('dash.family')}
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

export default MemberPlots;

