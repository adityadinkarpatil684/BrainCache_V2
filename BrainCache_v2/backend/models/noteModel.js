const { pool } = require('../config/db');

const NoteModel = {
  async getAll(userId, filters = {}) {
    let query = `
      SELECT n.*, GROUP_CONCAT(t.id) as tag_ids, GROUP_CONCAT(t.name) as tag_names, GROUP_CONCAT(t.color) as tag_colors
      FROM notes n
      LEFT JOIN note_tags nt ON n.id = nt.note_id
      LEFT JOIN tags t ON nt.tag_id = t.id
      WHERE n.user_id = ? AND n.is_archived = 0
    `;
    const params = [userId];

    if (filters.search) {
      query += ' AND (n.title LIKE ? OR n.content LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    if (filters.type) {
      query += ' AND n.type = ?';
      params.push(filters.type);
    }

    if (filters.tag_id) {
      query += ' AND nt.tag_id = ?';
      params.push(filters.tag_id);
    }

    query += ' GROUP BY n.id ORDER BY n.is_pinned DESC, n.updated_at DESC';

    const [rows] = await pool.query(query, params);
    return rows.map(formatNote);
  },

  async getArchived(userId) {
    const [rows] = await pool.query(`
      SELECT n.*, GROUP_CONCAT(t.id) as tag_ids, GROUP_CONCAT(t.name) as tag_names, GROUP_CONCAT(t.color) as tag_colors
      FROM notes n
      LEFT JOIN note_tags nt ON n.id = nt.note_id
      LEFT JOIN tags t ON nt.tag_id = t.id
      WHERE n.user_id = ? AND n.is_archived = 1
      GROUP BY n.id ORDER BY n.updated_at DESC
    `, [userId]);
    return rows.map(formatNote);
  },

  async getById(id, userId) {
    const [rows] = await pool.query(`
      SELECT n.*, GROUP_CONCAT(t.id) as tag_ids, GROUP_CONCAT(t.name) as tag_names, GROUP_CONCAT(t.color) as tag_colors
      FROM notes n
      LEFT JOIN note_tags nt ON n.id = nt.note_id
      LEFT JOIN tags t ON nt.tag_id = t.id
      WHERE n.id = ? AND n.user_id = ?
      GROUP BY n.id
    `, [id, userId]);
    return rows[0] ? formatNote(rows[0]) : null;
  },

  async create({ title, content, type, media_url, media_public_id, link_url, userId }) {
    const [result] = await pool.query(
      'INSERT INTO notes (title, content, type, media_url, media_public_id, link_url, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, content || '', type || 'text', media_url || null, media_public_id || null, link_url || null, userId]
    );
    return result.insertId;
  },

  async update(id, userId, fields) {
    const allowed = ['title', 'content', 'type', 'media_url', 'link_url', 'is_pinned', 'is_archived'];
    const updates = [];
    const values = [];
    for (const key of allowed) {
      if (fields[key] !== undefined) {
        updates.push(`${key} = ?`);
        values.push(fields[key]);
      }
    }
    if (!updates.length) return;
    values.push(id, userId);
    await pool.query(`UPDATE notes SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`, values);
  },

  async delete(id, userId) {
    const [result] = await pool.query('DELETE FROM notes WHERE id = ? AND user_id = ?', [id, userId]);
    return result.affectedRows;
  },

  async setTags(noteId, tagIds) {
    await pool.query('DELETE FROM note_tags WHERE note_id = ?', [noteId]);
    if (tagIds && tagIds.length > 0) {
      const values = tagIds.map(tid => [noteId, tid]);
      await pool.query('INSERT INTO note_tags (note_id, tag_id) VALUES ?', [values]);
    }
  }
};

function formatNote(row) {
  const tags = [];
  if (row.tag_ids) {
    const ids = row.tag_ids.split(',');
    const names = row.tag_names.split(',');
    const colors = row.tag_colors.split(',');
    ids.forEach((id, i) => {
      if (id) tags.push({ id: Number(id), name: names[i], color: colors[i] });
    });
  }
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    type: row.type,
    media_url: row.media_url,
    link_url: row.link_url,
    is_pinned: !!row.is_pinned,
    is_archived: !!row.is_archived,
    user_id: row.user_id,
    created_at: row.created_at,
    updated_at: row.updated_at,
    tags
  };
}

module.exports = NoteModel;
