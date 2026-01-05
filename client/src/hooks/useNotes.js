import { useState, useCallback, useEffect } from "react";
import { useToast } from "../context/ToastContext";
import api from "../utils/api";

export function useNotes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/notes");
      setNotes(data);
    } catch (error) {
      console.error("Error fetching notes:", error);
      toast.error("فشل في تحميل الملاحظات");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const addNote = useCallback(
    async (content) => {
      if (!content.trim()) return;

      try {
        setSubmitting(true);
        const { data } = await api.post("/notes", { content });
        setNotes((prev) => [data, ...prev]);
        toast.success("تم إضافة الملاحظة");
        return true; // Success
      } catch (error) {
        console.error("Error adding note:", error);
        toast.error("فشل في إضافة الملاحظة");
        return false; // Failure
      } finally {
        setSubmitting(false);
      }
    },
    [toast]
  );

  const deleteNote = useCallback(
    async (id) => {
      // Note: Confirmation should be handled in UI
      try {
        await api.delete(`/notes/${id}`);
        setNotes((prev) => prev.filter((note) => note._id !== id));
        toast.success("تم حذف الملاحظة");
      } catch (error) {
        console.error("Error deleting note:", error);
        toast.error("فشل في حذف الملاحظة");
      }
    },
    [toast]
  );

  const addReply = useCallback(
    async (noteId, content) => {
      if (!content.trim()) return;

      try {
        const { data } = await api.post(`/notes/${noteId}/reply`, {
          content,
        });
        setNotes((prev) => prev.map((n) => (n._id === noteId ? data : n)));
        toast.success("تم إضافة الرد");
        return true;
      } catch (error) {
        console.error("Error adding reply:", error);
        toast.error("فشل في إضافة الرد");
        return false;
      }
    },
    [toast]
  );

  return {
    notes,
    loading,
    submitting,
    addNote,
    deleteNote,
    addReply,
    refreshNotes: fetchNotes,
  };
}
