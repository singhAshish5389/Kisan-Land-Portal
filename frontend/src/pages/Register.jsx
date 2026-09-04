import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Landmark, User, Phone, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !mobile || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (name.trim().length < 3) {
      setError('Name must be at least 3 characters long');
      return;
    }

    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(mobile)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      await register(name.trim(), mobile, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Mobile number may already be registered.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-8">
      <div className="bg-white p-8 md:p-10 rounded-3xl border border-emerald-100 shadow-md w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
            <Landmark className="h-8 w-8" />
          </div>
          <h2 className="text-3xl font-bold text-slate-800">Register Farmer</h2>
          <p className="text-slate-600 text-sm">
            Create an account to save land and plot details securely.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-semibold">
              {error}
            </div>
          )}

          {/* Full Name Field */}
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-semibold text-slate-700">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                <User className="h-5 w-5" />
              </span>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ashish Singh"
                className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white text-base transition-all font-semibold"
                required
              />
            </div>
          </div>

          {/* Mobile Field */}
          <div className="space-y-2">
            <label htmlFor="mobile" className="block text-sm font-semibold text-slate-700">
              Mobile Number (10 Digits)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                <Phone className="h-5 w-5" />
              </span>
              <input
                id="mobile"
                type="tel"
                maxLength="10"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                placeholder="e.g. 9876543210"
                className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white text-base transition-all font-semibold"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
              Password (Min. 6 Characters)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                <Lock className="h-5 w-5" />
              </span>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="block w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white text-base transition-all font-semibold"
                required
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-light text-white font-bold text-lg py-4 rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="text-center text-sm font-medium text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline font-bold">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
