/**
 * API Client for Sesh-Tracker Services
 * Provides a consistent way to make API calls with proper authentication
 */

// Default to the same origin for API calls
const API_BASE_URL = getApiBaseUrl();

// Get the appropriate API base URL based on the environment
function getApiBaseUrl(): string {
  // If running in development mode, use the current host
  const currentHost = window.location.origin;
  console.log('[ApiClient] getApiBaseUrl: currentHost =', currentHost); // Log the host
  
  // Use the same domain but with api/v1 path
  const apiUrl = `${currentHost}/api/v1`;
  console.log('[ApiClient] getApiBaseUrl: determined apiUrl =', apiUrl); // Log the determined URL
  return apiUrl;
}

// API Client options type
interface ApiClientOptions {
  baseUrl?: string;
  mockAuth?: boolean;
  mockUserType?: 'test' | 'demo' | 'admin';
}

// Default options
const defaultOptions: ApiClientOptions = {
  baseUrl: API_BASE_URL,
  mockAuth: true,
  mockUserType: 'test'
};

/**
 * API Client class for making requests to the Sesh-Tracker API
 */
export class ApiClient {
  private baseUrl: string;
  private mockAuth: boolean;
  private mockUserType: string;
  private authToken: string | null = null;

  constructor(options: ApiClientOptions = {}) {
    console.log('[ApiClient] Constructor called with options:', options); // Log incoming options
    const mergedOptions = { ...defaultOptions, ...options };
    console.log('[ApiClient] Constructor merged options:', mergedOptions); // Log merged options
    this.baseUrl = mergedOptions.baseUrl || API_BASE_URL;
    console.log('[ApiClient] Constructor set this.baseUrl to:', this.baseUrl); // Log the final baseUrl
    this.mockAuth = mergedOptions.mockAuth ?? true;
    this.mockUserType = mergedOptions.mockUserType || 'test';
  }

  /**
   * Set the authentication token for API requests
   */
  setAuthToken(token: string) {
    this.authToken = token;
  }

  /**
   * Clear the authentication token
   */
  clearAuthToken() {
    this.authToken = null;
  }

  /**
   * Get appropriate headers for API requests
   */
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Add authentication if available
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    // Add mock authentication for development
    if (this.mockAuth) {
      headers['X-Mock-User-Type'] = this.mockUserType;
    }

    return headers;
  }

  /**
   * Make an API request
   */
  async request<T = any>(
    endpoint: string,
    method: string = 'GET',
    data?: any
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const options: RequestInit = {
      method,
      headers: this.getHeaders(),
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }

    try {
      console.log(`API Request: ${method} ${url}`);
      const response = await fetch(url, options);
      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'API request failed');
      }

      return responseData;
    } catch (error) {
      console.error(`API Error: ${method} ${url}`, error);
      throw error;
    }
  }

  // Convenience methods
  async get<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, 'GET');
  }

  async post<T = any>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, 'POST', data);
  }

  async put<T = any>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, 'PUT', data);
  }

  async delete<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, 'DELETE');
  }
}

// Create a default API client instance
export const apiClient = new ApiClient();

// Export default for convenience
export default apiClient; 