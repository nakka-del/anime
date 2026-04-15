import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import apiClient from "../api/apiClient";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("animeverse_user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      localStorage.removeItem("animeverse_user");
      localStorage.removeItem("animeverse_token");
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  const syncSession = (nextUser, token) => {
    setUser(nextUser);

    if (nextUser && token) {
      localStorage.setItem("animeverse_user", JSON.stringify(nextUser));
      localStorage.setItem("animeverse_token", token);
      return;
    }

    localStorage.removeItem("animeverse_user");
    localStorage.removeItem("animeverse_token");
  };

  const register = async (payload) => {
    const response = await apiClient.post("/auth/register", payload);
    syncSession(response.data.user, response.data.token);
    toast.success("Welcome to AnimeVerse");
    return response.data;
  };

  const login = async (payload) => {
    const response = await apiClient.post("/auth/login", payload);
    syncSession(response.data.user, response.data.token);
    toast.success("Logged in successfully");
    return response.data;
  };

  const logout = () => {
    syncSession(null, null);
    toast.success("Logged out");
  };

  const refreshProfile = async () => {
    try {
      const response = await apiClient.get("/auth/profile");
      setUser(response.data.user);
      localStorage.setItem("animeverse_user", JSON.stringify(response.data.user));
      return response.data;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("animeverse_token");

    if (!token) {
      setLoading(false);
      return;
    }

    refreshProfile().catch(() => {
      syncSession(null, null);
      setLoading(false);
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        register,
        login,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
