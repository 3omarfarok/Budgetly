import { Trash2 } from "lucide-react";
import NoteReplySection from "./NoteReplySection";

export default function NoteCard({ note, currentUser, onDelete, onReply }) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("ar-EG", {
      day: "numeric",
      month: "long",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const handleDelete = () => {
    // Confirmation moved to component level or hook? The original had it in component.
    // Hook handles update, but confirmation is UI.
    if (window.confirm("متأكد أنك عايز تحذف الملاحظة دي؟")) {
      onDelete(note._id);
    }
  };

  const isOwnerOrAdmin =
    currentUser.role === "admin" || currentUser.id === note.createdBy?._id;

  return (
    <div className="bg-(--color-surface) rounded-2xl p-5 shadow-sm border border-(--color-border) hover:shadow-md transition-all group">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-(--color-primary-bg) flex items-center justify-center text-(--color-primary) font-bold text-lg">
            {note.createdBy?.name?.charAt(0) || "?"}
          </div>
          <div>
            <h3 className="font-bold text-(--color-text)">
              {note.createdBy?.name || "مستخدم غير موجود"}
            </h3>
            <span className="text-xs text-(--color-muted)">
              {formatDate(note.date)}
            </span>
          </div>
        </div>
        {isOwnerOrAdmin && (
          <button
            onClick={handleDelete}
            className="p-2 text-(--color-status-rejected) hover:bg-(--color-status-rejected-bg) rounded-lg opacity-0 group-hover:opacity-100 transition-all"
            title="حذف الملاحظة"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>
      <p className="text-(--color-text) whitespace-pre-wrap leading-relaxed mb-4">
        {note.content}
      </p>

      <NoteReplySection note={note} onReply={onReply} />
    </div>
  );
}
