import { useState } from "react";
import { Send } from "lucide-react";

export default function CreateNoteForm({ onAddNote, submitting }) {
  const [newNote, setNewNote] = useState("");

  const calculateRows = (text) => {
    if (!text) return 1;
    const newLines = (text.match(/\n/g) || []).length;
    return Math.min(Math.max(newLines + 1, 1), 6); // Min 1, Max 6 lines
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await onAddNote(newNote);
    if (success) {
      setNewNote("");
    }
  };

  return (
    <div className="bg-(--color-surface) rounded-2xl p-6 shadow-sm border border-(--color-border) mb-8">
      <form onSubmit={handleSubmit} className="relative">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="اكتب ملاحظة جديدة..."
          className="w-full bg-(--color-bg) border border-(--color-border) rounded-xl p-4 pl-12 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-(--color-primary) transition-all resize-none"
          rows={calculateRows(newNote)}
        />
        <button
          type="submit"
          disabled={submitting || !newNote.trim()}
          className="absolute bottom-4 left-4 p-2 bg-(--color-primary) text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {submitting ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">نشر</span>
              <Send size={18} />
            </div>
          )}
        </button>
      </form>
    </div>
  );
}
