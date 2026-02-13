import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { 
  Eye, EyeOff, User, Mail, Shield, Calendar, Edit2, Save, X,
  Activity, TrendingUp, CheckCircle, Clock, AlertCircle, Award,
  Key, Lock, UserCheck, Bell, Settings, HelpCircle, FileText,
  LogOut, Trash2, Download, RefreshCw
} from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  
  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    role: "",
    id: "",
    createdAt: ""
  });

  const [editData, setEditData] = useState({
    name: "",
    email: ""
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [stats, setStats] = useState({
    totalComplaints: 0,
    pending: 0,
    resolved: 0,
    inProgress: 0,
    closed: 0
  });

  const [passwordStrength, setPasswordStrength] = useState(0);
  const [recentActivity, setRecentActivity] = useState([]);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [activityUpdates, setActivityUpdates] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      // Decode token to get user info
      const decoded = jwtDecode(token);
      
      // If Name/Email not in token, fetch from backend
      if (!decoded.Name || !decoded.Email) {
        const userResponse = await axios.get("http://localhost:4000/auth/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setUserInfo({
          name: userResponse.data.Name,
          email: userResponse.data.Email,
          role: decoded.Role,
          id: decoded.id,
          createdAt: userResponse.data.createdAt ? new Date(userResponse.data.createdAt).toLocaleDateString() : "N/A"
        });

        setEditData({
          name: userResponse.data.Name,
          email: userResponse.data.Email
        });
      } else {
        setUserInfo({
          name: decoded.Name,
          email: decoded.Email,
          role: decoded.Role,
          id: decoded.id,
          createdAt: decoded.iat ? new Date(decoded.iat * 1000).toLocaleDateString() : "N/A"
        });

        setEditData({
          name: decoded.Name,
          email: decoded.Email
        });
      }

      // Fetch complaint stats
      const response = await axios.get("http://localhost:4000/complaints/my", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const complaints = response.data;
      setStats({
        totalComplaints: complaints.length,
        pending: complaints.filter(c => c.status === "Submitted").length,
        inProgress: complaints.filter(c => c.status === "In Progress" || c.status === "Assigned").length,
        resolved: complaints.filter(c => c.status === "Resolved").length,
        closed: complaints.filter(c => c.status === "Closed").length
      });

      // Set recent activity (last 5 complaints)
      const recent = complaints
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
        .map(c => ({
          id: c._id,
          title: c.title,
          status: c.status,
          date: new Date(c.createdAt).toLocaleDateString()
        }));
      setRecentActivity(recent);

      setLoading(false);
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError("Failed to load profile data");
      setLoading(false);
    }
  };

  const handleEditChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });

    // Calculate password strength for new password
    if (name === "newPassword") {
      calculatePasswordStrength(value);
    }
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 6) strength += 25;
    if (password.length >= 10) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/\d/.test(password)) strength += 15;
    if (/[^a-zA-Z\d]/.test(password)) strength += 10;
    setPasswordStrength(Math.min(strength, 100));
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 50) return "bg-red-500";
    if (passwordStrength < 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 50) return "Weak";
    if (passwordStrength < 75) return "Medium";
    return "Strong";
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      const response = await axios.put("http://localhost:4000/auth/update-profile", editData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update token with new user info
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }

      setSuccess("Profile updated successfully!");
      setIsEditing(false);
      
      // Refresh user data
      setTimeout(() => {
        setSuccess("");
        fetchUserData();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      console.log("Changing password with data:", {
        currentPassword: passwordData.currentPassword ? "***" : "empty",
        newPassword: passwordData.newPassword ? "***" : "empty"
      });
      
      const response = await axios.put("http://localhost:4000/auth/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("Password change response:", response.data);
      setSuccess("Password changed successfully!");
      setShowPasswordChange(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      setPasswordStrength(0);
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Password change error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Submitted": return <Clock className="w-4 h-4 text-blue-500" />;
      case "In Progress": return <Activity className="w-4 h-4 text-orange-500" />;
      case "Assigned": return <UserCheck className="w-4 h-4 text-purple-500" />;
      case "Resolved": return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "Closed": return <CheckCircle className="w-4 h-4 text-gray-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Submitted": return "bg-blue-100 text-blue-700";
      case "In Progress": return "bg-orange-100 text-orange-700";
      case "Assigned": return "bg-purple-100 text-purple-700";
      case "Resolved": return "bg-green-100 text-green-700";
      case "Closed": return "bg-gray-100 text-gray-700";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-900 font-semibold">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-orange-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/citizen")}
            className="text-blue-700 hover:text-orange-600 font-semibold mb-4 flex items-center gap-2 transition-colors group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Dashboard
          </button>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-blue-900 flex items-center gap-3">
                <Settings className="w-8 h-8 text-orange-500" />
                My Profile
              </h1>
              <p className="text-gray-600 mt-2 text-lg">Manage your account settings and preferences</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-lg hover:from-red-600 hover:to-red-700 font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6 animate-pulse shadow-md flex items-center gap-3">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg mb-6 animate-pulse shadow-md flex items-center gap-3">
            <CheckCircle className="w-5 h-5" />
            <span>{success}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column - Stats */}
          <div className="space-y-6">
            
            {/* Avatar Card */}
            <div className="bg-white p-6 rounded-xl shadow-xl border-t-4 border-blue-500 text-center hover:shadow-2xl transition-shadow duration-300">
              <div className="relative inline-block">
                <div className="w-28 h-28 bg-gradient-to-br from-blue-500 via-purple-500 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <User className="w-14 h-14 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-green-500 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center">
                  <Award className="w-4 h-4 text-white" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-blue-900 mb-1">{userInfo.name}</h2>
              <p className="text-gray-600 text-sm mb-3 break-all">{userInfo.email}</p>
              <span className="inline-block mt-2 px-5 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full text-sm font-semibold shadow-md">
                {userInfo.role}
              </span>
              <div className="mt-5 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Member Since</p>
                <p className="text-sm font-semibold text-gray-700">{userInfo.createdAt}</p>
              </div>
            </div>

            {/* Stats Card */}
            <div className="bg-white p-6 rounded-xl shadow-xl border-t-4 border-orange-400 hover:shadow-2xl transition-shadow duration-300">
              <h3 className="text-lg font-semibold text-blue-900 mb-5 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-500" />
                Activity Summary
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3.5 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg hover:shadow-md transition-all group cursor-pointer border border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center shadow-sm">
                      <Activity className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-gray-800 font-semibold">Total</span>
                  </div>
                  <span className="text-3xl font-bold text-blue-600 group-hover:scale-110 transition-transform">{stats.totalComplaints}</span>
                </div>
                <div className="flex justify-between items-center p-3.5 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg hover:shadow-md transition-all group cursor-pointer border border-yellow-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center shadow-sm">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-gray-800 font-semibold">Pending</span>
                  </div>
                  <span className="text-3xl font-bold text-yellow-600 group-hover:scale-110 transition-transform">{stats.pending}</span>
                </div>
                <div className="flex justify-between items-center p-3.5 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg hover:shadow-md transition-all group cursor-pointer border border-orange-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center shadow-sm">
                      <Activity className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-gray-800 font-semibold">In Progress</span>
                  </div>
                  <span className="text-3xl font-bold text-orange-600 group-hover:scale-110 transition-transform">{stats.inProgress}</span>
                </div>
                <div className="flex justify-between items-center p-3.5 bg-gradient-to-r from-green-50 to-green-100 rounded-lg hover:shadow-md transition-all group cursor-pointer border border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center shadow-sm">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-gray-800 font-semibold">Resolved</span>
                  </div>
                  <span className="text-3xl font-bold text-green-600 group-hover:scale-110 transition-transform">{stats.resolved}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-xl shadow-xl border-t-4 border-blue-400 hover:shadow-2xl transition-shadow duration-300">
              <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-500" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate("/create")}
                  className="w-full bg-gradient-to-r from-orange-400 to-orange-500 text-white py-3 px-4 rounded-lg hover:from-orange-500 hover:to-orange-600 font-semibold transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 flex items-center justify-center gap-2"
                >
                  <span className="text-xl">+</span> New Complaint
                </button>
                <button
                  onClick={() => navigate("/track")}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-lg hover:from-blue-600 hover:to-blue-700 font-semibold transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 flex items-center justify-center gap-2"
                >
                  <Activity className="w-4 h-4" />
                  Track Complaints
                </button>
                <button
                  onClick={() => navigate("/citizen")}
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-purple-600 hover:to-purple-700 font-semibold transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 flex items-center justify-center gap-2"
                >
                  <User className="w-4 h-4" />
                  Dashboard
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            {recentActivity.length > 0 && (
              <div className="bg-white p-6 rounded-xl shadow-xl border-t-4 border-purple-400 hover:shadow-2xl transition-shadow duration-300">
                <h3 className="text-lg font-semibold text-blue-900 mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-purple-500" />
                    Recent Activity
                  </div>
                  <button 
                    onClick={() => navigate("/track")}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                  >
                    View All
                    <span>→</span>
                  </button>
                </h3>
                <div className="space-y-2">
                  {recentActivity.map((activity, index) => (
                    <div 
                      key={activity.id}
                      className="p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg hover:shadow-md transition-all cursor-pointer border border-gray-200 group"
                      onClick={() => navigate("/track")}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="mt-0.5">
                            {getStatusIcon(activity.status)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                              {activity.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                                {activity.status}
                              </span>
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {activity.date}
                              </span>
                            </div>
                          </div>
                        </div>
                        <span className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all mt-1">
                          →
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Right Column - Profile Details */}
          <div className="lg:col-span-2 space-y-6">

            {/* Profile Information */}
            <div className="bg-white p-6 rounded-xl shadow-xl border-t-4 border-blue-500 hover:shadow-2xl transition-shadow duration-300">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-blue-900 flex items-center gap-2">
                  <User className="w-6 h-6 text-blue-600" />
                  Profile Information
                </h3>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 bg-blue-500 text-white px-5 py-2 rounded-lg hover:bg-blue-600 font-semibold transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="flex items-center gap-2 bg-green-500 text-white px-5 py-2 rounded-lg hover:bg-green-600 font-semibold transition-all duration-300 disabled:opacity-50 shadow-md hover:shadow-lg"
                    >
                      <Save className="w-4 h-4" />
                      {saving ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditData({ name: userInfo.name, email: userInfo.email });
                      }}
                      className="flex items-center gap-2 bg-gray-200 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-300 font-semibold transition-all duration-300 shadow-md"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-5">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <User className="w-4 h-4 text-blue-600" />
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={editData.name}
                      onChange={handleEditChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all"
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <p className="text-gray-800 bg-gradient-to-r from-gray-50 to-blue-50 px-4 py-3 rounded-lg font-medium">{userInfo.name}</p>
                  )}
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <Mail className="w-4 h-4 text-blue-600" />
                    Email Address
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={editData.email}
                      onChange={handleEditChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all"
                      placeholder="Enter your email"
                    />
                  ) : (
                    <p className="text-gray-800 bg-gradient-to-r from-gray-50 to-blue-50 px-4 py-3 rounded-lg font-medium break-all">{userInfo.email}</p>
                  )}
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <Shield className="w-4 h-4 text-blue-600" />
                    Role
                  </label>
                  <p className="text-gray-800 bg-gradient-to-r from-gray-50 to-purple-50 px-4 py-3 rounded-lg font-medium">{userInfo.role}</p>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    Member Since
                  </label>
                  <p className="text-gray-800 bg-gradient-to-r from-gray-50 to-green-50 px-4 py-3 rounded-lg font-medium">{userInfo.createdAt}</p>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <Key className="w-4 h-4 text-blue-600" />
                    User ID
                  </label>
                  <p className="text-gray-800 bg-gradient-to-r from-gray-50 to-orange-50 px-4 py-3 rounded-lg font-mono text-sm break-all">{userInfo.id}</p>
                </div>
              </div>
            </div>

            {/* Security Section */}
            <div className="bg-white p-6 rounded-xl shadow-xl border-t-4 border-orange-400 hover:shadow-2xl transition-shadow duration-300">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-blue-900 flex items-center gap-2">
                  <Lock className="w-6 h-6 text-orange-600" />
                  Security Settings
                </h3>
                {!showPasswordChange && (
                  <button
                    onClick={() => {
                      setShowPasswordChange(true);
                      setError("");
                      setSuccess("");
                    }}
                    className="bg-orange-500 text-white px-5 py-2 rounded-lg hover:bg-orange-600 font-semibold transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 flex items-center gap-2"
                  >
                    <Key className="w-4 h-4" />
                    Change Password
                  </button>
                )}
              </div>

              {showPasswordChange && error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  {error}
                </div>
              )}
              
              {showPasswordChange && success && (
                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  {success}
                </div>
              )}

              {showPasswordChange ? (
                <form onSubmit={handleChangePassword} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-gray-600" />
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 pr-12 transition-all"
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-700 transition-colors"
                      >
                        {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Key className="w-4 h-4 text-gray-600" />
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 pr-12 transition-all"
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-700 transition-colors"
                      >
                        {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {/* Password Strength Indicator */}
                    {passwordData.newPassword && (
                      <div className="mt-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-medium text-gray-600">Password Strength</span>
                          <span className={`text-xs font-semibold ${
                            passwordStrength < 50 ? "text-red-500" : 
                            passwordStrength < 75 ? "text-yellow-500" : "text-green-500"
                          }`}>
                            {getPasswordStrengthText()}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                            style={{ width: `${passwordStrength}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Use at least 10 characters with a mix of uppercase, lowercase, numbers, and symbols
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-gray-600" />
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 pr-12 transition-all"
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-700 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                      <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Passwords do not match
                      </p>
                    )}
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 bg-gradient-to-r from-orange-400 to-orange-500 text-white py-3 px-4 rounded-lg hover:from-orange-500 hover:to-orange-600 font-semibold transition-all duration-300 disabled:opacity-50 shadow-md hover:shadow-lg hover:scale-105"
                    >
                      {saving ? "Changing..." : "Change Password"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordChange(false);
                        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
                        setPasswordStrength(0);
                        setError("");
                      }}
                      className="bg-gray-200 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-300 font-semibold transition-all duration-300 shadow-md"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                      <Lock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-gray-800 font-semibold">🔒 Your password is secure</p>
                      <p className="text-sm text-gray-600">Keep your account protected</p>
                    </div>
                  </div>
                  <div className="border-t border-green-200 pt-3 mt-3">
                    <p className="text-sm text-gray-600 mb-2">Security Tips:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-600" />
                        Use a strong, unique password
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-600" />
                        Change your password regularly
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-600" />
                        Never share your password
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Account Preferences */}
            <div className="bg-white p-6 rounded-xl shadow-xl border-t-4 border-purple-400 hover:shadow-2xl transition-shadow duration-300">
              <h3 className="text-xl font-semibold text-blue-900 mb-6 flex items-center gap-2">
                <Settings className="w-6 h-6 text-purple-600" />
                Account Preferences
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-white rounded-lg border border-blue-100 hover:shadow-md transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Bell className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-base">Email Notifications</p>
                      <p className="text-sm text-gray-600 mt-0.5">Receive updates about your complaints</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={emailNotifications}
                      onChange={(e) => setEmailNotifications(e.target.checked)}
                    />
                    <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600 shadow-inner"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-white rounded-lg border border-green-100 hover:shadow-md transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Activity className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-base">Activity Updates</p>
                      <p className="text-sm text-gray-600 mt-0.5">Get notified of status changes</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={activityUpdates}
                      onChange={(e) => setActivityUpdates(e.target.checked)}
                    />
                    <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600 shadow-inner"></div>
                  </label>
                </div>
              </div>
            </div>

           
          </div>

        </div>

      </div>
    </div>
  );
};

export default Profile;
