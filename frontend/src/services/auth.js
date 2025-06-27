import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE = '/api';

// ========== Token Management ==========

export const tokenManager = {
    getToken: () => {
        // Check sessionStorage first, then localStorage
        return sessionStorage.getItem('token') || localStorage.getItem('token');
    },

    setToken: (token, remember = false) => {
        if (remember) {
            // Save to localStorage for persistent login
            localStorage.setItem('token', token);
            sessionStorage.removeItem('token');
        } else {
            // Save to sessionStorage for session-only login
            sessionStorage.setItem('token', token);
            localStorage.removeItem('token');
        }

        // Set auth header for axios
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    },

    removeToken: () => {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
    },

    isTokenValid: () => {
        const token = tokenManager.getToken();
        if (!token) return false;

        try {
            // Parse JWT payload
            const parts = token.split('.');
            if (parts.length !== 3) return false;

            const payload = JSON.parse(atob(parts[1]));
            const currentTime = Date.now() / 1000;

            // Check if token is expired
            return payload.exp && payload.exp > currentTime;
        } catch (error) {
            return false;
        }
    },

    getTokenExpiration: () => {
        const token = tokenManager.getToken();
        if (!token) return null;

        try {
            const parts = token.split('.');
            if (parts.length !== 3) return null;

            const payload = JSON.parse(atob(parts[1]));
            return payload.exp ? new Date(payload.exp * 1000) : null;
        } catch (error) {
            return null;
        }
    },

    getTimeUntilExpiration: () => {
        const expiration = tokenManager.getTokenExpiration();
        if (!expiration) return 0;
        return Math.max(0, expiration.getTime() - Date.now());
    },

    isRememberMe: () => {
        // Check if token is in localStorage (persistent) vs sessionStorage (temporary)
        return !!localStorage.getItem('token');
    }
};

// ========== User Management ==========

export const userManager = {
    getUser: () => {
        const userData = sessionStorage.getItem('user') || localStorage.getItem('user');
        return userData ? JSON.parse(userData) : null;
    },

    setUser: (user, remember = false) => {
        const userData = JSON.stringify(user);
        if (remember) {
            localStorage.setItem('user', userData);
            sessionStorage.removeItem('user');
        } else {
            sessionStorage.setItem('user', userData);
            localStorage.removeItem('user');
        }
    },

    removeUser: () => {
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
    },

    hasPermission: (resource, action) => {
        const user = userManager.getUser();
        if (!user) return false;

        // Super admin and admin have all permissions
        if (user.role === 'super_admin' || user.role === 'admin') return true;

        // Check specific permissions for other roles
        if (!user.permissions) return false;

        const permission = user.permissions.find(p => p.module === resource);
        return permission ? permission.actions.includes(action) : false;
    },

    hasRole: (role) => {
        const user = userManager.getUser();
        return user ? user.role === role : false;
    }
};

// ========== Auth API ==========

export const authAPI = {
    // Login
    login: async (credentials) => {
        try {
            const { rememberMe, ...loginData } = credentials;
            const response = await axios.post(`${API_BASE}/auth/login`, loginData);

            const { token, user } = response.data.data;

            // Store token and user
            tokenManager.setToken(token, rememberMe);
            userManager.setUser(user, rememberMe);

            toast.success('تم تسجيل الدخول بنجاح');
            return { token, user };
        } catch (error) {
            const message = error.response?.data?.message || 'فشل في تسجيل الدخول';
            toast.error(message);
            throw error;
        }
    },

    // Logout
    logout: async () => {
        try {
            // Call server logout endpoint
            if (tokenManager.getToken()) {
                await axios.post(`${API_BASE}/auth/logout`);
            }
        } catch (error) {
            console.warn('Server logout failed:', error.message);
        } finally {
            // Clear local storage regardless
            tokenManager.removeToken();
            userManager.removeUser();
            toast.success('تم تسجيل الخروج بنجاح');
        }
    },

    // Get current user
    getCurrentUser: async () => {
        try {
            const response = await axios.get(`${API_BASE}/auth/me`);
            return response.data.data.user;
        } catch (error) {
            throw error;
        }
    },

    // Change password
    changePassword: async (passwords) => {
        try {
            const response = await axios.put(`${API_BASE}/auth/change-password`, passwords);
            toast.success('تم تغيير كلمة المرور بنجاح');
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'فشل في تغيير كلمة المرور';
            toast.error(message);
            throw error;
        }
    },

    // Forgot password
    forgotPassword: async (email) => {
        try {
            const response = await axios.post(`${API_BASE}/auth/forgot-password`, { email });
            toast.success('تم إرسال رابط إعادة تعيين كلمة المرور');
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'فشل في إرسال رابط إعادة التعيين';
            toast.error(message);
            throw error;
        }
    },

    // Reset password
    resetPassword: async (token, password) => {
        try {
            const response = await axios.post(`${API_BASE}/auth/reset-password`, { token, password });
            toast.success('تم إعادة تعيين كلمة المرور بنجاح');
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'فشل في إعادة تعيين كلمة المرور';
            toast.error(message);
            throw error;
        }
    }
};

// ========== Initialize Auth ==========

export const initializeAuth = () => {
    try {
        const token = tokenManager.getToken();

        if (token && tokenManager.isTokenValid()) {
            // Set auth header
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            return true;
        } else {
            // Clear invalid token
            tokenManager.removeToken();
            userManager.removeUser();
            return false;
        }
    } catch (error) {
        console.error('Auth initialization error:', error);
        tokenManager.removeToken();
        userManager.removeUser();
        return false;
    }
}; 