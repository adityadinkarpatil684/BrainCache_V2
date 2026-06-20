import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Search, SlidersHorizontal } from 'lucide-react';
import { api } from '../api';
import NoteCard from '../components/NoteCard';
import NoteModal from '../components/NoteModal';

const TYPES = ['all', 'text', 'image', 'link', 'file'];

export default function DashboardPage() {
  const { tags, fetchTags, selectedTag, toast } = useOutletContext();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editNote, setEditNote] = useState(null);

  const fetchNotes = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (typeFilter !== 'all') params.set('type', typeFilter);
      if (selectedTag) params.set('tag_id', selectedTag);
      const data = await api.get(`/notes?${params.toString()}`);
      setNotes(data.notes);
    } catch (err) {
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter, selectedTag]);

  useEffect(() => {
    const timer = setTimeout(fetchNotes, 300);
    return () => clearTimeout(timer);
  }, [fetchNotes]);

  const handleEdit = (note) => {
    setEditNote(note);
    setShowModal(true);
  };

  const handleCreate = () => {
    setEditNote(null);
    setShowModal(true);
  };

  const handleDelete = async (note) => {
    if (!confirm(`Delete "${note.title}"?`)) return;
    try {
      await api.delete(`/notes/${note.id}`);
      toast.success('Note deleted');
      fetchNotes();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handlePin = async (note) => {
    try {
      await api.patch(`/notes/${note.id}/pin`);
      fetchNotes();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleArchive = async (note) => {
    try {
      await api.patch(`/notes/${note.id}/archive`);
      toast.success('Note archived');
      fetchNotes();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const pinned = notes.filter(n => n.is_pinned);
  const unpinned = notes.filter(n => !n.is_pinned);

  return (
    <>
      {/* Topbar */}
      <div className="topbar">
        <span className="topbar-title">My Notes</span>
        <div className="search-box">
          <Search size={16} />
          <input
            placeholder="Search notes..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="topbar-actions">
          <button className="btn btn-primary" onClick={handleCreate}>
            <Plus size={16} /> New Note
          </button>
        </div>
      </div>

      <div className="page">
        {/* Filter bar */}
        <div className="filter-bar">
          <SlidersHorizontal size={15} style={{ color: 'var(--text-muted)' }} />
          {TYPES.map(t => (
            <button
              key={t}
              className={`filter-btn ${typeFilter === t ? 'active' : ''}`}
              onClick={() => setTypeFilter(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <div className="spinner" />
          </div>
        ) : (
          <div className="notes-grid">
            {notes.length === 0 && (
              <div className="empty-state">
                <Plus size={48} />
                <h3>No notes found</h3>
                <p>{search ? 'Try a different search term' : 'Create your first note to get started'}</p>
                <button className="btn btn-primary" onClick={handleCreate}>
                  <Plus size={16} /> Create Note
                </button>
              </div>
            )}

            {pinned.length > 0 && (
              <>
                <div className="notes-section-title">📌 Pinned</div>
                {pinned.map(note => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onPin={handlePin}
                    onArchive={handleArchive}
                  />
                ))}
              </>
            )}

            {unpinned.length > 0 && (
              <>
                {pinned.length > 0 && <div className="notes-section-title">Other Notes</div>}
                {unpinned.map(note => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onPin={handlePin}
                    onArchive={handleArchive}
                  />
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <NoteModal
          note={editNote}
          tags={tags}
          onClose={() => { setShowModal(false); setEditNote(null); }}
          onSave={() => { fetchNotes(); fetchTags(); }}
          toast={toast}
        />
      )}
    </>
  );
}
