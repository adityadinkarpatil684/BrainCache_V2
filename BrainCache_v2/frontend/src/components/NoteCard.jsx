import React from 'react';
import { Pin, Archive, Trash2, Edit2, Link, FileText, Image as ImageIcon, File, ArchiveRestore } from 'lucide-react';

const typeIcon = {
  text: <FileText size={11} />,
  image: <ImageIcon size={11} />,
  link: <Link size={11} />,
  file: <File size={11} />,
};

export default function NoteCard({ note, onEdit, onDelete, onPin, onArchive, showArchiveRestore = false }) {
  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div className={`note-card ${note.is_pinned ? 'pinned' : ''}`} onClick={() => onEdit && onEdit(note)}>
      <div className="note-card-header">
        <div className="note-card-title">{note.title}</div>
        <div className="note-card-actions" onClick={e => e.stopPropagation()}>
          {onPin && (
            <button
              className={`note-action-btn ${note.is_pinned ? 'pinned' : ''}`}
              onClick={() => onPin(note)}
              title={note.is_pinned ? 'Unpin' : 'Pin'}
            >
              <Pin size={14} />
            </button>
          )}
          {onArchive && (
            <button className="note-action-btn" onClick={() => onArchive(note)}
              title={showArchiveRestore ? 'Unarchive' : 'Archive'}>
              {showArchiveRestore ? <ArchiveRestore size={14} /> : <Archive size={14} />}
            </button>
          )}
          {onEdit && (
            <button className="note-action-btn" onClick={(e) => { e.stopPropagation(); onEdit(note); }} title="Edit">
              <Edit2 size={14} />
            </button>
          )}
          {onDelete && (
            <button className="note-action-btn danger" onClick={(e) => { e.stopPropagation(); onDelete(note); }} title="Delete">
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {note.content && (
        <div className="note-card-content"><p>{note.content}</p></div>
      )}

      {note.type === 'image' && note.media_url && (
        <div className="note-card-img">
          <img src={note.media_url} alt={note.title} />
        </div>
      )}

      {note.type === 'link' && note.link_url && (
        <a className="note-card-link" href={note.link_url} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}>
          <Link size={12} /> {note.link_url}
        </a>
      )}

      {note.type === 'file' && note.media_url && (
        <a className="note-card-link" href={note.media_url} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}>
          <File size={12} /> View File
        </a>
      )}

      <div className="note-card-footer">
        <div className="note-tags">
          <span className="note-type-badge">{typeIcon[note.type]} {note.type}</span>
          {note.tags?.slice(0, 2).map(tag => (
            <span
              key={tag.id}
              className="note-tag"
              style={{ '--tag-color': tag.color }}
            >
              {tag.name}
            </span>
          ))}
          {note.tags?.length > 2 && (
            <span className="note-tag" style={{ '--tag-color': 'var(--text-muted)' }}>+{note.tags.length - 2}</span>
          )}
        </div>
        <span className="note-date">{formatDate(note.updated_at)}</span>
      </div>
    </div>
  );
}
