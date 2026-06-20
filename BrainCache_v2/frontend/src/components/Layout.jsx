import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Brain, LayoutDashboard, Archive, User, LogOut, Tag, Plus, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import TagsModal from './TagsModal';
import ToastContainer from './ToastContainer';
import { useToast } from '../hooks/useToast';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tags, setTags] = useState([]);
  const [showTagsModal, setShowTagsModal] = useState(false);
  const [selectedTag, setSelectedTag] = useState(null);
  const { toasts, toast } = useToast();

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const data = await api.get('/tags');
      setTags(data.tags);
    } catch (err) {
      console.error('Failed to fetch tags');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.username?.slice(0, 2).toUpperCase() || 'U';

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Brain size={28} />
          <h1>Brain<span>Cache</span></h1>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={18} />
            Dashboard
          </NavLink>
          <NavLink to="/archive" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Archive size={18} />
            Archive
          </NavLink>
          <NavLink to="/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <User size={18} />
            Profile
          </NavLink>
        </nav>

        <div className="sidebar-tags">
          <div className="sidebar-tags-header">
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Tag size={12} /> Tags
            </span>
            <button className="tag-add-btn" onClick={() => setShowTagsModal(true)} title="Manage tags">
              <Plus size={14} />
            </button>
          </div>
          {tags.map(tag => (
            <div
              key={tag.id}
              className={`tag-item ${selectedTag === tag.id ? 'active' : ''}`}
              onClick={() => setSelectedTag(selectedTag === tag.id ? null : tag.id)}
            >
              <span className="tag-dot" style={{ background: tag.color }} />
              <span className="tag-name">{tag.name}</span>
            </div>
          ))}
          {tags.length === 0 && (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', padding: '4px 8px' }}>No tags yet</p>
          )}
        </div>

        <div className="sidebar-user" onClick={() => navigate('/profile')}>
          <div className="user-avatar">
            {user?.avatar ? <img src={user.avatar} alt="avatar" /> : initials}
          </div>
          <div className="user-info">
            <div className="user-name">{user?.username}</div>
            <div className="user-email">{user?.email}</div>
          </div>
          <button
            className="btn btn-ghost btn-icon"
            onClick={(e) => { e.stopPropagation(); handleLogout(); }}
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet context={{ tags, fetchTags, selectedTag, setSelectedTag, toast }} />
      </main>

      {showTagsModal && (
        <TagsModal
          tags={tags}
          onClose={() => setShowTagsModal(false)}
          onUpdate={fetchTags}
          toast={toast}
        />
      )}

      <ToastContainer toasts={toasts} />
    </div>
  );
}
