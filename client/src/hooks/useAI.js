import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../utils/api";
import { useToast } from "../context/ToastContext";

const useAI = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  // Fetch all chats (history list)
  const {
    data: chatsData,
    isLoading: loadingChats,
    error: chatsError,
  } = useQuery({
    queryKey: ["aiChats"],
    queryFn: async () => {
      const { data } = await api.get("/ai/chats");
      return data.chats || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch specific chat details
  const useChat = (chatId) => {
    return useQuery({
      queryKey: ["aiChat", chatId],
      queryFn: async () => {
        if (!chatId) return null;
        const { data } = await api.get(`/ai/chats/${chatId}`);
        return data.chat;
      },
      enabled: !!chatId,
      staleTime: 1000 * 60 * 5,
    });
  };

  const sendMessageMutation = useMutation({
    mutationFn: ({ message, chatId }) =>
      api.post("/ai/chat", { message, chatId }),
    onSuccess: (data, variables) => {
      // Invalidate the specific chat to get the new message
      if (variables.chatId) {
        queryClient.invalidateQueries({
          queryKey: ["aiChat", variables.chatId],
        });
      }
      // Also invalidate the chats list as the last message/timestamp might have changed
      queryClient.invalidateQueries({ queryKey: ["aiChats"] });

      // If it was a new chat (no chatId), we might want to return the new chat ID
      return data;
    },
    onError: (error) => {
      console.error("Error sending message:", error);
      toast.error("فشل إرسال الرسالة");
    },
  });

  const deleteChatMutation = useMutation({
    mutationFn: (chatId) => api.delete(`/ai/chats/${chatId}`),
    onSuccess: (data, chatId) => {
      queryClient.setQueryData(["aiChats"], (old) =>
        old?.filter((c) => c._id !== chatId)
      );
      queryClient.removeQueries({ queryKey: ["aiChat", chatId] });
      toast.success("تم حذف المحادثة");
    },
    onError: (error) => {
      console.error("Error deleting chat:", error);
      toast.error("فشل حذف المحادثة");
    },
  });

  return {
    chats: chatsData,
    loadingChats,
    chatsError,
    useChat,
    sendMessage: sendMessageMutation.mutateAsync,
    isSending: sendMessageMutation.isPending,
    deleteChat: deleteChatMutation.mutateAsync,
    isDeleting: deleteChatMutation.isPending,
  };
};

export default useAI;
