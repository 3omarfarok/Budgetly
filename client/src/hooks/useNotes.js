import { useToast } from "../context/ToastContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../utils/api";

export function useNotes() {
  const toast = useToast();
  const queryClient = useQueryClient();

  // Query
  const {
    data: notes = [],
    isLoading: loading,
    refetch: refreshNotes,
  } = useQuery({
    queryKey: ["notes"],
    queryFn: async () => {
      const { data } = await api.get("/notes");
      return data;
    },
    onError: (error) => {
      console.error("Error fetching notes:", error);
      toast.error("فشل في تحميل الملاحظات");
    },
  });

  // Mutations
  const addNoteMutation = useMutation({
    mutationFn: (content) => api.post("/notes", { content }),
    onSuccess: () => {
      queryClient.invalidateQueries(["notes"]);
      toast.success("تم إضافة الملاحظة");
    },
    onError: (error) => {
      console.error("Error adding note:", error);
      toast.error("فشل في إضافة الملاحظة");
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: (id) => api.delete(`/notes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["notes"]);
      toast.success("تم حذف الملاحظة");
    },
    onError: (error) => {
      console.error("Error deleting note:", error);
      toast.error("فشل في حذف الملاحظة");
    },
  });

  const addReplyMutation = useMutation({
    mutationFn: ({ noteId, content }) =>
      api.post(`/notes/${noteId}/reply`, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries(["notes"]);
      toast.success("تم إضافة الرد");
    },
    onError: (error) => {
      console.error("Error adding reply:", error);
      toast.error("فشل في إضافة الرد");
    },
  });

  // Wrapper functions to maintain API compatibility
  const addNote = async (content) => {
    if (!content.trim()) return;
    try {
      await addNoteMutation.mutateAsync(content);
      return true;
    } catch {
      return false;
    }
  };

  const deleteNote = (id) => {
    deleteNoteMutation.mutate(id);
  };

  const addReply = async (noteId, content) => {
    if (!content.trim()) return;
    try {
      await addReplyMutation.mutateAsync({ noteId, content });
      return true;
    } catch {
      return false;
    }
  };

  return {
    notes,
    loading,
    submitting: addNoteMutation.isPending || addReplyMutation.isPending,
    addNote,
    deleteNote,
    addReply,
    refreshNotes,
  };
}
