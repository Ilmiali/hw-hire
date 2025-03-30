import { getAuth } from 'firebase/auth';

const BASE_URL = import.meta.env.VITE_FIREBASE_FUNCTIONS_URL;

interface RequestOptions extends RequestInit {
  body?: any;
}

const getAuthHeaders = async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (!user) {
    throw new Error('No authenticated user found');
  }

  const token = await user.getIdToken();
  
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

export const fetchWithAuth = {
  async get<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      method: 'GET',
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  async post<T>(endpoint: string, data: any, options: RequestOptions = {}): Promise<T> {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      method: 'POST',
      headers: {
        ...headers,
        ...options.headers,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },
};
