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

const CUSTOM_FOLDERS_KEY = 'notes_custom_folders';

function loadCustomFolders(): string[] {
  try {
    const raw = localStorage.getItem(CUSTOM_FOLDERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((t): t is string => typeof t === 'string') : [];
  } catch {
    return [];
  }
}

export interface UseNotesOptions {
  autoSync?: boolean;
}

export function useNotes(options: UseNotesOptions = {}) {
  const { autoSync = true } = options;
  const [notes, setNotes] = useState<Note[]>([]);
  const [knownServerTags, setKnownServerTags] = useState<string[]>([]);
  const [customFolders, setCustomFolders] = useState<string[]>(loadCustomFolders);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const requestIdRef = useRef<number>(0);
  const selectedTagRef = useRef<string>(selectedTag);
  const searchQueryRef = useRef<string>(searchQuery);
  const { token, isAuthenticated } = useAuth();

  useEffect(() => {
    selectedTagRef.current = selectedTag;
  }, [selectedTag]);

  useEffect(() => {
    searchQueryRef.current = searchQuery;
  }, [searchQuery]);

  const matchesTag = useCallback((note: Note): boolean => {
    const activeTag = selectedTagRef.current;
    if (!activeTag) return true;
    return Array.isArray(note.tags) && note.tags.includes(activeTag);
  }, []);

  const matchesSearch = useCallback((note: Note): boolean => {
    const query = searchQueryRef.current.trim().toLowerCase();
    if (!query) return true;
    const inTitle = (note.title || '').toLowerCase().includes(query);
    const inContent = (note.content || '').toLowerCase().includes(query);
    const inTags = Array.isArray(note.tags) && note.tags.some((t) => t.toLowerCase().includes(query));
    return inTitle || inContent || inTags;
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
        const fetched = response.data.data || [];
        setNotes(fetched);
        if (!searchQuery.trim() && !selectedTag) {
          setKnownServerTags(
            Array.from(new Set(fetched.flatMap((n) => (Array.isArray(n.tags) ? n.tags : []))))
          );
        }
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
    if (!autoSync) return;
    fetchNotes();
  }, [autoSync, fetchNotes]);

  useEffect(() => {
    if (!autoSync || !token) return;

    const socketUrl = resolveSocketUrl();
    const socket: Socket = io(socketUrl, {
      auth: { token },
      withCredentials: true,
    });

    socket.on('note:created', (newNote: Note) => {
      setNotes((prev) => {
        if (!matchesTag(newNote) || !matchesSearch(newNote)) return prev;
        if (prev.some((n) => n.id === newNote.id)) return prev;
        return [newNote, ...prev];
      });
    });

    socket.on('note:updated', (updatedNote: Note) => {
      setNotes((prev) => {
        const shouldInclude = matchesTag(updatedNote) && matchesSearch(updatedNote);
        if (!shouldInclude) {
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
  }, [autoSync, token, matchesTag, matchesSearch, fetchNotes]);

  const createNote = async (noteData: NoteInput): Promise<Note> => {
    try {
      const response = await client.post<ApiResponse<Note>>('/notes', noteData);
      const created = response.data.data!;
      if (matchesTag(created) && matchesSearch(created)) {
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
      if (matchesTag(updated) && matchesSearch(updated)) {
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

  const addCustomFolder = useCallback((folderName: string): string => {
    const normalized = folderName.trim().toLowerCase().replace(/^#+/, '').replace(/\s+/g, '-');
    if (!normalized) return '';
    setCustomFolders((prev) => {
      if (prev.includes(normalized)) return prev;
      const next = [...prev, normalized];
      try {
        localStorage.setItem(CUSTOM_FOLDERS_KEY, JSON.stringify(next));
      } catch {
        // Ignore storage errors in restricted environments
      }
      return next;
    });
    return normalized;
  }, []);

  const allTags = Array.from(
    new Set([
      ...knownServerTags,
      ...customFolders,
      ...notes.flatMap((n) => (Array.isArray(n.tags) ? n.tags : [])),
    ])
  ).sort();

  const removeNoteLocally = useCallback((id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const restoreNoteLocally = useCallback((note: Note) => {
    setNotes((prev) => [note, ...prev.filter((n) => n.id !== note.id)]);
  }, []);

  return {
    notes,
    isLoading,
    searchQuery,
    setSearchQuery,
    selectedTag,
    setSelectedTag,
    errorMessage,
    allTags,
    addCustomFolder,
    fetchNotes,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
    exportNotes,
    importNotes,
    removeNoteLocally,
    restoreNoteLocally,
  };
}
