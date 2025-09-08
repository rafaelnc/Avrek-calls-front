export interface User {
  username: string;
}

export interface AuthResponse {
  access_token: string;
}

export interface Call {
  id: number;
  phoneNumber: string;
  fromNumber?: string;
  baseScript: string;
  status: 'In Progress' | 'Completed' | 'Not Answered';
  responsesCollected?: string;
  blandCallId?: string;
  callDuration?: number;
  recordingUrl?: string;
  issues?: string;
  pathway?: string;
  tags?: string;
  batchId?: string;
  transferredTo?: string;
  reviewStatus?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCallRequest {
  // New format fields
  phone_number?: string;
  task?: string;
  voice?: string;
  wait_for_greeting?: boolean;
  record?: boolean;
  answered_by_enabled?: boolean;
  noise_cancellation?: boolean;
  interruption_threshold?: number;
  block_interruptions?: boolean;
  max_duration?: number;
  model?: string;
  language?: string;
  background_track?: string;
  endpoint?: string;
  voicemail_action?: string;
  
  // Legacy fields for backward compatibility
  phoneNumber?: string;
  fromNumber?: string;
  baseScript?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}
