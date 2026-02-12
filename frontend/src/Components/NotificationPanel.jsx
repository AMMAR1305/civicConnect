import React from 'react';
import { Bell, X, AlertTriangle, CheckCircle, Info, Megaphone, Clock } from 'lucide-react';

const NotificationPanel = ({ notifications, onClose, onMarkAsRead, onClearAll }) => {
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'status_change':
        return <CheckCircle className="w-5 h-5 text-blue-600" />;
      case 'sla_breach':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'sla_warning':
        return <Clock className="w-5 h-5 text-orange-600" />;
      case 'broadcast':
        return <Megaphone className="w-5 h-5 text-purple-600" />;
      default:
        return <Info className="w-5 h-5 text-gray-600" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'status_change':
        return 'border-l-blue-500 bg-blue-50';
      case 'sla_breach':
        return 'border-l-red-500 bg-red-50';
      case 'sla_warning':
        return 'border-l-orange-500 bg-orange-50';
      case 'broadcast':
        return 'border-l-purple-500 bg-purple-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const notifTime = new Date(timestamp);
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
    <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-6 h-6 text-white" />
            <h2 className="text-xl font-bold text-white">Notifications</h2>
            {notifications.length > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {notifications.filter(n => !n.read).length}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-1 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        {notifications.length > 0 && (
          <button
            onClick={onClearAll}
            className="mt-2 text-white/90 hover:text-white text-sm underline"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
            <Bell className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg font-medium">No notifications</p>
            <p className="text-sm text-center mt-2">
              You're all caught up! Check back later for updates.
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border-l-4 ${getNotificationColor(notification.type)} ${
                  !notification.read ? 'bg-opacity-100' : 'bg-opacity-50'
                } hover:bg-opacity-75 transition-all cursor-pointer`}
                onClick={() => onMarkAsRead(notification.id)}
              >
                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-gray-900 text-sm">
                        {notification.title}
                      </h3>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1"></div>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mt-1">
                      {notification.message}
                    </p>
                    {notification.complaintId && (
                      <p className="text-xs text-gray-500 mt-1">
                        Complaint ID: {notification.complaintId}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      {getTimeAgo(notification.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;
