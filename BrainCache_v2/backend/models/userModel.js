const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');

const UserModel = {
  async findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
  },

  async findByUsername(username) {
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await pool.query(
      'SELECT id, username, email, avatar, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  async create({ username, email, password }) {
    const hashed = await bcrypt.hash(password, 12);
    const [result] = await pool.query(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashed]
    );
    return result.insertId;
  },

  async updateAvatar(id, avatar) {
    await pool.query('UPDATE users SET avatar = ? WHERE id = ?', [avatar, id]);
  },

  async updateProfile(id, { username, email }) {
    await pool.query('UPDATE users SET username = ?, email = ? WHERE id = ?', [username, email, id]);
  },

  async comparePassword(plain, hashed) {
    return bcrypt.compare(plain, hashed);
  }
};

module.exports = UserModel;
