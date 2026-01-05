import { StickyNote } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNotes } from "../hooks/useNotes";
import { useNoteFilters } from "../hooks/useNoteFilters";
import NoteFilters from "../components/notes/NoteFilters";
import CreateNoteForm from "../components/notes/CreateNoteForm";
import NoteList from "../components/notes/NoteList";

export default function NotesPage() {
  const { user } = useAuth();
  const { notes, loading, submitting, addNote, deleteNote, addReply } =
    useNotes();
  const {
    searchText,
    setSearchText,
    selectedUser,
    setSelectedUser,
    filteredNotes,
    uniqueUsers,
  } = useNoteFilters(notes);

  return (
    <div className="max-w-2xl mx-auto pb-20">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-(--color-primary) mb-2 flex items-center justify-center gap-3">
          <StickyNote className="w-8 h-8" />
          ملاحظات البيت
        </h1>
        <p className="text-(--color-muted)">
          شارك أفكارك وملاحظاتك مع أهل البيت
        </p>
      </div>

      <NoteFilters
        searchText={searchText}
        setSearchText={setSearchText}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        uniqueUsers={uniqueUsers}
      />

      <CreateNoteForm onAddNote={addNote} submitting={submitting} />

      <NoteList
        notes={filteredNotes}
        loading={loading}
        currentUser={user}
        onDelete={deleteNote}
        onReply={addReply}
        hasFilters={searchText || selectedUser}
      />
    </div>
  );
}
