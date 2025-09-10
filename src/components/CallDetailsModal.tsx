import React, { useState, useEffect } from 'react';
import { callsService } from '../services/api';

interface CallDetailsModalProps {
  callId: number;
  isOpen: boolean;
  onClose: () => void;
}

interface CallDetails {
  localCall: any;
  blandDetails: {
    call_id: string;
    call_length: number;
    to: string;
    from: string;
    status: string;
    completed: boolean;
    created_at: string;
    started_at: string;
    end_at: string;
    answered_by: string;
    record: boolean;
    recording_url: string | null;
    summary: string;
    price: number;
    call_ended_by: string;
    concatenated_transcript: string;
    transcripts: Array<{
      id: number;
      created_at: string;
      text: string;
      user: 'user' | 'assistant' | 'robot' | 'agent-action';
      c_id: string;
    }>;
    variables: any;
    metadata: any;
  };
  responses: any[];
}

const CallDetailsModal: React.FC<CallDetailsModalProps> = ({ callId, isOpen, onClose }) => {
  const [details, setDetails] = useState<CallDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'transcript'>('overview');

  useEffect(() => {
    if (isOpen && callId) {
      fetchCallDetails();
    }
  }, [isOpen, callId]);

  const fetchCallDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await callsService.getCallDetails(callId);
      setDetails(data);
    } catch (err) {
      setError('Failed to load call details');
      console.error('Error fetching call details:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'no-answer':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getAnsweredByColor = (answeredBy: string) => {
    switch (answeredBy.toLowerCase()) {
      case 'human':
        return 'bg-green-100 text-green-800';
      case 'voicemail':
        return 'bg-yellow-100 text-yellow-800';
      case 'unknown':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Call Details</h2>
            <p className="text-sm text-gray-600 mt-1">
              {details ? `Call ID: ${details.blandDetails.call_id}` : 'Loading...'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={fetchCallDetails}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : details ? (
            <div className="flex-1 flex flex-col min-h-0">
              {/* Tabs */}
              <div className="flex border-b border-gray-200 flex-shrink-0">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-6 py-3 font-medium text-sm transition-colors duration-200 ${
                    activeTab === 'overview'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('transcript')}
                  className={`px-6 py-3 font-medium text-sm transition-colors duration-200 ${
                    activeTab === 'transcript'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Transcript
                </button>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-6 min-h-0">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Call Info Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="bg-gray-50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Call Information</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Status:</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(details.blandDetails.status)}`}>
                              {details.blandDetails.status}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Answered by:</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAnsweredByColor(details.blandDetails.answered_by)}`}>
                              {details.blandDetails.answered_by}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Duration:</span>
                            <span className="font-medium">{formatDuration(details.blandDetails.call_length)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Price:</span>
                            <span className="font-medium">${details.blandDetails.price.toFixed(3)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Phone Numbers</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">To:</span>
                            <span className="font-medium">{details.blandDetails.to}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">From:</span>
                            <span className="font-medium">{details.blandDetails.from}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Timing</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Created:</span>
                            <span className="font-medium text-sm">{formatDateTime(details.blandDetails.created_at)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Started:</span>
                            <span className="font-medium text-sm">{formatDateTime(details.blandDetails.started_at)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Ended:</span>
                            <span className="font-medium text-sm">{formatDateTime(details.blandDetails.end_at)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Recording */}
                    {details.blandDetails.recording_url && (
                      <div className="bg-gray-50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Call Recording</h3>
                        <audio controls className="w-full">
                          <source src={details.blandDetails.recording_url} type="audio/mpeg" />
                          Your browser does not support the audio element.
                        </audio>
                      </div>
                    )}

                    {/* Summary */}
                    {details.blandDetails.summary && (
                      <div className="bg-gray-50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Call Summary</h3>
                        <p className="text-gray-700 leading-relaxed">{details.blandDetails.summary}</p>
                      </div>
                    )}

                  </div>
                )}

                {activeTab === 'transcript' && (
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Full Transcript</h3>
                      <div className="bg-white rounded-lg p-4 border max-h-96 overflow-y-auto">
                        <p className="text-gray-700 whitespace-pre-wrap">{details.blandDetails.concatenated_transcript}</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Transcript</h3>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {details.blandDetails.transcripts.map((transcript) => (
                          <div
                            key={transcript.id}
                            className={`p-4 rounded-lg ${
                              transcript.user === 'user'
                                ? 'bg-blue-50 border-l-4 border-blue-400'
                                : 'bg-green-50 border-l-4 border-green-400'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                transcript.user === 'user'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {transcript.user === 'user' ? 'Customer' : 'Assistant'}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatDateTime(transcript.created_at)}
                              </span>
                            </div>
                            <p className="text-gray-700">{transcript.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default CallDetailsModal;
