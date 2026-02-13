# Admin Dashboard - Profile & Notification Popups

## 📋 Overview

Complete React implementation of a modern admin dashboard with profile and notification popups featuring:
- ✅ Blur backdrop effect
- ✅ Click outside to close
- ✅ Background blocking (non-clickable)
- ✅ Smooth fade-in animations
- ✅ Modern, clean UI design
- ✅ Proper z-index layering
- ✅ useState for visibility control
- ✅ No page refresh

---

## 📁 File Structure

```
frontend/src/
├── Components/
│   ├── ProfilePopup.jsx          # Profile dropdown component
│   ├── NotificationPopup.jsx     # Notification panel component
│   ├── Popup.css                 # Shared popup styles
│   └── NavbarExample.jsx         # Complete working example
└── Pages/
    └── AdminDashboard.jsx         # Main dashboard (integrated)
```

---

## 🚀 Quick Start

### 1. Import Required Components

```jsx
import { useState } from 'react';
import ProfilePopup from '../Components/ProfilePopup';
import NotificationPopup from '../Components/NotificationPopup';
import '../Components/Popup.css';
import { Bell } from 'lucide-react';
```

### 2. Setup State

```jsx
const [showProfile, setShowProfile] = useState(false);
const [showNotifications, setShowNotifications] = useState(false);

const currentUser = {
  Name: 'John Doe',
  Email: 'john.doe@example.com'
};

const notifications = [
  {
    title: 'System Update',
    description: 'New update available',
    status: 'In Progress',
    createdAt: new Date()
  }
];
```

### 3. Add Buttons to Navbar

```jsx
<button
  onClick={() => {
    setShowProfile(!showProfile);
    setShowNotifications(false); // Close other popup
  }}
  className="profile-button"
>
  {currentUser.Name?.charAt(0) || 'B'}
</button>

<button
  onClick={() => {
    setShowNotifications(!showNotifications);
    setShowProfile(false); // Close other popup
  }}
  className="notification-button"
>
  <Bell className="w-5 h-5" />
  {notifications.length > 0 && (
    <span className="badge">{notifications.length}</span>
  )}
</button>
```

### 4. Add Popup Components

```jsx
{/* At the end of your component, before closing div */}

<ProfilePopup 
  user={currentUser}
  isOpen={showProfile}
  onClose={() => setShowProfile(false)}
/>

<NotificationPopup 
  notifications={notifications}
  isOpen={showNotifications}
  onClose={() => setShowNotifications(false)}
  onClearAll={() => {
    console.log('Clear all');
    setShowNotifications(false);
  }}
  onMarkAsRead={(notif) => console.log('Mark as read:', notif)}
/>
```

---

## 🎨 Component APIs

### ProfilePopup Component

```jsx
<ProfilePopup 
  user={{              // Required: User object
    Name: string,      // User's full name
    Email: string      // User's email
  }}
  isOpen={boolean}     // Required: Visibility state
  onClose={function}   // Required: Close handler
/>
```

**Features:**
- Displays user avatar (first letter of name)
- Shows user name, email, and role
- Profile settings button
- Logout button
- Auto-navigation support (React Router)

---

### NotificationPopup Component

```jsx
<NotificationPopup 
  notifications={[     // Required: Array of notifications
    {
      _id: string,           // Unique identifier
      title: string,         // Notification title
      description: string,   // Notification message
      type: string,          // Type: 'sla_breach', 'status_change', etc.
      status: string,        // Status: 'Resolved', 'In Progress', etc.
      createdAt: Date        // Timestamp
    }
  ]}
  isOpen={boolean}           // Required: Visibility state
  onClose={function}         // Required: Close handler
  onClearAll={function}      // Optional: Clear all handler
  onMarkAsRead={function}    // Optional: Mark as read handler
/>
```

**Features:**
- Displays list of notifications
- Color-coded by type (danger, success, info)
- Shows time ago (e.g., "5m ago", "2h ago")
- Empty state when no notifications
- Clear all button
- Mark as read button
- View all footer link

---

## 🎭 CSS Classes & Styling

### Backdrop Effect

```css
.popup-backdrop {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 9998;
  animation: fadeIn 0.3s ease-out;
}
```

### Popup Panel

