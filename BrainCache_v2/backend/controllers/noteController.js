const NoteModel = require('../models/noteModel');
const { cloudinary, uploadToCloudinary } = require('../config/cloudinary');

const getNotes = async (req, res) => {
  try {
    const { search, type, tag_id } = req.query;
    const notes = await NoteModel.getAll(req.user.id, { search, type, tag_id });
    res.json({ notes });
  } catch (err) {
    console.error('Get notes error:', err);
    res.status(500).json({ message: 'Failed to fetch notes' });
  }
};

const getArchived = async (req, res) => {
  try {
    const notes = await NoteModel.getArchived(req.user.id);
    res.json({ notes });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch archived notes' });
  }
};

const getNote = async (req, res) => {
  try {
    const note = await NoteModel.getById(req.params.id, req.user.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json({ note });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch note' });
  }
};

const createNote = async (req, res) => {
  try {
    const { title, content, type, link_url, tags } = req.body;
    let media_url = null, media_public_id = null;

    if (!title) return res.status(400).json({ message: 'Title is required' });

    // Manually upload buffer to Cloudinary
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, {
        folder: 'braincache',
        resource_type: 'auto'
      });
      media_url = result.url;
      media_public_id = result.public_id;
    }

    const noteId = await NoteModel.create({
      title, content, type: type || 'text',
      media_url, media_public_id, link_url,
      userId: req.user.id
    });

    // Assign tags
    if (tags) {
      const tagIds = Array.isArray(tags) ? tags : JSON.parse(tags);
      await NoteModel.setTags(noteId, tagIds);
    }

    const note = await NoteModel.getById(noteId, req.user.id);
    res.status(201).json({ message: 'Note created', note });
  } catch (err) {
    console.error('Create note error:', err);
    res.status(500).json({ message: 'Failed to create note' });
  }
};

const updateNote = async (req, res) => {
  try {
    const { title, content, type, link_url, is_pinned, is_archived, tags } = req.body;

    const existing = await NoteModel.getById(req.params.id, req.user.id);
    if (!existing) return res.status(404).json({ message: 'Note not found' });

    await NoteModel.update(req.params.id, req.user.id, {
      title, content, type, link_url, is_pinned, is_archived
    });

    if (tags !== undefined) {
      const tagIds = Array.isArray(tags) ? tags : JSON.parse(tags);
      await NoteModel.setTags(req.params.id, tagIds);
    }

    const note = await NoteModel.getById(req.params.id, req.user.id);
    res.json({ message: 'Note updated', note });
  } catch (err) {
    console.error('Update note error:', err);
    res.status(500).json({ message: 'Failed to update note' });
  }
};

const deleteNote = async (req, res) => {
  try {
    const note = await NoteModel.getById(req.params.id, req.user.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });

    // Delete from Cloudinary if media exists
    if (note.media_public_id) {
      await cloudinary.uploader.destroy(note.media_public_id);
    }

    await NoteModel.delete(req.params.id, req.user.id);
    res.json({ message: 'Note deleted' });
  } catch (err) {
    console.error('Delete note error:', err);
    res.status(500).json({ message: 'Failed to delete note' });
  }
};

const togglePin = async (req, res) => {
  try {
    const note = await NoteModel.getById(req.params.id, req.user.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });
    await NoteModel.update(req.params.id, req.user.id, { is_pinned: !note.is_pinned });
    const updated = await NoteModel.getById(req.params.id, req.user.id);
    res.json({ message: 'Pin toggled', note: updated });
  } catch (err) {
    res.status(500).json({ message: 'Failed to toggle pin' });
  }
};

const toggleArchive = async (req, res) => {
  try {
    const note = await NoteModel.getById(req.params.id, req.user.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });
    await NoteModel.update(req.params.id, req.user.id, { is_archived: !note.is_archived });
    const updated = await NoteModel.getById(req.params.id, req.user.id);
    res.json({ message: 'Archive toggled', note: updated });
  } catch (err) {
    res.status(500).json({ message: 'Failed to toggle archive' });
  }
};

module.exports = { getNotes, getArchived, getNote, createNote, updateNote, deleteNote, togglePin, toggleArchive };
