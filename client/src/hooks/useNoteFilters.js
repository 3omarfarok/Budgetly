import { useState, useMemo } from "react";

export function useNoteFilters(notes) {
  const [searchText, setSearchText] = useState("");
  const [selectedUser, setSelectedUser] = useState("");

  const uniqueUsers = useMemo(() => {
    return [
      ...new Set(notes.map((note) => note.createdBy?.name).filter(Boolean)),
    ];
  }, [notes]);

  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      const matchesSearch =
        note.content.toLowerCase().includes(searchText.toLowerCase()) ||
        note.replies?.some((r) =>
          r.content.toLowerCase().includes(searchText.toLowerCase())
        );

      const matchesUser = selectedUser
        ? note.createdBy?.name === selectedUser
        : true;

      return matchesSearch && matchesUser;
    });
  }, [notes, searchText, selectedUser]);

  return {
    searchText,
    setSearchText,
    selectedUser,
    setSelectedUser,
    filteredNotes,
    uniqueUsers,
  };
}
