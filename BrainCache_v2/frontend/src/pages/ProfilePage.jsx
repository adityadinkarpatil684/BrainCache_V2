import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Camera, Save, User } from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { toast } = useOutletContext();
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ username: user?.username || '', email: user?.email || '' });
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api.put('/auth/profile', form);
      updateUser(data.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarLoading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const data = await api.post('/upload/avatar', formData);
      updateUser(data.user);
      toast.success('Avatar updated!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setAvatarLoading(false);
    }
  };

  const initials = user?.username?.slice(0, 2).toUpperCase() || 'U';

  return (
    <>
      <div className="topbar">
        <span className="topbar-title">Profile</span>
      </div>
      <div className="page">
        <div className="profile-grid">
          {/* Avatar card */}
          <div className="profile-card">
            <label className="profile-avatar-large" style={{ cursor: 'pointer' }}>
              {user?.avatar ? <img src={user.avatar} alt="avatar" /> : initials}
              <div className="profile-avatar-overlay">
                {avatarLoading ? <div className="spinner" style={{ width: 24, height: 24, borderWidth: 2 }} /> : <Camera size={20} color="white" />}
              </div>
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
            </label>
            <div>
              <h3 style={{ fontWeight: 700, fontSize: '1.1rem' }}>{user?.username}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{user?.email}</p>
            </div>
            <div style={{ width: '100%', padding: '12px', background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Member since</p>
              <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'Recently'}
              </p>
            </div>
          </div>

          {/* Profile form */}
          <div className="profile-info-card">
            <h3>Account Settings</h3>
            <form className="profile-form" onSubmit={handleProfileUpdate}>
              <div className="form-group">
                <label className="form-label">Username</label>
                <input
                  className="form-input"
                  value={form.username}
                  onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                  placeholder="Your username"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  className="form-input"
                  type="email"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="Your email"
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  <Save size={15} /> {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
