// ===== API Module (Backend Integration) =====

const API = {
    baseURL: 'http://localhost:3000/api',
    token: localStorage.getItem('token'),

    // Set token
    setToken(token) {
        this.token = token;
        localStorage.setItem('token', token);
    },

    // Clear token
    clearToken() {
        this.token = null;
        localStorage.removeItem('token');
    },

    // Generic API call
    async call(endpoint, method = 'GET', data = null) {
        try {
            const options = {
                method,
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            if (this.token) {
                options.headers['Authorization'] = `Bearer ${this.token}`;
            }

            if (data) {
                options.body = JSON.stringify(data);
            }

            const response = await fetch(`${this.baseURL}${endpoint}`, options);
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Request failed');
            }

            return result;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    // Events API
    events: {
        getAll: (category) => API.call(`/events${category ? `?category=${category}` : ''}`),
        getById: (id) => API.call(`/events/${id}`),
        create: (data) => API.call('/events', 'POST', data),
        update: (id, data) => API.call(`/events/${id}`, 'PUT', data),
        delete: (id) => API.call(`/events/${id}`, 'DELETE')
    },

    // Notices API
    notices: {
        getAll: (priority) => API.call(`/notices${priority ? `?priority=${priority}` : ''}`),
        getById: (id) => API.call(`/notices/${id}`),
        create: (data) => API.call('/notices', 'POST', data),
        update: (id, data) => API.call(`/notices/${id}`, 'PUT', data),
        delete: (id) => API.call(`/notices/${id}`, 'DELETE')
    },

    // Complaints API
    complaints: {
        getAll: (status) => API.call(`/complaints${status ? `?status=${status}` : ''}`),
        getById: (id) => API.call(`/complaints/${id}`),
        create: (data) => API.call('/complaints', 'POST', data),
        updateStatus: (id, status) => API.call(`/complaints/${id}/status`, 'PATCH', { status }),
        delete: (id) => API.call(`/complaints/${id}`, 'DELETE'),
        getStats: () => API.call('/complaints/stats/summary')
    },

    // Attendance API
    attendance: {
        getAll: (params) => {
            const query = new URLSearchParams(params).toString();
            return API.call(`/attendance${query ? `?${query}` : ''}`);
        },
        mark: (data) => API.call('/attendance', 'POST', data),
        getStats: () => API.call('/attendance/stats')
    },

    // Clubs API
    clubs: {
        getAll: (category) => API.call(`/clubs${category ? `?category=${category}` : ''}`),
        getById: (id) => API.call(`/clubs/${id}`),
        create: (data) => API.call('/clubs', 'POST', data),
        delete: (id) => API.call(`/clubs/${id}`, 'DELETE'),
        join: (id) => API.call(`/clubs/${id}/join`, 'POST'),
        leave: (id) => API.call(`/clubs/${id}/leave`, 'POST')
    },

    // Feedback API
    feedback: {
        getAll: (category) => API.call(`/feedback${category ? `?category=${category}` : ''}`),
        create: (data) => API.call('/feedback', 'POST', data),
        delete: (id) => API.call(`/feedback/${id}`, 'DELETE'),
        getStats: () => API.call('/feedback/stats/summary')
    },

    // Auth API
    auth: {
        login: (credentials) => API.call('/auth/login', 'POST', credentials),
        signup: (userData) => API.call('/auth/signup', 'POST', userData)
    }
};
