import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { callsService } from '../services/api';

const CallConfigurationPage: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fromNumber, setFromNumber] = useState('');
  const [baseScript, setBaseScript] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await callsService.createCall({
        phoneNumber,
        fromNumber: '', // Always send empty value for fromNumber
        baseScript,
      });
      setSuccess('Call started successfully! You can view the progress in Call History.');
      setPhoneNumber('');
      setFromNumber('');
      setBaseScript('');
    } catch (err) {
      setError('Failed to start call. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigateToHistory = () => {
    navigate('/call-history');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <img 
              src="https://www.avrek.com/wp-content/uploads/2020/10/avrek-law-logo.png" 
              alt="Avrek Law Logo" 
              className="h-10 w-auto"
            />
            <div className="flex space-x-3">
              <button 
                onClick={navigateToHistory} 
                className="btn-secondary"
              >
                Call History
              </button>
              <button 
                onClick={handleLogout} 
                className="btn-danger"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="card">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-avrek-blue mb-2">Start New Call</h1>
            <p className="text-gray-600 text-lg">
              Configure your call script and phone number to begin an automated call
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-semibold text-avrek-blue mb-2">
                Phone Number (TO)
              </label>
              <input
                type="tel"
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter phone number (e.g., +1234567890)"
                required
                disabled={loading}
                className="input-field"
              />
            </div>
            
            {/* Temporarily commented out From Number input */}
            {/* <div>
              <label htmlFor="fromNumber" className="block text-sm font-semibold text-avrek-blue mb-2">
                From Number (Optional)
              </label>
              <input
                type="tel"
                id="fromNumber"
                value={fromNumber}
                onChange={(e) => setFromNumber(e.target.value)}
                placeholder="Enter from number (e.g., +1234567890)"
                disabled={loading}
                className="input-field"
              />
            </div> */}
            
            <div>
              <label htmlFor="baseScript" className="block text-sm font-semibold text-avrek-blue mb-2">
                Base Script
              </label>
              <textarea
                id="baseScript"
                value={baseScript}
                onChange={(e) => setBaseScript(e.target.value)}
                placeholder="Enter the script that the AI will use during the call..."
                rows={8}
                required
                disabled={loading}
                className="input-field resize-y min-h-32"
              />
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm text-center">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm text-center">
                {success}
              </div>
            )}
            
            <button 
              type="submit" 
              className="btn-primary w-full"
              disabled={loading}
            >
              {loading ? 'Starting Call...' : 'Start Call'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CallConfigurationPage;