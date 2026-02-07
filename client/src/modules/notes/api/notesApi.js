import api from "../../../utils/api";

export const notesApi = {
  getNotes: async () => {
    const { data } = await api.get("/notes");
    return data;
  },

  addNote: (content) => api.post("/notes", { content }),

  deleteNote: (id) => api.delete(`/notes/${id}`),

  addReply: ({ noteId, content }) => api.post(`/notes/${noteId}/reply`, { content }),
};
