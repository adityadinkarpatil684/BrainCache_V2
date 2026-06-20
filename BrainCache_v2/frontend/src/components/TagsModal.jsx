import React, { useState } from 'react';
import { X, Plus, Trash2, Edit2, Check } from 'lucide-react';
import { api } from '../api';

export default function TagsModal({ tags, onClose, onUpdate, toast }) {
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#6366f1');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      setLoading(true);
      await api.post('/tags', { name: newName.trim(), color: newColor });
      setNewName('');
      setNewColor('#6366f1');
      onUpdate();
      toast.success('Tag created');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this tag?')) return;
    try {
      await api.delete(`/tags/${id}`);
      onUpdate();
      toast.success('Tag deleted');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const startEdit = (tag) => {
    setEditingId(tag.id);
    setEditName(tag.name);
    setEditColor(tag.color);
  };

  const handleUpdate = async (id) => {
    try {
      await api.put(`/tags/${id}`, { name: editName, color: editColor });
      setEditingId(null);
      onUpdate();
      toast.success('Tag updated');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3>Manage Tags</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          {/* Create form */}
          <form onSubmit={handleCreate} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              className="form-input"
              placeholder="New tag name..."
              value={newName}
              onChange={e => setNewName(e.target.value)}
              style={{ flex: 1 }}
            />
            <input
              type="color"
              className="color-input"
              value={newColor}
              onChange={e => setNewColor(e.target.value)}
            />
            <button className="btn btn-primary btn-sm" type="submit" disabled={loading}>
              <Plus size={14} /> Add
            </button>
          </form>

          {/* Tags list */}
          <div className="tags-list">
            {tags.length === 0 && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '12px' }}>
                No tags yet. Create your first tag above.
              </p>
            )}
            {tags.map(tag => (
              <div key={tag.id} className="tag-manage-item">
                {editingId === tag.id ? (
                  <>
                    <input type="color" className="color-input" value={editColor} onChange={e => setEditColor(e.target.value)} />
                    <input
                      className="form-input"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      style={{ flex: 1, padding: '5px 10px' }}
                    />
                    <button className="btn btn-ghost btn-icon" onClick={() => handleUpdate(tag.id)}><Check size={15} /></button>
                    <button className="btn btn-ghost btn-icon" onClick={() => setEditingId(null)}><X size={15} /></button>
                  </>
                ) : (
                  <>
                    <span className="tag-dot" style={{ background: tag.color }} />
                    <span style={{ flex: 1, fontSize: '0.9rem' }}>{tag.name}</span>
                    <button className="btn btn-ghost btn-icon" onClick={() => startEdit(tag)}><Edit2 size={14} /></button>
                    <button className="btn btn-ghost btn-icon note-action-btn danger" onClick={() => handleDelete(tag.id)}><Trash2 size={14} /></button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
