import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  User, Phone, Lock, Eye, EyeOff, Loader2, Image, CheckCircle, Info, Landmark, ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { user, updateProfile } = useAuth();

  // Form states
  const [name, setName] = useState(user?.name || '');
  const [mobile, setMobile] = useState(user?.mobile || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(user?.profilePhoto || '');

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        setError('Photo size should be less than 3MB');
        return;
      }
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim() || !mobile.trim()) {
      setError('Name and Mobile number are required');
      return;
    }

    if (password && password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (password && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(mobile)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('mobile', mobile.trim());
      if (password) {
        formData.append('password', password);
      }
      if (photo) {
        formData.append('profilePhoto', photo);
      }

      await updateProfile(formData);
      setSuccess('Profile updated successfully!');
      setPassword('');
      setConfirmPassword('');
      setPhoto(null);
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const getAvatarUrl = (photoUrl) => {
    return photoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'Farmer')}&backgroundColor=1b5e20&textColor=ffffff`;
  };

  return (
    <div className="max-w-2xl mx-auto py-4 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4 bg-white p-6 rounded-3xl border border-emerald-100/60 shadow-sm">
        <Link to="/dashboard" className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">My Profile</h1>
          <p className="text-slate-500 font-medium">Update your credentials and management settings.</p>
        </div>
      </div>

      {/* Profile Form Card */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-emerald-100/60 shadow-sm space-y-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {success && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-primary rounded-xl text-sm font-semibold flex items-center gap-2">
              <CheckCircle className="h-5 w-5" /> {success}
            </div>
          )}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-semibold flex items-center gap-2">
              <Info className="h-5 w-5" /> {error}
            </div>
          )}

          {/* Photo upload section */}
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100">
            <img
              src={getAvatarUrl(photoPreview)}
              alt="Farmer Profile Avatar"
              onError={(e) => {
                e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || 'Farmer')}&backgroundColor=1b5e20&textColor=ffffff`;
              }}
              className="h-24 w-24 rounded-full object-cover border border-emerald-100 shadow-md bg-white"
            />
            <div className="space-y-2 text-center sm:text-left w-full">
              <label className="block text-sm font-bold text-slate-700">Change Profile Photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-primary hover:file:bg-emerald-100 cursor-pointer"
              />
              <span className="text-xs text-slate-400 block font-medium">Max size: 3MB (Optional profile photo only)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="space-y-2">
              <label htmlFor="profileName" className="block text-sm font-semibold text-slate-700">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                  <User className="h-5 w-5" />
                </span>
                <input
                  id="profileName"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white text-base font-semibold"
                  required
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div className="space-y-2">
              <label htmlFor="profileMobile" className="block text-sm font-semibold text-slate-700">
                Mobile Number
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                  <Phone className="h-5 w-5" />
                </span>
                <input
                  id="profileMobile"
                  type="tel"
                  maxLength="10"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                  className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white text-base font-semibold"
                  required
                />
              </div>
            </div>
          </div>

          {/* Password Section */}
          <div className="border-t border-slate-100 pt-6 space-y-4">
            <h3 className="text-md font-bold text-slate-700">Change Password (Leave blank to keep current)</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="profilePass" className="block text-sm font-semibold text-slate-700">
                  New Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                    <Lock className="h-5 w-5" />
                  </span>
                  <input
                    id="profilePass"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white text-base font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="profileConfirm" className="block text-sm font-semibold text-slate-700">
                  Confirm Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                    <Lock className="h-5 w-5" />
                  </span>
                  <input
                    id="profileConfirm"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white text-base font-semibold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-light text-white font-bold text-lg py-4 rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-75 disabled:cursor-not-allowed pt-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Updating Profile...
              </>
            ) : (
              'Save Profile Changes'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
