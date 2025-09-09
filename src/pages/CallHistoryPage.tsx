import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { callsService } from '../services/api';
import { Call } from '../types';
import CallDetailsModal from '../components/CallDetailsModal';

const CallHistoryPage: React.FC = () => {
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'completed' | 'active'>('completed');
  const [filteredCalls, setFilteredCalls] = useState<Call[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCallId, setSelectedCallId] = useState<number | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string>('');
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCalls();
    // Set up polling for real-time updates
    const interval = setInterval(fetchCalls, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Filter calls based on active tab and search
    let filtered = calls;
    
    if (activeTab === 'completed') {
      filtered = calls.filter(call => call.status === 'Completed');
    } else {
      filtered = calls.filter(call => call.status !== 'Completed');
    }
    
    if (searchTerm) {
      filtered = filtered.filter(call => 
        call.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        call.fromNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        call.blandCallId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredCalls(filtered);
  }, [calls, activeTab, searchTerm]);

  const fetchCalls = async () => {
    try {
      const data = await callsService.getCalls();
      setCalls(data);
    } catch (err) {
      console.error('Failed to fetch call history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayRecording = (recordingUrl: string) => {
    if (recordingUrl) {
      window.open(recordingUrl, '_blank');
    }
  };

  const handleDownloadRecording = (recordingUrl: string, callId: number) => {
    if (recordingUrl) {
      const a = document.createElement('a');
      a.href = recordingUrl;
      a.download = `recording-${callId}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleViewDetails = (callId: number) => {
    setSelectedCallId(callId);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedCallId(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigateToConfig = () => {
    navigate('/call-configuration');
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear all calls? This action cannot be undone.')) {
      return;
    }

    setIsClearing(true);
    try {
      const result = await callsService.clearAllCalls();
      setSyncResult(`Cleared ${result.deletedCount} calls successfully`);
      await fetchCalls(); // Refresh the list
    } catch (error) {
      setSyncResult('Failed to clear calls');
      console.error('Failed to clear calls:', error);
    } finally {
      setIsClearing(false);
    }
  };

  const handleSyncWithBlandAi = async () => {
    setIsSyncing(true);
    setSyncResult('');
    
    console.log('🔄 Starting sync with Bland.ai...');
    console.log('🔑 Token from localStorage:', localStorage.getItem('token') ? 'Present' : 'Missing');
    
    try {
      console.log('📡 Making API call to /calls/sync...');
      const result = await callsService.syncWithBlandAi();
      
      console.log('✅ Sync API response:', result);
      setSyncResult(`Sync completed: ${result.syncedCount} synced, ${result.createdCount} created, ${result.updatedCount} updated`);
      
      console.log('🔄 Refreshing calls list...');
      await fetchCalls(); // Refresh the list
      console.log('✅ Calls list refreshed');
      
    } catch (error) {
      console.error('❌ Sync failed with error:', error);
      console.error('❌ Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers
      });
      
      if (error.response?.status === 401) {
        setSyncResult('Authentication failed. Please login again.');
        console.log('🔐 Authentication error - redirecting to login...');
        logout();
        navigate('/login');
      } else if (error.response?.status === 500) {
        setSyncResult('Server error during sync. Check backend logs.');
      } else {
        setSyncResult(`Failed to sync with Bland.ai: ${error.message}`);
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      })
    };
  };

  const formatDuration = (duration?: number) => {
    if (!duration) return '0m 0s';
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}m ${seconds}s`;
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'Completed':
        return {
          class: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: '✓',
          dot: 'bg-emerald-500'
        };
      case 'In Progress':
        return {
          class: 'bg-amber-50 text-amber-700 border-amber-200',
          icon: '⏳',
          dot: 'bg-amber-500'
        };
      case 'Not Answered':
        return {
          class: 'bg-red-50 text-red-700 border-red-200',
          icon: '✗',
          dot: 'bg-red-500'
        };
      default:
        return {
          class: 'bg-gray-50 text-gray-700 border-gray-200',
          icon: '?',
          dot: 'bg-gray-500'
        };
    }
  };

  const getCallIdShort = (blandCallId?: string) => {
    if (!blandCallId) return 'N/A';
    return `${blandCallId.substring(0, 8)}...`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-avrek-blue border-t-transparent mx-auto mb-6"></div>
          <p className="text-slate-600 text-lg font-medium">Loading call history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <img 
                src="https://www.avrek.com/wp-content/uploads/2020/10/avrek-law-logo.png" 
                alt="Avrek Law Logo" 
                className="h-10 w-auto"
              />
              <div className="hidden md:block">
                <h1 className="text-xl font-bold text-slate-800">Call Management</h1>
                <p className="text-sm text-slate-500">Automated call tracking & analytics</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={navigateToConfig} 
                className="bg-gradient-to-r from-avrek-blue to-avrek-dark-blue text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
              >
                <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                New Call
              </button>
              <button 
                onClick={handleLogout} 
                className="bg-white text-slate-600 px-4 py-2.5 rounded-xl font-medium border border-slate-200 hover:bg-slate-50 transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Calls</p>
                <p className="text-3xl font-bold text-slate-900">{calls.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Completed</p>
                <p className="text-3xl font-bold text-emerald-600">{calls.filter(c => c.status === 'Completed').length}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">In Progress</p>
                <p className="text-3xl font-bold text-amber-600">{calls.filter(c => c.status === 'In Progress').length}</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Not Answered</p>
                <p className="text-3xl font-bold text-red-600">{calls.filter(c => c.status === 'Not Answered').length}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Call History</h2>
                <p className="text-slate-600 mt-1">Track and manage your automated calls</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search calls..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-avrek-blue focus:border-transparent"
                  />
                  <svg className="w-4 h-4 text-slate-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <button 
                  onClick={handleSyncWithBlandAi}
                  disabled={isSyncing}
                  className="bg-green-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSyncing ? (
                    <>
                      <svg className="w-4 h-4 inline mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Syncing...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Sync
                    </>
                  )}
                </button>
                <button 
                  onClick={handleClearAll}
                  disabled={isClearing || calls.length === 0}
                  className="bg-red-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isClearing ? (
                    <>
                      <svg className="w-4 h-4 inline mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Clearing...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Clear All
                    </>
                  )}
                </button>
                <button className="bg-white text-slate-600 px-4 py-2.5 rounded-xl font-medium border border-slate-200 hover:bg-slate-50 transition-colors duration-200">
                  <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export
                </button>
              </div>
            </div>
          </div>

          {/* Sync Result */}
          {syncResult && (
            <div className="px-6 py-3 border-b border-slate-200 bg-blue-50">
              <div className="flex items-center justify-between">
                <p className="text-sm text-blue-800">{syncResult}</p>
                <button 
                  onClick={() => setSyncResult('')}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="px-6 py-4 border-b border-slate-200">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab('completed')}
                className={`pb-3 text-sm font-semibold border-b-2 transition-colors duration-200 ${
                  activeTab === 'completed'
                    ? 'border-avrek-blue text-avrek-blue'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                Completed ({calls.filter(call => call.status === 'Completed').length})
              </button>
              <button
                onClick={() => setActiveTab('active')}
                className={`pb-3 text-sm font-semibold border-b-2 transition-colors duration-200 ${
                  activeTab === 'active'
                    ? 'border-avrek-blue text-avrek-blue'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                Active ({calls.filter(call => call.status !== 'Completed').length})
              </button>
            </div>
          </div>

          {/* Call Cards */}
          <div className="p-6">
            {filteredCalls.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No {activeTab} calls found</h3>
                <p className="text-slate-600 mb-6">Start your first call to see it appear here</p>
                <button 
                  onClick={navigateToConfig}
                  className="bg-gradient-to-r from-avrek-blue to-avrek-dark-blue text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
                >
                  Start New Call
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredCalls.map((call) => {
                  const statusConfig = getStatusConfig(call.status);
                  const dateTime = formatDate(call.createdAt);
                  
                  return (
                    <div key={call.id} className="bg-gradient-to-r from-white to-slate-50 rounded-xl p-6 border border-slate-200 hover:shadow-md transition-all duration-200 hover:border-slate-300">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-4">
                            <div className="flex items-center space-x-2">
                              <div className={`w-3 h-3 rounded-full ${statusConfig.dot}`}></div>
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${statusConfig.class}`}>
                                <span className="mr-1">{statusConfig.icon}</span>
                                {call.status}
                              </span>
                            </div>
                            <div className="text-sm text-slate-500">
                              ID: <span className="font-mono text-slate-700">{getCallIdShort(call.blandCallId)}</span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                              <p className="text-sm font-medium text-slate-600 mb-1">Phone Numbers</p>
                              <div className="space-y-1">
                                <p className="text-slate-900 font-medium">To: {call.phoneNumber}</p>
                                <p className="text-slate-600">From: {call.fromNumber || 'System'}</p>
                              </div>
                            </div>
                            
                            <div>
                              <p className="text-sm font-medium text-slate-600 mb-1">Call Details</p>
                              <div className="space-y-1">
                                <p className="text-slate-900">Duration: {formatDuration(call.callDuration)}</p>
                                <p className="text-slate-600">Pathway: {call.pathway || 'simple-pathway'}</p>
                              </div>
                            </div>
                            
                            <div>
                              <p className="text-sm font-medium text-slate-600 mb-1">Timing</p>
                              <div className="space-y-1">
                                <p className="text-slate-900">{dateTime.date}</p>
                                <p className="text-slate-600">{dateTime.time}</p>
                              </div>
                            </div>
                          </div>
                          
                          {call.issues && (
                            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                              <p className="text-sm font-medium text-amber-800 mb-1">Issues Detected</p>
                              <p className="text-sm text-amber-700">{call.issues}</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-col space-y-2 ml-6">
                          <button
                            onClick={() => handleViewDetails(call.id)}
                            className="flex items-center justify-center w-10 h-10 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors duration-200"
                            title="View Details"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          {call.recordingUrl && (
                            <>
                              <button
                                onClick={() => handlePlayRecording(call.recordingUrl!)}
                                className="flex items-center justify-center w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 transition-colors duration-200"
                                title="Play Recording"
                              >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M8 5v10l8-5-8-5z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDownloadRecording(call.recordingUrl!, call.id)}
                                className="flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors duration-200"
                                title="Download Recording"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </button>
                            </>
                          )}
                          <button
                            className="flex items-center justify-center w-10 h-10 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors duration-200"
                            title="Copy Call ID"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Call Details Modal */}
      {selectedCallId && (
        <CallDetailsModal
          callId={selectedCallId}
          isOpen={isDetailsModalOpen}
          onClose={handleCloseDetailsModal}
        />
      )}
    </div>
  );
};

export default CallHistoryPage;