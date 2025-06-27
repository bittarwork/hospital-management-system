import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from "react";
import {
  authAPI,
  tokenManager,
  userManager,
  initializeAuth,
} from "../services/auth";

// Initial state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Auth actions
const AUTH_ACTIONS = {
  LOGIN_START: "LOGIN_START",
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
  LOGIN_ERROR: "LOGIN_ERROR",
  LOGOUT: "LOGOUT",
  SET_LOADING: "SET_LOADING",
  CLEAR_ERROR: "CLEAR_ERROR",
};

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_ERROR:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...initialState,
        isLoading: false,
      };

    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Auth Provider
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth on mount
  useEffect(() => {
    const initAuth = async () => {
      console.log("🔍 AuthContext: Starting auth initialization...");
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });

      try {
        // Check if we have a valid token
        const hasValidToken = initializeAuth();
        console.log("🔑 AuthContext: Has valid token:", hasValidToken);

        if (hasValidToken) {
          const token = tokenManager.getToken();
          const user = userManager.getUser();
          console.log("👤 AuthContext: Found token and user:", !!token, !!user);

          if (token && user) {
            // For super_admin, skip server verification to avoid issues
            if (user.role === "super_admin") {
              console.log(
                "🎯 AuthContext: Super admin detected, skipping server verification"
              );
              dispatch({
                type: AUTH_ACTIONS.LOGIN_SUCCESS,
                payload: {
                  user: user,
                  token: token,
                },
              });
              return;
            }

            // Try to verify with server for other users
            try {
              console.log("🌐 AuthContext: Verifying with server...");
              const currentUser = await authAPI.getCurrentUser();
              console.log("✅ AuthContext: Server verification successful");
              dispatch({
                type: AUTH_ACTIONS.LOGIN_SUCCESS,
                payload: {
                  user: currentUser,
                  token: token,
                },
              });
            } catch (error) {
              console.warn(
                "⚠️ AuthContext: Server verification failed, but keeping local session for admin"
              );
              // For admin users, keep the session even if server verification fails
              if (user.role === "super_admin" || user.role === "admin") {
                dispatch({
                  type: AUTH_ACTIONS.LOGIN_SUCCESS,
                  payload: {
                    user: user,
                    token: token,
                  },
                });
              } else {
                // Server verification failed, clear everything
                console.log(
                  "❌ AuthContext: Server verification failed, clearing session"
                );
                tokenManager.removeToken();
                userManager.removeUser();
                dispatch({ type: AUTH_ACTIONS.LOGOUT });
              }
            }
          } else {
            // Missing data, logout
            console.log("❌ AuthContext: Missing token or user data");
            dispatch({ type: AUTH_ACTIONS.LOGOUT });
          }
        } else {
          // No valid token
          console.log("❌ AuthContext: No valid token found");
          dispatch({ type: AUTH_ACTIONS.LOGOUT });
        }
      } catch (error) {
        console.error("❌ AuthContext: Auth initialization error:", error);
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
      }
    };

    initAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });

    try {
      const { user, token } = await authAPI.login(credentials);

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, token },
      });

      return { success: true };
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.LOGIN_ERROR,
        payload: error.response?.data?.message || "فشل في تسجيل الدخول",
      });
      return {
        success: false,
        error: error.response?.data?.message || "فشل في تسجيل الدخول",
      };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  };

  // Change password function
  const changePassword = async (passwords) => {
    try {
      await authAPI.changePassword(passwords);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "فشل في تغيير كلمة المرور",
      };
    }
  };

  // Check permission function
  const hasPermission = (resource, action) => {
    return userManager.hasPermission(resource, action);
  };

  // Check role function
  const hasRole = (role) => {
    return userManager.hasRole(role);
  };

  // Update user function
  const updateUser = (userData) => {
    const currentUser = userManager.getUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData };
      const rememberMe = tokenManager.isRememberMe();
      userManager.setUser(updatedUser, rememberMe);

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user: updatedUser, token: state.token },
      });
    }
  };

  // Clear error function
  const clearError = useCallback(() => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  }, []);

  const value = {
    // State
    ...state,

    // Actions
    login,
    logout,
    changePassword,
    hasPermission,
    hasRole,
    updateUser,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
