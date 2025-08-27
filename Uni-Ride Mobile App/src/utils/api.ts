import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './supabase/info';

const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-64aaa3dc`;

// Helper function to make authenticated API calls
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  const accessToken = session?.access_token;

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': accessToken ? `Bearer ${accessToken}` : `Bearer ${publicAnonKey}`,
    ...options.headers,
  };

  const url = `${API_BASE_URL}${endpoint}`;
  console.log('🌐 Making API call:', {
    method: options.method || 'GET',
    url,
    hasAuth: !!accessToken
  });

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    console.log('📡 API Response:', {
      status: response.status,
      statusText: response.statusText,
      url: response.url
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ API Error Response:', errorData);
      throw new Error(`API Error: ${response.status} - ${errorData}`);
    }

    const result = await response.json();
    console.log('✅ API Success:', { endpoint, result: { ...result, user: result.user ? '***' : undefined } });
    return result;
  } catch (error) {
    console.error(`❌ API call failed for ${endpoint}:`, {
      error: error.message,
      url,
      options: { ...options, headers: { ...headers, Authorization: '***' } }
    });
    
    // Provide more specific error messages for common issues
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new Error('Unable to connect to server. The backend may not be running or there may be a network issue.');
    }
    
    throw error;
  }
}

// Authentication functions
export const auth = {
  async signUp(userData: {
    email: string;
    password: string;
    name: string;
    studentId: string;
    batch: string;
    department: string;
    userType: 'passenger' | 'hybrid';
  }) {
    return apiCall('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  async getProfile() {
    return apiCall('/auth/profile');
  },

  async updateProfile(updates: any) {
    return apiCall('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
};

// Ride functions
export const rides = {
  async postOffer(rideData: {
    from: string;
    to: string;
    departureTime: string;
    availableSeats: number;
    vehicle: string;
    notes?: string;
  }) {
    return apiCall('/rides/offer', {
      method: 'POST',
      body: JSON.stringify(rideData),
    });
  },

  async postRequest(requestData: {
    from: string;
    to: string;
    departureTime: string;
    isUrgent?: boolean;
    notes?: string;
  }) {
    return apiCall('/rides/request', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  },

  async getAvailableRides() {
    return apiCall('/rides');
  },

  async getMyRides() {
    return apiCall('/rides/my');
  },

  async joinRide(rideId: string) {
    return apiCall(`/rides/${rideId}/join`, {
      method: 'POST',
    });
  },

  async acceptPassenger(rideId: string, passengerId: string) {
    return apiCall(`/rides/${rideId}/passenger/${passengerId}/accept`, {
      method: 'POST',
    });
  },

  async rejectPassenger(rideId: string, passengerId: string) {
    return apiCall(`/rides/${rideId}/passenger/${passengerId}/reject`, {
      method: 'POST',
    });
  },

  async rateRide(rideId: string, rating: number, review?: string) {
    return apiCall(`/rides/${rideId}/rate`, {
      method: 'POST',
      body: JSON.stringify({ rating, review }),
    });
  },
};

// Leaderboard functions
export const leaderboard = {
  async get() {
    return apiCall('/leaderboard');
  },
};

// Real-time subscription helpers
export const subscriptions = {
  subscribeToRides(callback: (rides: any[]) => void) {
    // In a real implementation, this would use WebSocket or Server-Sent Events
    // For now, we'll implement polling
    const pollInterval = setInterval(async () => {
      try {
        const response = await apiCall('/rides');
        callback(response.rides || []);
      } catch (error) {
        console.error('Error polling rides:', error);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(pollInterval);
  },

  subscribeToUserRides(callback: (rides: any[]) => void) {
    const pollInterval = setInterval(async () => {
      try {
        const response = await apiCall('/rides/my');
        callback(response.rides || []);
      } catch (error) {
        console.error('Error polling user rides:', error);
      }
    }, 3000); // Poll every 3 seconds for user's own rides

    return () => clearInterval(pollInterval);
  },
};

// WhatsApp integration
export const messaging = {
  openWhatsApp(phoneNumber: string, message: string) {
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  },

  getDefaultRideMessage(ride: any, isDriver: boolean = false) {
    if (isDriver) {
      return `Hi! I saw your ride request from ${ride.from} to ${ride.to}. I can give you a ride departing at ${ride.departureTime}. Let me know if you're interested! - Uni-Ride`;
    } else {
      return `Hi! I'm interested in your ride from ${ride.from} to ${ride.to} departing at ${ride.departureTime}. Is the seat still available? - Uni-Ride`;
    }
  },
};

// Health check function
export const health = {
  async check() {
    return apiCall('/health');
  }
};

export { supabase };