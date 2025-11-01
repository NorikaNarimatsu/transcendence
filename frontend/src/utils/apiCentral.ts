const API_BASE_URL = 'https://localhost:8443';

export interface ApiResponse<T =any> {
	data?: T;
	error?: string;
}

async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
	const newToken = response.headers.get('Renewed-Token');
	if (newToken) {
		localStorage.setItem('authToken', newToken);
	}

	if (response.status === 401) {
		localStorage.removeItem('authToken');
		localStorage.removeItem('currentUser');

		if (window.location.pathname !== '/signup') {
			window.location.href = '/signup';
		}

		return { error: 'Session expired. Please login again' };
	}

	let data: T;
	try {
		data = await response.json();
	} catch (error) {
		return { error: 'Failed to parse server\'s response' };
	}

	if (!response.ok) {
		return { error: (data as any).error || 'Request failed', data };
	}

	return { data };
}

async function handleBlobResponse(response: Response): Promise<Response | null> {

	const newToken = response.headers.get('Renewed-Token');
	if (newToken) {
		localStorage.setItem('authToken', newToken);
	}

	if (response.status === 401) {
		localStorage.removeItem('authToken');
		localStorage.removeItem('currentUser');

		if (window.location.pathname !== '/signup') {
			window.location.href = '/signup';
		}

		return null;
	}

	return response;
}

async function apiRequestBlob( endpoint: string, method: string, body?: any): Promise<Response | null> {

	const token = localStorage.getItem('authToken');

	const headers: HeadersInit = {
		'Content-Type': 'application/json',
	};

	if (token) {
		headers['Authorization'] = `Bearer ${token}`;
	}

	try {
		const response = await fetch(`${API_BASE_URL}${endpoint}`, {
			method,
			headers,
			body: body ? JSON.stringify(body) : undefined,
		});

		return await handleBlobResponse(response);
	} catch (error) {
		console.error('API request error: ', error);
		return null;
	}
}

async function apiRequest<T = any>(
	endpoint: string,
	method: string,
	body?: any
): Promise<ApiResponse<T>> {
	const token = localStorage.getItem('authToken');

	const headers: HeadersInit = {
		'Content-Type' : 'application/json',
	};

	if (token) {
		headers['Authorization'] = `Bearer ${token}`;
	}

	try {
		const response = await fetch(`${API_BASE_URL}${endpoint}`, {
			method,
			headers,
			body: body ? JSON.stringify(body) : undefined,
		});

		return await handleResponse<T>(response);
	} catch (error) {
		console.error('API request error: ', error);
		return { error: 'Network error. Please try again later' };
	}
}

export const apiCentral = {
	get: <T = any>(endpoint: string) => apiRequest<T>(endpoint, 'GET'),
	post: <T = any>(endpoint: string, body?: any) => apiRequest<T>(endpoint, 'POST', body),
	put: <T = any>(endpoint: string, body?: any) => apiRequest<T>(endpoint, 'PUT', body),
	postBlob: (endpoint: string, body?: any) => apiRequestBlob(endpoint, 'POST', body),
	getBlob: (endpoint: string) => apiRequestBlob(endpoint, 'GET'),
}

export default apiCentral;