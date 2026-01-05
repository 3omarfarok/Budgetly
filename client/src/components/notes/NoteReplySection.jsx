import { useState } from "react";
import { Send, MessageCircle } from "lucide-react";

export default function NoteReplySection({ note, onReply }) {
  const [replyingTo, setReplyingTo] = useState(false);
  const [replyContent, setReplyContent] = useState("");

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("ar-EG", {
      day: "numeric",
      month: "long",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const handleSubmit = async () => {
    const success = await onReply(note._id, replyContent);
    if (success) {
      setReplyContent("");
      setReplyingTo(false);
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-(--color-border)">
      {note.replies?.length > 0 && (
        <div className="space-y-3 mb-4 pl-4 border-l-2 border-(--color-border)">
          {note.replies.map((reply) => (
            <div key={reply._id} className="text-sm">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-(--color-text)">
                  {reply.createdBy?.name}
                </span>
                <span className="text-xs text-(--color-muted)">
                  {formatDate(reply.createdAt)}
                </span>
              </div>
              <p className="text-(--color-muted) whitespace-pre-wrap">
                {reply.content}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Reply Input */}
      {replyingTo ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="اكتب ردك هنا..."
            autoFocus
            className="flex-1 bg-(--color-bg) border border-(--color-border) rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-(--color-primary)"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          <button
            onClick={handleSubmit}
            disabled={!replyContent.trim()}
            className="p-2 bg-(--color-primary) text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Send size={16} />
          </button>
          <button
            onClick={() => {
              setReplyingTo(false);
              setReplyContent("");
            }}
            className="p-2 text-(--color-muted) hover:bg-(--color-bg) rounded-lg"
          >
            ×
          </button>
        </div>
      ) : (
        <button
          onClick={() => setReplyingTo(true)}
          className="flex items-center gap-2 text-sm text-(--color-muted) hover:text-(--color-primary) transition-colors"
        >
          <MessageCircle size={16} />
          <span>رد على الملاحظة</span>
        </button>
      )}
    </div>
  );
}