```css
.popup-panel {
  position: fixed;
  background: white;
  border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  z-index: 9999;
  animation: slideInScale 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

### Positioning

- **Profile Popup:** `top: 70px; right: 20px; width: 380px;`
- **Notification Popup:** `top: 70px; right: 20px; width: 420px;`

Both are responsive and adjust on mobile devices.

---

## 🎬 Animations

### 1. Fade In (Backdrop)
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

### 2. Slide In Scale (Popup)
```css
@keyframes slideInScale {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
```

### 3. Notification Items
```css
@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
```

---

## 🎯 Z-Index Layering

```
Level 9999: Popup Panels (front)
Level 9998: Blurred Backdrop (middle)
Level 1-100: Regular content (back)
```

The backdrop blocks all clicks to content below while popups are open.

---

## 📱 Responsive Design

### Desktop (> 640px)
- Popups are positioned in top-right corner
- Fixed width (380px / 420px)
- Maximum height: 90vh

### Mobile (≤ 640px)
```css
@media (max-width: 640px) {
  .popup-panel {
    top: 60px !important;
    right: 10px !important;
    left: 10px !important;
    width: auto !important;
  }
}
```

---

## 🎨 Color Scheme

### Notification Types

| Type | Border Color | Background | Icon Color |
|------|--------------|------------|------------|
| SLA Breach | `#ef4444` (Red) | `#fef2f2` | Red |
| Status Change | `#2563eb` (Blue) | `#eff6ff` | Blue |
| Resolved | `#10b981` (Green) | `#f0fdf4` | Green |
| Default | `#64748b` (Gray) | `#f8fafc` | Gray |

### Profile Elements

- Avatar Background: `linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)`
- Role Badge: `linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)`
- Primary Button: `linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)`
- Danger Button: `#ef4444` border with white background

---

## ⚡ Performance Optimizations

1. **Conditional Rendering**: Popups only render when `isOpen={true}`
2. **Event Delegation**: Single backdrop click handler
3. **CSS Animations**: Hardware-accelerated transforms
4. **Reduced Motion**: Respects `prefers-reduced-motion`

---

## ♿ Accessibility

- ✅ ARIA labels on all buttons
- ✅ Keyboard navigation support
- ✅ Focus management
- ✅ Screen reader friendly
- ✅ Color contrast compliant (WCAG AA)
- ✅ Semantic HTML structure

---

## 🌙 Dark Mode Support

Built-in dark mode support using `prefers-color-scheme`:

```css
@media (prefers-color-scheme: dark) {
  .popup-panel {
    background: #1e293b;
    border: 1px solid #334155;
  }
  /* ... more dark mode styles */
}
```

---

## 🛠️ Customization

### Change Popup Position

Edit CSS for `.profile-popup` or `.notification-popup`:
```css
.profile-popup {
  top: 70px;     /* Distance from top */
  right: 20px;   /* Distance from right */
  width: 380px;  /* Popup width */
}
```

### Change Blur Amount

```css
.popup-backdrop {
  backdrop-filter: blur(12px);  /* Increase blur */
}
```

### Change Animation Speed

```css
.popup-panel {
  animation: slideInScale 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

### Change Colors

Update notification color classes:
```css
.notification-item-danger {
  background: #fef2f2;           /* Your color */
  border-left-color: #ef4444;    /* Your color */
}
```

---

## 🧪 Testing

### Test Blur Effect
1. Open popup
2. Verify background is blurred
3. Check backdrop opacity

### Test Click Outside
1. Open popup
2. Click on blurred background
3. Popup should close

### Test Multiple Popups
1. Open profile popup
2. Click notification bell
3. Profile should close, notification should open

### Test Mobile Responsive
1. Resize browser to < 640px
2. Verify popup fills screen width
3. Check mobile touch interactions

---

## 📊 Browser Support

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| backdrop-filter | ✅ 76+ | ✅ 103+ | ✅ 9+ | ✅ 79+ |
| CSS Grid | ✅ | ✅ | ✅ | ✅ |
| Flexbox | ✅ | ✅ | ✅ | ✅ |
| CSS Animations | ✅ | ✅ | ✅ | ✅ |

---

## 🐛 Troubleshooting

### Backdrop not blurring?
- Check browser support for `backdrop-filter`
- Verify CSS file is imported: `import './Popup.css'`

### Popup not closing on click outside?
- Ensure `onClick={onClose}` is on `.popup-backdrop`
- Check that backdrop has `z-index: 9998`

### Animations not working?
- Check for `prefers-reduced-motion` setting
- Verify animation keyframes are loaded

### PopupOverlapping content?
- Verify z-index values (backdrop: 9998, popup: 9999)
- Check for conflicting CSS

---

## 📚 Examples

### Example 1: Basic Implementation

See `NavbarExample.jsx` for a complete standalone example.

### Example 2: Integrated Dashboard

See `AdminDashboard.jsx` for integration with existing dashboard.

### Example 3: Custom Notifications

```jsx
const customNotifications = [
  {
    _id: '1',
    title: 'Welcome!',
    description: 'Welcome to the dashboard',
    type: 'info',
    status: 'New',
    createdAt: new Date()
  }
];

<NotificationPopup
  notifications={customNotifications}
  isOpen={show}
  onClose={() => setShow(false)}
/>
```

---

## 🎓 Best Practices

1. **Always close other popups** when opening a new one
2. **Use semantic HTML** for accessibility
3. **Provide ARIA labels** for screen readers
4. **Test on mobile devices** for responsive behavior
5. **Handle empty states** gracefully
6. **Add loading states** for async operations
7. **Implement error handling** for API calls
8. **Use proper TypeScript types** (if using TypeScript)

---

## 🔄 Future Enhancements

- [ ] TypeScript definitions
- [ ] Storybook stories
- [ ] Unit tests (Jest + React Testing Library)
- [ ] E2E tests (Cypress)
- [ ] Animation customization props
- [ ] Multiple popup positioning options
- [ ] Notification categories filter
- [ ] Search within notifications
- [ ] Notification priority sorting

---

## 📞 Support

For issues or questions:
1. Check this documentation
2. Review the example files
3. Check browser console for errors
4. Verify all imports are correct

---

## ✅ Checklist

- [x] Profile popup with blur backdrop
- [x] Notification popup with blur backdrop
- [x] Click outside to close
- [x] Background blocking
- [x] Smooth animations
- [x] Modern UI design
- [x] Proper z-index layering
- [x] useState controls
- [x] No page refresh
- [x] Responsive design
- [x] Accessibility features
- [x] Dark mode support
- [x] Complete documentation

---

## 📄 License

This implementation is part of the CIVICAI project.

---

**Last Updated:** February 2026
**Version:** 1.0.0
