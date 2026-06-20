const TagModel = require('../models/tagModel');

const getTags = async (req, res) => {
  try {
    const tags = await TagModel.getAll(req.user.id);
    res.json({ tags });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch tags' });
  }
};

const createTag = async (req, res) => {
  try {
    const { name, color } = req.body;
    if (!name) return res.status(400).json({ message: 'Tag name is required' });

    const tagId = await TagModel.create({ name, color, userId: req.user.id });
    res.status(201).json({ message: 'Tag created', tag: { id: tagId, name, color: color || '#6366f1' } });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Tag with this name already exists' });
    }
    res.status(500).json({ message: 'Failed to create tag' });
  }
};

const updateTag = async (req, res) => {
  try {
    const { name, color } = req.body;
    await TagModel.update(req.params.id, req.user.id, { name, color });
    res.json({ message: 'Tag updated' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update tag' });
  }
};

const deleteTag = async (req, res) => {
  try {
    const deleted = await TagModel.delete(req.params.id, req.user.id);
    if (!deleted) return res.status(404).json({ message: 'Tag not found' });
    res.json({ message: 'Tag deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete tag' });
  }
};

module.exports = { getTags, createTag, updateTag, deleteTag };
