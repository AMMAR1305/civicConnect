import React from 'react';
import { Settings, X, User, Mail, Shield, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProfilePopup = ({ user, onClose, isOpen }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Blurred Backdrop */}
      <div 
        className="popup-backdrop"
        onClick={onClose}
      />

      {/* Profile Popup Panel */}
      <div className="popup-panel profile-popup">
        <div className="popup-header">
          <h3 className="popup-title">Profile</h3>
          <button 
            onClick={onClose}
            className="popup-close-btn"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="popup-body">
          {/* Profile Avatar */}
          <div className="profile-avatar-section">
            <div className="profile-avatar-large">
              {user?.Name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <h4 className="profile-name">{user?.Name || 'Administrator'}</h4>
            <p className="profile-email">{user?.Email || 'admin@civicai.com'}</p>
            <span className="profile-role-badge">
              <Shield className="w-3 h-3" />
              Administrator
            </span>
          </div>

          {/* Profile Details */}
          <div className="profile-details">
            <div className="profile-detail-item">
              <User className="w-4 h-4 text-gray-500" />
              <div>
                <p className="profile-detail-label">Full Name</p>
                <p className="profile-detail-value">{user?.Name || 'Administrator'}</p>
              </div>
            </div>

            <div className="profile-detail-item">
              <Mail className="w-4 h-4 text-gray-500" />
              <div>
                <p className="profile-detail-label">Email Address</p>
                <p className="profile-detail-value">{user?.Email || 'admin@civicai.com'}</p>
              </div>
            </div>

            <div className="profile-detail-item">
              <Shield className="w-4 h-4 text-gray-500" />
              <div>
                <p className="profile-detail-label">Role</p>
                <p className="profile-detail-value">Administrator</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="profile-actions">
            <button 
              onClick={() => navigate('/profile')}
              className="profile-action-btn primary"
            >
              <Settings className="w-4 h-4" />
              Profile Settings
            </button>
            
            <button 
              onClick={handleLogout}
              className="profile-action-btn danger"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePopup;
