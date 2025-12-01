import { createContext, useState, useEffect, useContext } from "react";
import api from "../utils/api";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const { data } = await api.get("/auth/me");
          setUser(data);
        } catch (error) {
          console.error("Auth check failed:", error);
          localStorage.removeItem("token");
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const register = async (username, password, name) => {
    const { data } = await api.post("/auth/register", {
      username,
      password,
      name,
    });
    localStorage.setItem("token", data.token);
    setUser(data.user);
    return data.user;
  };

  const login = async (username, password) => {
    const { data } = await api.post("/auth/login", { username, password });
    localStorage.setItem("token", data.token);
    setUser(data.user);
    return data.user;
  };

  const createHouse = async (name, password) => {
    const { data } = await api.post("/houses", { name, password });
    setUser((prevUser) => ({
      ...prevUser,
      house: data._id,
      role: "admin",
    }));
    return data;
  };

  const joinHouse = async (houseId, password) => {
    const { data } = await api.post(`/houses/${houseId}/join`, { password });
    setUser((prevUser) => ({
      ...prevUser,
      house: data._id,
    }));
    return data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        register,
        createHouse,
        joinHouse,
        updateUser,
        loading,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
