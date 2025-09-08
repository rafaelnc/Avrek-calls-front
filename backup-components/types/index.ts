export interface User {
  username: string;
}

export interface AuthResponse {
  access_token: string;
}

export interface Call {
  id: number;
  phoneNumber: string;
  baseScript: string;
  status: 'In Progress' | 'Completed' | 'Not Answered';
  responsesCollected?: string;
  blandCallId?: string;
  callDuration?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCallRequest {
  phone_number: string;
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
  task: string;
  
  // Legacy fields for backward compatibility
  phoneNumber?: string;
  baseScript?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}
