import React, { useState } from 'react';
import { Bell, User } from 'lucide-react';
import ProfilePopup from './ProfilePopup';
import NotificationPopup from './NotificationPopup';
import './Popup.css';

/**
 * COMPLETE EXAMPLE: Navbar with Profile & Notification Popups
 * 
 * Features:
 * ✅ Blur backdrop when popup is open
 * ✅ Click outside to close
 * ✅ Background is not clickable while popup is open
 * ✅ Smooth fade-in animations
 * ✅ Modern UI design
 * ✅ Proper z-index layering
 * ✅ useState for visibility control
 * ✅ No page refresh
 */

const NavbarExample = () => {
  // State management for popups
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Sample user data
  const currentUser = {
    Name: 'John Doe',
    Email: 'john.doe@example.com',
    Role: 'Administrator'
  };

  // Sample notifications
  const notifications = [
    {
      _id: '1',
      title: 'System Update',
      description: 'A new system update is available',
      type: 'status_change',
      status: 'In Progress',
      createdAt: new Date(Date.now() - 1000 * 60 * 5) // 5 minutes ago
    },
    {
      _id: '2',
      title: 'SLA Breach Alert',
      description: 'Complaint #12345 has breached SLA deadline',
      type: 'sla_breach',
      category: 'SLA',
      status: 'Pending',
      createdAt: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
    },
    {
      _id: '3',
      title: 'Complaint Resolved',
      description: 'Complaint #12344 has been resolved successfully',
      status: 'Resolved',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
    }
  ];

  // Handlers
  const handleProfileClick = () => {
    setShowProfile(!showProfile);
    setShowNotifications(false); // Close notifications when opening profile
  };

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    setShowProfile(false); // Close profile when opening notifications
  };

  const handleClearAllNotifications = () => {
    console.log('Clearing all notifications...');
    // Add your logic here
    setShowNotifications(false);
  };

  const handleMarkAsRead = (notification) => {
    console.log('Marking as read:', notification);
    // Add your logic here
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Top Navbar */}
      <nav className="bg-white shadow-lg border-b-2 border-blue-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Title */}
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-900">
                Admin Dashboard
              </h1>
            </div>

            {/* Right Side - Profile & Notifications */}
            <div className="flex items-center gap-3">
              {/* Profile Button */}
              <button
                onClick={handleProfileClick}
                className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all font-bold text-lg shadow-md"
                aria-label="Profile"
              >
                {currentUser.Name?.charAt(0) || 'B'}
              </button>

              {/* Notification Bell */}
              <button
                onClick={handleNotificationClick}
                className="flex items-center justify-center w-10 h-10 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors relative"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                    {notifications.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Welcome to the Dashboard
          </h2>
          <p className="text-gray-600 mb-6">
            Click the <strong>Profile button (B)</strong> or the{' '}
            <strong>Notification bell icon</strong> in the top navbar to see
            the popup panels with blur effects!
          </p>

          {/* Feature List */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border-2 border-blue-200">
            <h3 className="text-xl font-bold text-blue-900 mb-4">
              ✨ Features Included:
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>
                  <strong>Blur Backdrop:</strong> CSS backdrop-filter: blur(8px)
                  for modern blur effect
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>
                  <strong>Click Outside to Close:</strong> Clicking on the
                  backdrop closes the popup
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>
                  <strong>Background Blocking:</strong> Content below is not
                  clickable while popup is open
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>
                  <strong>Smooth Animations:</strong> Fade-in and slide-in
                  animations with cubic-bezier easing
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>
                  <strong>Modern UI Design:</strong> Clean, professional design
                  with gradients and shadows
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>
                  <strong>Proper Z-Index:</strong> Backdrop (9998) and Popup
                  (9999) layering
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>
                  <strong>useState Control:</strong> React hooks for state
                  management
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>
                  <strong>No Page Refresh:</strong> Pure client-side interaction
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>
                  <strong>Responsive Design:</strong> Works on mobile and desktop
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>
                  <strong>Accessibility:</strong> ARIA labels and keyboard support
                </span>
              </li>
            </ul>
          </div>

          {/* Sample Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-6 shadow-lg">
              <h4 className="text-lg font-semibold mb-2">Total Users</h4>
              <p className="text-4xl font-bold">1,234</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-6 shadow-lg">
              <h4 className="text-lg font-semibold mb-2">Active Sessions</h4>
              <p className="text-4xl font-bold">567</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-6 shadow-lg">
              <h4 className="text-lg font-semibold mb-2">Notifications</h4>
              <p className="text-4xl font-bold">{notifications.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Popup Component */}
      <ProfilePopup
        user={currentUser}
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
      />

      {/* Notification Popup Component */}
      <NotificationPopup
        notifications={notifications}
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        onClearAll={handleClearAllNotifications}
        onMarkAsRead={handleMarkAsRead}
      />
    </div>
  );
};

export default NavbarExample;
