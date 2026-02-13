import React from 'react';
import { Bell, X, AlertTriangle, CheckCircle, Info, Clock, Trash2, Check } from 'lucide-react';

const NotificationPopup = ({ notifications = [], onClose, isOpen, onClearAll, onMarkAsRead }) => {
  
  if (!isOpen) return null;

  const getNotificationIcon = (notification) => {
    if (notification.type === 'sla_breach' || notification.category === 'SLA') {
      return <AlertTriangle className="w-5 h-5 text-red-500" />;
    }
    if (notification.status === 'Resolved') {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    if (notification.status === 'In Progress') {
      return <Clock className="w-5 h-5 text-blue-500" />;
    }
    return <Info className="w-5 h-5 text-gray-500" />;
  };

  const getNotificationColor = (notification) => {
    if (notification.type === 'sla_breach' || notification.category === 'SLA') {
      return 'notification-item-danger';
    }
    if (notification.status === 'Resolved') {
      return 'notification-item-success';
    }
    if (notification.status === 'In Progress') {
      return 'notification-item-info';
    }
    return 'notification-item-default';
  };

  const getTimeAgo = (date) => {
    if (!date) return 'Just now';
    const now = new Date();
    const notifTime = new Date(date);
    const diffMs = now - notifTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <>
      {/* Blurred Backdrop */}
      <div 
        className="popup-backdrop"
        onClick={onClose}
      />

      {/* Notification Popup Panel */}
      <div className="popup-panel notification-popup">
        <div className="popup-header">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-500" />
            <h3 className="popup-title">Notifications</h3>
            {notifications.length > 0 && (
              <span className="notification-badge">{notifications.length}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <button 
                onClick={onClearAll}
                className="popup-action-btn"
                title="Clear all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button 
              onClick={onClose}
              className="popup-close-btn"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="popup-body">
          {notifications.length === 0 ? (
            <div className="notification-empty">
              <Bell className="w-16 h-16 text-gray-300 mb-3" />
              <p className="text-gray-600 font-medium">No notifications</p>
              <p className="text-gray-400 text-sm mt-1">You're all caught up!</p>
            </div>
          ) : (
            <div className="notification-list">
              {notifications.map((notification, index) => (
                <div 
                  key={index} 
                  className={`notification-item ${getNotificationColor(notification)}`}
                >
                  <div className="notification-icon">
                    {getNotificationIcon(notification)}
                  </div>
                  
                  <div className="notification-content">
                    <h4 className="notification-title">
                      {notification.title || notification.type || 'Notification'}
                    </h4>
                    <p className="notification-description">
                      {notification.description || notification.message || 'New update available'}
                    </p>
                    <div className="notification-meta">
                      <span className="notification-time">
                        {getTimeAgo(notification.updatedAt || notification.createdAt)}
                      </span>
                      {notification.status && (
                        <>
                          <span className="notification-divider">•</span>
                          <span className="notification-status">{notification.status}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {onMarkAsRead && (
                    <button 
                      onClick={() => onMarkAsRead(notification)}
                      className="notification-action-btn"
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {notifications.length > 0 && (
          <div className="popup-footer">
            <button className="popup-footer-btn">
              View All Notifications
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default NotificationPopup;
