import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import api from "../utils/api";

export function useAddPayment() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    user: "",
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const [usersRes, balancesRes] = await Promise.all([
        api.get("/users"),
        api.get("/stats/balances"),
      ]);

      const activeUsers = usersRes.data.filter((u) => u.isActive);
      const balancesMap = new Map(
        balancesRes.data.map((b) => [b.userId.toString(), b])
      );

      const usersWithBalance = activeUsers.map((u) => ({
        ...u,
        balance: balancesMap.get(u._id.toString())?.balance || 0,
        totalOwed: balancesMap.get(u._id.toString())?.totalOwed || 0,
        totalPaid: balancesMap.get(u._id.toString())?.totalPaid || 0,
      }));

      setUsers(usersWithBalance);
    } catch (error) {
      console.error("غلط في تحميل الأعضاء:", error);
      toast.error("فيه مشكلة في تحميل الأعضاء");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUserChange = (userId) => {
    setFormData((prev) => ({ ...prev, user: userId }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.user || !formData.amount) {
      const errorMsg = "لازم تختار العضو والمبلغ";
      setError(errorMsg);
      toast.warning(errorMsg);
      return;
    }

    try {
      setIsSubmitting(true);
      // Always send transactionType as "payment" (Incoming/Deposit)
      await api.post("/payments", { ...formData, transactionType: "payment" });
      toast.success("تم تسجيل استلام الدفعة بنجاح!");
      navigate("/payments");
    } catch (error) {
      console.error("غلط في تسجيل الدفعة:", error);
      const errorMsg = "فيه مشكلة في تسجيل الدفعة";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    users,
    loading,
    formData,
    handleChange,
    handleUserChange,
    handleSubmit,
    error,
    isSubmitting,
    user, // return user to check role
  };
}
