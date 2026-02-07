import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";

export function useLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(username, password);
      toast.success("أهلاً بيك!");
      navigate("/");
    } catch {
      const errorMsg = "اليوزر أو الباسورد غلط";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return {
    username,
    setUsername,
    password,
    setPassword,
    error,
    loading,
    handleLogin,
  };
}
