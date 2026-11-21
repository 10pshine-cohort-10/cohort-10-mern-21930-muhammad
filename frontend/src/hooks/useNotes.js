import { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

export function useNotes() {
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const { token, isAuthenticated } = useAuth();

  const fetchNotes = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    setErrorMessage('');
    try {
      let endpoint = '/notes';
      const params = {};

      if (searchQuery.trim()) {
        endpoint = '/notes/search';
        params.q = searchQuery.trim();
      } else if (selectedTag) {
        params.tag = selectedTag;
      }

      const response = await client.get(endpoint, { params });
      setNotes(response.data.data);
    } catch (err) {
      setErrorMessage(err.response?.data?.error || 'Failed to load notes');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, searchQuery, selectedTag]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  useEffect(() => {
    if (!token) return;

    const socketUrl =
      typeof process !== 'undefined' && process.env?.VITE_API_URL
        ? process.env.VITE_API_URL.replace(/\/api\/?$/, '')
        : 'http://localhost:3000';

    const socket = io(socketUrl, {
      auth: { token },
      withCredentials: true,
    });

    socket.on('note:created', (newNote) => {
      setNotes((prev) => {
        if (prev.some((n) => n.id === newNote.id)) return prev;
        return [newNote, ...prev];
      });
    });

    socket.on('note:updated', (updatedNote) => {
      setNotes((prev) =>
        prev.map((n) => (n.id === updatedNote.id ? updatedNote : n))
      );
    });

    socket.on('note:deleted', ({ id }) => {
      setNotes((prev) => prev.filter((n) => n.id !== id));
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  const createNote = async (noteData) => {
    try {
      const response = await client.post('/notes', noteData);
      const created = response.data.data;
      setNotes((prev) => [created, ...prev.filter((n) => n.id !== created.id)]);
      return created;
    } catch (err) {
      console.error('Failed to create note:', err);
      throw err;
    }
  };

  const updateNote = async (id, noteData) => {
    try {
      const response = await client.put(`/notes/${id}`, noteData);
      const updated = response.data.data;
      setNotes((prev) => prev.map((n) => (n.id === id ? updated : n)));
      return updated;
    } catch (err) {
      console.error(`Failed to update note ${id}:`, err);
      throw err;
    }
  };

  const deleteNote = async (id) => {
    try {
      await client.delete(`/notes/${id}`);
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error(`Failed to delete note ${id}:`, err);
      throw err;
    }
  };

  const togglePin = async (id, isPinned) => {
    return updateNote(id, { isPinned });
  };

  const exportNotes = async (format = 'json') => {
    try {
      const response = await client.get(`/notes/export?format=${format}`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], {
        type: format === 'markdown' ? 'text/markdown' : 'application/json',
      });
      const downloadUrl = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = downloadUrl;
      anchor.download = `notes-backup-${Date.now()}.${format === 'markdown' ? 'md' : 'json'}`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Failed to export notes:', err);
      throw err;
    }
  };

  const importNotes = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const parsed = JSON.parse(e.target.result);
          const response = await client.post('/notes/import', parsed);
          await fetchNotes();
          resolve(response.data.data);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsText(file);
    });
  };

  const allTags = Array.from(
    new Set(notes.flatMap((n) => (Array.isArray(n.tags) ? n.tags : [])))
  ).sort();

  return {
    notes,
    isLoading,
    searchQuery,
    setSearchQuery,
    selectedTag,
    setSelectedTag,
    errorMessage,
    allTags,
    fetchNotes,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
    exportNotes,
    importNotes,
  };
}
