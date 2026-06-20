const { pool } = require('../config/db');

const TagModel = {
  async getAll(userId) {
    const [rows] = await pool.query(
      'SELECT * FROM tags WHERE user_id = ? ORDER BY name ASC',
      [userId]
    );
    return rows;
  },

  async create({ name, color, userId }) {
    const [result] = await pool.query(
      'INSERT INTO tags (name, color, user_id) VALUES (?, ?, ?)',
      [name, color || '#6366f1', userId]
    );
    return result.insertId;
  },

  async update(id, userId, { name, color }) {
    await pool.query(
      'UPDATE tags SET name = ?, color = ? WHERE id = ? AND user_id = ?',
      [name, color, id, userId]
    );
  },

  async delete(id, userId) {
    const [result] = await pool.query(
      'DELETE FROM tags WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return result.affectedRows;
  }
};

module.exports = TagModel;
