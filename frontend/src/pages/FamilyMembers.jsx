import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { 
  Users, Trash2, Plus, UserPlus, FileText, Image, Loader2, ArrowLeft, Info, HelpCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner, SkeletonCard } from '../components/SkeletonLoader';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const FamilyMembers = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Form state
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('');
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formOpen, setFormOpen] = useState(false);

  // 1. Fetch Family Members
  const { 
    data: members = [], 
    isLoading,
    error: fetchError
  } = useQuery({
    queryKey: ['familyMembers'],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE_URL}/family`);
      return res.data;
    }
  });

  // 2. Fetch All Plots to calculate count per member
  const { data: allPlots = [] } = useQuery({
    queryKey: ['allPlots'],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE_URL}/plots`);
      return res.data;
    }
  });

  // 3. Add Mutation
  const addMutation = useMutation({
    mutationFn: async (formData) => {
      const res = await axios.post(`${API_BASE_URL}/family`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['familyMembers'] });
      setSuccess('Family member added successfully!');
      setName('');
      setRelation('');
      setPhoto(null);
      setPhotoPreview('');
      setFormOpen(false);
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (err) => {
      setError(err.response?.data?.message || 'Failed to add family member');
      setTimeout(() => setError(''), 5000);
    }
  });

  // 4. Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (memberId) => {
      const res = await axios.delete(`${API_BASE_URL}/family/${memberId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['familyMembers'] });
      queryClient.invalidateQueries({ queryKey: ['allPlots'] });
      setSuccess('Family member and associated plots deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (err) => {
      setError(err.response?.data?.message || 'Failed to delete member');
      setTimeout(() => setError(''), 5000);
    }
  });

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        setError('Photo size should be less than 3MB');
        return;
      }
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name) {
      setError('Name is required');
      return;
    }

    const formData = new FormData();
    formData.append('name', name.trim());
    formData.append('relation', relation.trim());
    if (photo) {
      formData.append('photo', photo);
    }

    addMutation.mutate(formData);
  };

  const handleDelete = (member) => {
    if (member.relation === 'Self') {
      setError('You cannot delete your own primary profile');
      setTimeout(() => setError(''), 4000);
      return;
    }

    const plotsCount = allPlots.filter(p => p.ownerId?._id === member._id || p.ownerId === member._id).length;
    const confirmMsg = plotsCount > 0 
      ? `Are you sure you want to delete ${member.name}? This will permanently delete their details and all their ${plotsCount} saved plots.`
      : `Are you sure you want to delete ${member.name}?`;

    if (window.confirm(confirmMsg)) {
      deleteMutation.mutate(member._id);
    }
  };

  const getAvatarUrl = (photo) => {
    return photo || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent('Farmer')}&backgroundColor=1b5e20&textColor=ffffff`;
  };

  return (
    <div className="space-y-8 py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-emerald-100/60 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link to="/dashboard" className="p-1 rounded-lg hover:bg-slate-100 text-slate-500">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-3xl font-bold text-slate-800">Family Members</h1>
          </div>
          <p className="text-slate-500 font-medium">
            Manage profile cards for yourself and other joint land owners.
          </p>
        </div>
        <button
          onClick={() => setFormOpen(!formOpen)}
          className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-light text-white font-bold px-6 py-3.5 rounded-2xl text-sm transition-all"
        >
          {formOpen ? 'Hide Form' : 'Add Family Member'}
        </button>
      </div>

      {/* Notifications */}
      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-primary rounded-2xl text-sm font-semibold flex items-center gap-2 shadow-sm">
          <Info className="h-5 w-5" /> {success}
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm font-semibold flex items-center gap-2 shadow-sm">
          <Info className="h-5 w-5" /> {error}
        </div>
      )}

      {/* Add Member Form Panel */}
      {formOpen && (
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-emerald-100 shadow-md max-w-xl">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <UserPlus className="text-primary h-6 w-6" /> Enter Family Member Details
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Full Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ram Singh"
                  className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white text-base font-semibold"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Relation (Optional)</label>
                <input
                  type="text"
                  value={relation}
                  onChange={(e) => setRelation(e.target.value)}
                  placeholder="e.g. Brother, Wife, Mother"
                  className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white text-base font-semibold"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Profile Photo (Optional)</label>
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-primary hover:file:bg-emerald-100 cursor-pointer"
                />
                {photoPreview && (
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="h-16 w-16 rounded-full object-cover border border-emerald-100 shadow-inner"
                  />
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={addMutation.isPending}
                className="bg-primary hover:bg-primary-light text-white font-bold px-6 py-3 rounded-2xl text-sm transition-all flex items-center justify-center gap-2"
              >
                {addMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Save Member
              </button>
              <button
                type="button"
                onClick={() => { setFormOpen(false); resetForm(); }}
                className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold px-6 py-3 rounded-2xl text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Members Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : members.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-3xl border border-emerald-100 shadow-sm space-y-4">
          <Users className="h-12 w-12 text-slate-300 mx-auto" />
          <p className="text-slate-500 font-medium">No family members found. Please add a member to begin.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {members.map((member) => {
            const plotsCount = allPlots.filter(p => p.ownerId?._id === member._id || p.ownerId === member._id).length;
            const isPrimary = member.relation === 'Self';

            return (
              <div
                key={member._id}
                className="bg-white p-6 rounded-3xl border border-emerald-100/50 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <img
                      src={getAvatarUrl(member.photo)}
                      alt={member.name}
                      onError={(e) => {
                        e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(member.name)}&backgroundColor=1b5e20&textColor=ffffff`;
                      }}
                      className="h-14 w-14 rounded-full object-cover border border-emerald-100 shadow-inner"
                    />
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg leading-tight">{member.name}</h3>
                      <span className="inline-block text-xs font-semibold px-2 py-0.5 mt-1 bg-emerald-50 text-primary border border-emerald-100 rounded-md">
                        {isPrimary ? 'Primary Owner' : member.relation || 'Family Member'}
                      </span>
                    </div>
                  </div>
                  {!isPrimary && (
                    <button
                      onClick={() => handleDelete(member)}
                      disabled={deleteMutation.isPending}
                      className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all focus:outline-none"
                      title="Delete family member"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}
                </div>

                <div className="flex justify-between items-center border-t border-slate-50 pt-4 mt-auto">
                  <span className="text-sm font-semibold text-slate-500">
                    {plotsCount} {plotsCount === 1 ? 'Plot' : 'Plots'} Saved
                  </span>
                  <Link
                    to={`/family/${member._id}/plots`}
                    className="bg-emerald-50 hover:bg-primary hover:text-white text-primary font-bold text-sm px-4 py-2.5 rounded-xl transition-all"
                  >
                    View Plots
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FamilyMembers;
