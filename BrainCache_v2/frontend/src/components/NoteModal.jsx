import React, { useState, useEffect } from 'react';
import { X, Upload, Link, FileText, Image as ImageIcon, Sparkles, Download } from 'lucide-react';
import { api } from '../api';

const NOTE_TYPES = [
  { value: 'text', label: 'Text', icon: <FileText size={14} /> },
  { value: 'image', label: 'Image', icon: <ImageIcon size={14} /> },
  { value: 'link', label: 'Link', icon: <Link size={14} /> },
  { value: 'file', label: 'File', icon: <Upload size={14} /> },
];

export default function NoteModal({ note, tags, onClose, onSave, toast }) {
  const [form, setForm] = useState({
    title: '',
    content: '',
    type: 'text',
    link_url: '',
    selectedTags: []
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  // AI Summary state
  const [aiSummary, setAiSummary] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);

  useEffect(() => {
    if (note) {
      setForm({
        title: note.title || '',
        content: note.content || '',
        type: note.type || 'text',
        link_url: note.link_url || '',
        selectedTags: note.tags?.map(t => t.id) || []
      });
      if (note.media_url) setPreview(note.media_url);
    }
    // Reset summary when note changes
    setAiSummary('');
  }, [note]);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    if (f.type.startsWith('image/')) {
      setPreview(URL.createObjectURL(f));
    }
  };

  const toggleTag = (tagId) => {
    setForm(prev => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tagId)
        ? prev.selectedTags.filter(id => id !== tagId)
        : [...prev.selectedTags, tagId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('content', form.content);
      formData.append('type', form.type);
      if (form.link_url) formData.append('link_url', form.link_url);
      formData.append('tags', JSON.stringify(form.selectedTags));
      if (file) formData.append('media', file);

      if (note) {
        await api.put(`/notes/${note.id}`, formData);
        toast.success('Note updated!');
      } else {
        await api.post('/notes', formData);
        toast.success('Note created!');
      }
      onSave();
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // AI Summary handler
  const handleAiSummary = async () => {
    if (!note || !note.id) return;
    setSummaryLoading(true);
    setAiSummary('');
    try {
      const data = await api.post(`/ai/summarize/${note.id}`);
      setAiSummary(data.summary);
      toast.success('Summary generated!');
    } catch (err) {
      toast.error(err.message || 'Failed to generate summary');
    } finally {
      setSummaryLoading(false);
    }
  };

  // PDF Export handler (only for text and image notes)
  const handleExportPdf = () => {
    if (!note) return;

    // Get selected tag details
    const selectedTagDetails = tags.filter(t => form.selectedTags.includes(t.id));

    // Build the PDF HTML
    const pdfHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${form.title} - BrainCache</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
            color: #1e293b;
            line-height: 1.7;
            padding: 48px 56px;
            max-width: 800px;
            margin: 0 auto;
          }
          .pdf-header {
            border-bottom: 2px solid #6366f1;
            padding-bottom: 20px;
            margin-bottom: 32px;
          }
          .pdf-brand {
            font-size: 13px;
            color: #6366f1;
            font-weight: 600;
            letter-spacing: 0.5px;
            margin-bottom: 12px;
          }
          .pdf-title {
            font-size: 26px;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 8px;
          }
          .pdf-meta {
            font-size: 12px;
            color: #94a3b8;
          }
          .pdf-content {
            font-size: 15px;
            color: #334155;
            line-height: 1.8;
            margin-bottom: 36px;
            white-space: pre-wrap;
            word-wrap: break-word;
          }
          .pdf-image {
            max-width: 100%;
            max-height: 420px;
            border-radius: 8px;
            margin-bottom: 36px;
            display: block;
          }
          .pdf-summary-section {
            background: #f0f0ff;
            border: 1px solid #c7d2fe;
            border-radius: 10px;
            padding: 20px 24px;
            margin-bottom: 28px;
          }
          .pdf-summary-title {
            font-size: 14px;
            font-weight: 700;
            color: #6366f1;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 6px;
          }
          .pdf-summary-text {
            font-size: 14px;
            color: #475569;
            line-height: 1.7;
          }
          .pdf-tags-section {
            margin-top: 12px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
          }
          .pdf-tags-label {
            font-size: 12px;
            font-weight: 600;
            color: #94a3b8;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 10px;
          }
          .pdf-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
          }
          .pdf-tag {
            display: inline-block;
            padding: 4px 14px;
            border-radius: 999px;
            font-size: 12px;
            font-weight: 500;
            color: white;
          }
          .pdf-footer {
            margin-top: 40px;
            padding-top: 16px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            font-size: 11px;
            color: #cbd5e1;
          }
          @media print {
            body { padding: 24px 36px; }
            .pdf-summary-section { break-inside: avoid; }
            .pdf-tags-section { break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="pdf-header">
          <div class="pdf-brand">🧠 BrainCache</div>
          <h1 class="pdf-title">${escapeHtml(form.title)}</h1>
          <div class="pdf-meta">
            Type: ${form.type.charAt(0).toUpperCase() + form.type.slice(1)} &nbsp;|&nbsp; 
            Exported: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        ${form.type === 'image' && (preview || note.media_url) ? `<img class="pdf-image" src="${preview || note.media_url}" alt="${escapeHtml(form.title)}" />` : ''}

        ${form.content ? `<div class="pdf-content">${escapeHtml(form.content)}</div>` : ''}

        ${aiSummary ? `
          <div class="pdf-summary-section">
            <div class="pdf-summary-title">✨ AI Summary</div>
            <div class="pdf-summary-text">${escapeHtml(aiSummary)}</div>
          </div>
        ` : ''}

        ${selectedTagDetails.length > 0 ? `
          <div class="pdf-tags-section">
            <div class="pdf-tags-label">Tags</div>
            <div class="pdf-tags">
              ${selectedTagDetails.map(tag => `<span class="pdf-tag" style="background-color: ${tag.color};">${escapeHtml(tag.name)}</span>`).join('')}
            </div>
          </div>
        ` : ''}

        <div class="pdf-footer">Generated by BrainCache</div>
      </body>
      </html>
    `;

    // Open a new window for printing
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write(pdfHtml);
      printWindow.document.close();
      // Wait for images to load before printing
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 500);
      };
      // Fallback if onload doesn't fire
      setTimeout(() => {
        try {
          printWindow.print();
          printWindow.close();
        } catch (e) { /* window already handled */ }
      }, 2000);
    } else {
      toast.error('Pop-up blocked. Please allow pop-ups for PDF export.');
    }
  };

  // Helper to escape HTML characters
  function escapeHtml(text) {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Check if export is available (only text and image)
  const canExport = note && (note.type === 'text' || note.type === 'image');

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3>{note ? 'Edit Note' : 'Create Note'}</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Type selector */}
            <div className="form-group">
              <label className="form-label">Type</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {NOTE_TYPES.map(t => (
                  <button
                    key={t.value}
                    type="button"
                    className={`filter-btn ${form.type === t.value ? 'active' : ''}`}
                    onClick={() => setForm(p => ({ ...p, type: t.value }))}
                    style={{ display: 'flex', alignItems: 'center', gap: 5 }}
                  >
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Title *</label>
              <input
                className="form-input"
                placeholder="Note title..."
                value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Content</label>
              <textarea
                className="form-input"
                placeholder="Write your note here..."
                value={form.content}
                onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                rows={4}
              />
            </div>

            {form.type === 'link' && (
              <div className="form-group">
                <label className="form-label">URL</label>
                <input
                  className="form-input"
                  placeholder="https://..."
                  value={form.link_url}
                  onChange={e => setForm(p => ({ ...p, link_url: e.target.value }))}
                />
              </div>
            )}

            {(form.type === 'image' || form.type === 'file') && (
              <div className="form-group">
                <label className="form-label">Upload {form.type === 'image' ? 'Image' : 'File'}</label>
                <label className="file-upload-area">
                  {preview && form.type === 'image' ? (
                    <img src={preview} alt="preview" style={{ maxHeight: 150, borderRadius: 8 }} />
                  ) : (
                    <>
                      <Upload size={28} />
                      <p>{file ? file.name : `Click to upload ${form.type === 'image' ? 'an image' : 'a file'}`}</p>
                    </>
                  )}
                  <input type="file" style={{ display: 'none' }}
                    accept={form.type === 'image' ? 'image/*' : '*'}
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            )}

            {tags.length > 0 && (
              <div className="form-group">
                <label className="form-label">Tags</label>
                <div className="tag-selector">
                  {tags.map(tag => (
                    <button
                      key={tag.id}
                      type="button"
                      className={`tag-option ${form.selectedTags.includes(tag.id) ? 'selected' : ''}`}
                      style={form.selectedTags.includes(tag.id)
                        ? { background: tag.color, color: 'white', borderColor: tag.color }
                        : {}}
                      onClick={() => toggleTag(tag.id)}
                    >
                      <span className="tag-dot" style={{ background: form.selectedTags.includes(tag.id) ? 'white' : tag.color }} />
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* AI Summary Section */}
            {note && aiSummary && (
              <div className="ai-summary-section">
                <div className="ai-summary-header">
                  <Sparkles size={16} />
                  <span>AI Summary</span>
                </div>
                <p className="ai-summary-text">{aiSummary}</p>
              </div>
            )}
          </div>
          <div className="modal-footer">
            {/* AI Summary & Export buttons on the left */}
            {note && (
              <div className="modal-footer-left">
                <button
                  type="button"
                  className="btn btn-ai-summary"
                  onClick={handleAiSummary}
                  disabled={summaryLoading}
                >
                  {summaryLoading ? (
                    <><div className="spinner-small"></div> Generating...</>
                  ) : (
                    <><Sparkles size={14} /> AI Summary</>
                  )}
                </button>
                {canExport && (
                  <button
                    type="button"
                    className="btn btn-export-pdf"
                    onClick={handleExportPdf}
                  >
                    <Download size={14} /> Export PDF
                  </button>
                )}
              </div>
            )}
            <div className="modal-footer-right">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving...' : note ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
