import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { Bell } from "lucide-react";
import CreateComplaint from "./CreateComplaint";
import NotificationPanel from "../Components/NotificationPanel";

const CitizenDashboard = () => {
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [previousComplaints, setPreviousComplaints] = useState([]);

  useEffect(() => {
    fetchComplaints();
    checkForBroadcasts();
    
    // Check for notifications every 30 seconds
    const interval = setInterval(() => {
      fetchComplaints();
      checkForBroadcasts();
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showCreateModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showCreateModal]);

  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:4000/complaints/my", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = response.data;
      
      // Check for status changes and generate notifications
      if (previousComplaints.length > 0) {
        data.forEach(complaint => {
          const prevComplaint = previousComplaints.find(c => c._id === complaint._id);
          
          if (prevComplaint && prevComplaint.status !== complaint.status) {
            // Status changed - create notification
            if (complaint.status === "In Progress") {
              addNotification({
                type: 'status_change',
                title: 'Complaint Status Updated',
                message: `Your complaint "${complaint.title}" has been moved to In Progress and is being worked on.`,
                complaintId: complaint._id.substring(0, 8),
                timestamp: new Date().toISOString()
              });
            } else if (complaint.status === "Resolved") {
              addNotification({
                type: 'status_change',
                title: 'Complaint Resolved',
                message: `Great news! Your complaint "${complaint.title}" has been resolved.`,
                complaintId: complaint._id.substring(0, 8),
                timestamp: new Date().toISOString()
              });
            } else if (complaint.status === "Assigned") {
              addNotification({
                type: 'status_change',
                title: 'Officer Assigned',
                message: `An officer has been assigned to your complaint "${complaint.title}".`,
                complaintId: complaint._id.substring(0, 8),
                timestamp: new Date().toISOString()
              });
            }
          }
          
          // Check for SLA breach
          if (complaint.slaDeadline && complaint.status !== "Resolved" && complaint.status !== "Closed") {
            const deadline = new Date(complaint.slaDeadline);
            const now = new Date();
            const hoursLeft = (deadline - now) / (1000 * 60 * 60);
            
            // SLA breached
            if (hoursLeft < 0) {
              const existingNotif = notifications.find(n => 
                n.complaintId === complaint._id.substring(0, 8) && n.type === 'sla_breach'
              );
              if (!existingNotif) {
                addNotification({
                  type: 'sla_breach',
                  title: 'SLA Deadline Exceeded',
                  message: `The SLA deadline for complaint "${complaint.title}" has been exceeded. Our team is working to resolve this urgently.`,
                  complaintId: complaint._id.substring(0, 8),
                  timestamp: new Date().toISOString()
                });
              }
            }
            // SLA warning (less than 4 hours)
            else if (hoursLeft < 4) {
              const existingNotif = notifications.find(n => 
                n.complaintId === complaint._id.substring(0, 8) && 
                (n.type === 'sla_warning' || n.type === 'sla_breach')
              );
              if (!existingNotif) {
                addNotification({
                  type: 'sla_warning',
                  title: 'SLA Deadline Approaching',
                  message: `The SLA deadline for complaint "${complaint.title}" is approaching. ${Math.floor(hoursLeft)} hours remaining.`,
                  complaintId: complaint._id.substring(0, 8),
                  timestamp: new Date().toISOString()
                });
              }
            }
          }
        });
      }
      
      setPreviousComplaints(data);
      setComplaints(data);
      
      // Calculate stats
      setStats({
        total: data.length,
        pending: data.filter(c => c.status === "Submitted").length,
        inProgress: data.filter(c => c.status === "In Progress" || c.status === "Assigned").length,
        resolved: data.filter(c => c.status === "Resolved" || c.status === "Closed").length
      });
      
      setLoading(false);
    } catch (err) {
      console.error("Error fetching complaints:", err);
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Resolved":
      case "Closed":
        return "bg-green-100 text-green-700";
      case "In Progress":
        return "bg-blue-100 text-blue-700";
      case "Assigned":
        return "bg-purple-100 text-purple-700";
      case "Submitted":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "Critical":
        return "text-red-600 font-bold";
      case "High":
        return "text-orange-600 font-semibold";
      case "Medium":
        return "text-yellow-600";
      default:
        return "text-slate-600";
    }
  };

  const filteredComplaints = complaints
    .filter(c => filter === "all" || c.status === filter)
    .filter(c => 
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const getSLAStatus = (complaint) => {
    if (!complaint.slaDeadline) return null;
    const deadline = new Date(complaint.slaDeadline);
    const now = new Date();
    const hoursLeft = (deadline - now) / (1000 * 60 * 60);
    
    if (complaint.status === "Resolved" || complaint.status === "Closed") return null;
    
    if (hoursLeft < 0) return { type: "breached", text: "SLA Breached!" };
    if (hoursLeft < 4) return { type: "critical", text: `${Math.floor(hoursLeft)}h left` };
    if (hoursLeft < 24) return { type: "warning", text: `${Math.floor(hoursLeft)}h left` };
    return null;
  };

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleComplaintSuccess = () => {
    setShowCreateModal(false);
    fetchComplaints(); // Refresh complaints list
  };

  const addNotification = (notification) => {
    const newNotif = {
      ...notification,
      id: Date.now() + Math.random(),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markAsRead = (notifId) => {
    setNotifications(prev =>
      prev.map(n => n.id === notifId ? { ...n, read: true } : n)
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const checkForBroadcasts = () => {
    try {
      const broadcasts = JSON.parse(localStorage.getItem('adminBroadcasts') || '[]');
      const lastChecked = localStorage.getItem('lastBroadcastCheck') || '0';
      
      // Find new broadcasts since last check
      const newBroadcasts = broadcasts.filter(b => 
        new Date(b.timestamp).getTime() > parseInt(lastChecked)
      );
      
      // Add notifications for new broadcasts
      newBroadcasts.forEach(broadcast => {
        const existingNotif = notifications.find(n => 
          n.type === 'broadcast' && n.message === broadcast.message
        );
        
        if (!existingNotif) {
          addNotification({
            type: 'broadcast',
            title: 'Admin Announcement',
            message: broadcast.message,
            timestamp: broadcast.timestamp
          });
        }
      });
      
      // Update last checked timestamp
      if (broadcasts.length > 0) {
        const latestTimestamp = Math.max(
          ...broadcasts.map(b => new Date(b.timestamp).getTime())
        );
        localStorage.setItem('lastBroadcastCheck', latestTimestamp.toString());
      }
    } catch (error) {
      console.error('Error checking broadcasts:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 p-4 sm:p-6 md:p-8">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-900">
              Citizen Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-gray-700">
              Integrated Municipal Service Portal
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Notification Bell */}
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative bg-white p-3 rounded-lg shadow-md hover:shadow-lg transition-all border-2 border-blue-200 hover:border-blue-400"
            >
              <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            <button
              onClick={logout}
              className="bg-gradient-to-r from-orange-400 to-orange-500 text-white px-4 sm:px-6 py-2 rounded-lg hover:from-orange-500 hover:to-orange-600 font-semibold transition-all duration-300 shadow-md text-sm sm:text-base flex-1 sm:flex-initial"
            >
              Logout
            </button>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 md:mb-8">

          <div className="bg-white p-4 sm:p-4 sm:p-6 rounded-xl shadow-lg border-t-4 border-blue-500 hover:shadow-xl transition-shadow">
            <h2 className="text-blue-900 font-semibold text-xs sm:text-sm md:text-base">
              Total Complaints
            </h2>
            <p className="text-2xl sm:text-3xl font-bold text-blue-600 mt-1 sm:mt-2">
              {stats.total}
            </p>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border-t-4 border-orange-400 hover:shadow-xl transition-shadow">
            <h2 className="text-blue-900 font-semibold text-xs sm:text-sm md:text-base">
              Pending
            </h2>
            <p className="text-2xl sm:text-3xl font-bold text-orange-600 mt-1 sm:mt-2">
              {stats.pending}
            </p>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border-t-4 border-blue-400 hover:shadow-xl transition-shadow">
            <h2 className="text-blue-900 font-semibold text-xs sm:text-sm md:text-base">
              In Progress
            </h2>
            <p className="text-2xl sm:text-3xl font-bold text-blue-600 mt-1 sm:mt-2">
              {stats.inProgress}
            </p>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border-t-4 border-green-500 hover:shadow-xl transition-shadow">
            <h2 className="text-blue-900 font-semibold text-xs sm:text-sm md:text-base">
              Resolved
            </h2>
            <p className="text-2xl sm:text-3xl font-bold text-green-600 mt-1 sm:mt-2">
              {stats.resolved}
            </p>
          </div>

        </div>

        {/* ACTION BUTTONS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-4 md:gap-6 mb-6 md:mb-8">

          <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border-l-4 border-orange-400">
            <h2 className="text-blue-900 font-semibold text-sm sm:text-base">
              Create Complaint
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2">
              Submit a new service request
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-3 sm:mt-4 bg-gradient-to-r from-orange-400 to-orange-500 text-white px-4 py-2 rounded-lg hover:from-orange-500 hover:to-orange-600 font-semibold transition-all duration-300 w-full text-sm sm:text-base"
            >
              Create New
            </button>
          </div>

          <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border-l-4 border-blue-400">
            <h2 className="text-blue-900 font-semibold text-sm sm:text-base">
              Track Complaints
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2">
              View your complaint status
            </p>
            <button
              onClick={() => navigate("/track")}
              className="mt-3 sm:mt-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 font-semibold transition-all duration-300 w-full text-sm sm:text-base"
            >
              Track Now
            </button>
          </div>

          <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border-l-4 border-blue-500 sm:col-span-2 md:col-span-1">
            <h2 className="text-blue-900 font-semibold text-sm sm:text-base">
              Profile
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2">
              Manage your account
            </p>
            <button
              onClick={() => navigate("/profile")}
              className="mt-3 sm:mt-4 bg-gradient-to-r from-blue-700 to-blue-800 text-white px-4 py-2 rounded-lg hover:from-blue-800 hover:to-blue-900 font-semibold transition-all duration-300 w-full text-sm sm:text-base"
            >
              View Profile
            </button>
          </div>

        </div>

        {/* COMPLAINT HISTORY */}
          <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl shadow-lg border-t-4 border-orange-400">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
              <h2 className="text-base sm:text-lg font-semibold text-blue-900">
              Complaint History ({filteredComplaints.length})
            </h2>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search complaints..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm w-full sm:w-auto"
              />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm w-full sm:w-auto"
              >
                <option value="all">All Status</option>
                <option value="Submitted">Submitted</option>
                <option value="Assigned">Assigned</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              Loading complaints...
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              {searchTerm || filter !== "all" 
                ? "No complaints match your filters" 
                : "No complaints yet. Create your first complaint!"}
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                      <tr className="bg-gradient-to-r from-blue-100 to-orange-100 text-blue-900 font-semibold">
                      <th className="p-2 text-left">ID</th>
                      <th className="p-2 text-left">Title</th>
                      <th className="p-2 text-left">Category</th>
                      <th className="p-2 text-left">Location</th>
                      <th className="p-2 text-left">Priority</th>
                      <th className="p-2 text-left">Status</th>
                      <th className="p-2 text-left">SLA</th>
                      <th className="p-2 text-left">Created</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredComplaints.map((complaint) => {
                      const slaStatus = getSLAStatus(complaint);
                      return (
                        <tr 
                          key={complaint._id} 
                          className="border-t hover:bg-slate-50 cursor-pointer"
                          onClick={() => navigate("/track")}
                        >
                          <td className="p-2 font-mono text-xs">
                            {complaint._id.substring(0, 8)}...
                          </td>
                          <td className="p-2 font-semibold">{complaint.title}</td>
                          <td className="p-2">{complaint.category}</td>
                          <td className="p-2 text-xs">{complaint.location}</td>
                          <td className="p-2">
                            <span className={getPriorityColor(complaint.priority)}>
                              {complaint.priority}
                            </span>
                          </td>
                          <td className="p-2">
                            <span className={`px-2 py-1 rounded text-xs ${getStatusColor(complaint.status)}`}>
                              {complaint.status}
                            </span>
                          </td>
                          <td className="p-2">
                            {slaStatus && (
                              <span className={`px-2 py-1 rounded text-xs ${
                                slaStatus.type === "breached" 
                                  ? "bg-red-100 text-red-700" 
                                  : slaStatus.type === "critical"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}>
                                {slaStatus.text}
                              </span>
                            )}
                          </td>
                          <td className="p-2 text-xs">
                            {new Date(complaint.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {filteredComplaints.map((complaint) => {
                  const slaStatus = getSLAStatus(complaint);
                  return (
                    <div 
                      key={complaint._id}
                      onClick={() => navigate("/track")}
                      className="bg-slate-50 rounded-lg p-4 border border-slate-200 hover:shadow-md transition-shadow cursor-pointer"
                    >
                      {/* Header with Status and Priority */}
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-blue-900 text-sm mb-1">{complaint.title}</h3>
                          <p className="text-xs text-slate-600 font-mono">ID: {complaint._id.substring(0, 8)}...</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(complaint.status)} whitespace-nowrap ml-2`}>
                          {complaint.status}
                        </span>
                      </div>

                      {/* Details Grid */}
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Category:</span>
                          <span className="font-medium text-slate-900">{complaint.category}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Priority:</span>
                          <span className={getPriorityColor(complaint.priority)}>{complaint.priority}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Location:</span>
                          <span className="text-xs text-slate-900 text-right">{complaint.location}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Created:</span>
                          <span className="text-xs text-slate-900">{new Date(complaint.createdAt).toLocaleDateString()}</span>
                        </div>
                        {slaStatus && (
                          <div className="flex justify-between items-center">
                            <span className="text-slate-600">SLA:</span>
                            <span className={`px-2 py-1 rounded text-xs ${
                              slaStatus.type === "breached" 
                                ? "bg-red-100 text-red-700" 
                                : slaStatus.type === "critical"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}>
                              {slaStatus.text}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

      </div>

      {/* Create Complaint Modal */}
      {showCreateModal && (
        <div 
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto backdrop-blur-md bg-white/30 p-4"
          onClick={() => setShowCreateModal(false)}
        >
          <div 
            className="relative w-full max-w-3xl my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <CreateComplaint 
              isModal={true}
              onClose={() => setShowCreateModal(false)}
              onSuccess={handleComplaintSuccess}
            />
          </div>
        </div>
      )}

      {/* Notification Panel */}
      {showNotifications && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-30 z-40"
            onClick={() => setShowNotifications(false)}
          />
          <div className="fixed right-0 top-0 bottom-0 z-50">
            <NotificationPanel
              notifications={notifications}
              onClose={() => setShowNotifications(false)}
              onMarkAsRead={markAsRead}
              onClearAll={clearAllNotifications}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default CitizenDashboard;
