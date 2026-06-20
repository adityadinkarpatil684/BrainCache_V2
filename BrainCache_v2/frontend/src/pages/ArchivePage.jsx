import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Archive } from 'lucide-react';
import { api } from '../api';
import NoteCard from '../components/NoteCard';

export default function ArchivePage() {
  const { toast } = useOutletContext();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchArchived = async () => {
    try {
      const data = await api.get('/notes/archived');
      setNotes(data.notes);
    } catch (err) {
      toast.error('Failed to load archived notes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchArchived(); }, []);

  const handleUnarchive = async (note) => {
    try {
      await api.patch(`/notes/${note.id}/archive`);
      toast.success('Note restored');
      fetchArchived();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (note) => {
    if (!confirm(`Permanently delete "${note.title}"?`)) return;
    try {
      await api.delete(`/notes/${note.id}`);
      toast.success('Note deleted permanently');
      fetchArchived();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <>
      <div className="topbar">
        <span className="topbar-title">Archive</span>
      </div>
      <div className="page">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <div className="spinner" />
          </div>
        ) : (
          <div className="notes-grid">
            {notes.length === 0 ? (
              <div className="empty-state">
                <Archive size={48} />
                <h3>Archive is empty</h3>
                <p>Archived notes will appear here</p>
              </div>
            ) : (
              notes.map(note => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onDelete={handleDelete}
                  onArchive={handleUnarchive}
                  showArchiveRestore={true}
                />
              ))
            )}
          </div>
        )}
      </div>
    </>
  );
}
