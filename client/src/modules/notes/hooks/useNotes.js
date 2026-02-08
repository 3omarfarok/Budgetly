import { useEffect } from "react";
import { useToast } from "../../../shared/context/ToastContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../../shared/api/queryKeys";
import { notesApi } from "../api";

export function useNotes() {
  const toast = useToast();
  const queryClient = useQueryClient();

  // Query
  const {
    data: notes = [],
    isLoading: loading,
    refetch: refreshNotes,
    error: notesError,
  } = useQuery({
    queryKey: queryKeys.notes.all,
    queryFn: notesApi.getNotes,
  });

  useEffect(() => {
    if (notesError) {
      console.error("Error fetching notes:", notesError);
      toast.error("فشل في تحميل الملاحظات");
    }
  }, [notesError, toast]);

  // Mutations
  const addNoteMutation = useMutation({
    mutationFn: notesApi.addNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notes.all });
      toast.success("تم إضافة الملاحظة");
    },
    onError: (error) => {
      console.error("Error adding note:", error);
      toast.error("فشل في إضافة الملاحظة");
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: notesApi.deleteNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notes.all });
      toast.success("تم حذف الملاحظة");
    },
    onError: (error) => {
      console.error("Error deleting note:", error);
      toast.error("فشل في حذف الملاحظة");
    },
  });

  const addReplyMutation = useMutation({
    mutationFn: notesApi.addReply,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notes.all });
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
