import { useState, useEffect, useCallback, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import type { Note, NoteInput, ApiResponse } from '../types';

function resolveSocketUrl(): string {
  const apiUrl: string =
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
    'http://localhost:3000';
  return apiUrl.replace(/\/api\/?$/, '');
}

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const requestIdRef = useRef<number>(0);
  const selectedTagRef = useRef<string>(selectedTag);
  const { token, isAuthenticated } = useAuth();

  useEffect(() => {
    selectedTagRef.current = selectedTag;
  }, [selectedTag]);

  const matchesTag = useCallback((note: Note): boolean => {
    const activeTag = selectedTagRef.current;
    if (!activeTag) return true;
    return Array.isArray(note.tags) && note.tags.includes(activeTag);
  }, []);

  const fetchNotes = useCallback(async (): Promise<void> => {
    if (!isAuthenticated) return;
    const currentRequestId = ++requestIdRef.current;
    setIsLoading(true);
    setErrorMessage('');

    try {
      let endpoint = '/notes';
      const params: Record<string, string> = {};

      if (searchQuery.trim()) {
        endpoint = '/notes/search';
        params.q = searchQuery.trim();
      } else if (selectedTag) {
        params.tag = selectedTag;
      }

      const response = await client.get<ApiResponse<Note[]>>(endpoint, { params });
      if (currentRequestId === requestIdRef.current) {
        setNotes(response.data.data || []);
      }
    } catch (err: unknown) {
      if (currentRequestId === requestIdRef.current) {
        const errorObj = err as { response?: { data?: { error?: string } } };
        setErrorMessage(errorObj.response?.data?.error || 'Failed to load notes');
      }
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, [isAuthenticated, searchQuery, selectedTag]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  useEffect(() => {
    if (!token) return;

    const socketUrl = resolveSocketUrl();
    const socket: Socket = io(socketUrl, {
      auth: { token },
      withCredentials: true,
    });

    socket.on('note:created', (newNote: Note) => {
      setNotes((prev) => {
        if (!matchesTag(newNote)) return prev;
        if (prev.some((n) => n.id === newNote.id)) return prev;
        return [newNote, ...prev];
      });
    });

    socket.on('note:updated', (updatedNote: Note) => {
      setNotes((prev) => {
        if (!matchesTag(updatedNote)) {
          return prev.filter((n) => n.id !== updatedNote.id);
        }
        const exists = prev.some((n) => n.id === updatedNote.id);
        if (exists) {
          return prev.map((n) => (n.id === updatedNote.id ? updatedNote : n));
        }
        return [updatedNote, ...prev];
      });
    });

    socket.on('note:deleted', ({ id }: { id: string }) => {
      setNotes((prev) => prev.filter((n) => n.id !== id));
    });

    socket.on('note:imported', () => {
      fetchNotes();
    });

    return () => {
      socket.disconnect();
    };
  }, [token, matchesTag, fetchNotes]);

  const createNote = async (noteData: NoteInput): Promise<Note> => {
    try {
      const response = await client.post<ApiResponse<Note>>('/notes', noteData);
      const created = response.data.data!;
      if (matchesTag(created)) {
        setNotes((prev) => [created, ...prev.filter((n) => n.id !== created.id)]);
      }
      return created;
    } catch (err) {
      console.error('Failed to create note:', err);
      throw err;
    }
  };

  const updateNote = async (id: string, noteData: NoteInput): Promise<Note> => {
    try {
      const response = await client.put<ApiResponse<Note>>(`/notes/${id}`, noteData);
      const updated = response.data.data!;
      if (matchesTag(updated)) {
        setNotes((prev) => prev.map((n) => (n.id === id ? updated : n)));
      } else {
        setNotes((prev) => prev.filter((n) => n.id !== id));
      }
      return updated;
    } catch (err) {
      console.error(`Failed to update note ${id}:`, err);
      throw err;
    }
  };

  const deleteNote = async (id: string): Promise<void> => {
    try {
      await client.delete(`/notes/${id}`);
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error(`Failed to delete note ${id}:`, err);
      throw err;
    }
  };

  const togglePin = async (id: string, isPinned: boolean): Promise<Note> => {
    return updateNote(id, { isPinned });
  };

  const exportNotes = async (format: 'json' | 'markdown' = 'json'): Promise<void> => {
    try {
      const response = await client.get(`/notes/export?format=${format}`, { responseType: 'blob' });
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

  const importNotes = async (file: File): Promise<Note[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const rawText = (e.target?.result as string) || '';
          const parsed: unknown = JSON.parse(rawText);
          if (!Array.isArray(parsed) || parsed.length === 0) {
            throw new Error('Invalid import file: expected a non-empty array of notes');
          }
          for (const item of parsed) {
            if (!item || typeof item !== 'object' || Array.isArray(item)) {
              throw new Error('Invalid import file: every entry must be a valid note object');
            }
          }
          const response = await client.post<ApiResponse<Note[]>>('/notes/import', parsed);
          await fetchNotes();
          resolve(response.data.data || []);
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
