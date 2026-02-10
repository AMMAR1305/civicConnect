import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../Services/api";
import { jwtDecode } from "jwt-decode";
import { 
  Eye, EyeOff, User, Mail, Shield, Calendar, Edit2, Save, X,
  Activity, CheckCircle, Clock, AlertCircle, Award,
  Key, Lock, Settings, Bell, FileText, BarChart3, Users
} from "lucide-react";

// Constants
const API_BASE = "http://localhost:4000";
const PASSWORD_MIN_LENGTH = 6;
const PASSWORD_STRENGTH_THRESHOLDS = { WEAK: 50, MEDIUM: 75 };

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, gradient, iconBg, textColor }) => (
  <div className={`flex justify-between items-center p-3.5 bg-gradient-to-r ${gradient} rounded-lg hover:shadow-md transition-all group cursor-pointer border ${iconBg.replace('bg-', 'border-')}`}>
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 ${iconBg} rounded-lg flex items-center justify-center shadow-sm`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <span className="text-gray-800 font-semibold">{label}</span>
    </div>
    <span className={`text-3xl font-bold ${textColor} group-hover:scale-110 transition-transform`}>{value}</span>
  </div>
);

// Alert Component
const Alert = ({ type, message, icon: Icon }) => (
  <div className={`${type === 'error' ? 'bg-red-100 border-red-500 text-red-700' : 'bg-green-100 border-green-500 text-green-700'} border-l-4 p-4 rounded-lg mb-6 animate-pulse shadow-md flex items-center gap-3`}>
    <Icon className="w-5 h-5" />
    <span>{message}</span>
  </div>
);

// Password Input Component  
const PasswordInput = ({ label, name, value, onChange, showPassword, toggleShow, icon: Icon, placeholder, strengthInfo }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
      <Icon className="w-4 h-4 text-gray-600" />
      {label}
    </label>
    <div className="relative">
      <input
        type={showPassword ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        required
        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 pr-12 transition-all"
        placeholder={placeholder}
      />
      <button
        type="button"
        onClick={toggleShow}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-700 transition-colors"
      >
        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </div>
    {strengthInfo}
  </div>
);

const OfficerProfile = () => {
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
    submitted: 0,
    resolved: 0,
    inProgress: 0,
    escalated: 0
  });

  const [passwordStrength, setPasswordStrength] = useState(0);

  // Memoized calculations
  const passwordStrengthColor = useMemo(() => {
    if (passwordStrength < PASSWORD_STRENGTH_THRESHOLDS.WEAK) return "bg-red-500";
    if (passwordStrength < PASSWORD_STRENGTH_THRESHOLDS.MEDIUM) return "bg-yellow-500";
    return "bg-green-500";
  }, [passwordStrength]);

  const passwordStrengthText = useMemo(() => {
    if (passwordStrength < PASSWORD_STRENGTH_THRESHOLDS.WEAK) return "Weak";
    if (passwordStrength < PASSWORD_STRENGTH_THRESHOLDS.MEDIUM) return "Medium";
    return "Strong";
  }, [passwordStrength]);

  // Callbacks
  const calculatePasswordStrength = useCallback((password) => {
    let strength = 0;
    if (password.length >= 6) strength += 25;
    if (password.length >= 10) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/\d/.test(password)) strength += 15;
    if (/[^a-zA-Z\d]/.test(password)) strength += 10;
    setPasswordStrength(Math.min(strength, 100));
  }, []);

  const fetchUserData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }

      const decoded = jwtDecode(token);
      const headers = { Authorization: `Bearer ${token}` };

      // Parallel API calls
      const [userResponse, complaintsResponse] = await Promise.all([
        !decoded.Name || !decoded.Email
          ? api.get("/auth/me", { headers })
          : Promise.resolve({ data: decoded }),
        api.get("/complaints/getcomplaints", { headers })
      ]);

      const userData = userResponse.data;
      const userInfo = {
        name: userData.Name || decoded.Name,
        email: userData.Email || decoded.Email,
        role: decoded.Role,
        id: decoded.id,
        createdAt: userData.createdAt 
          ? new Date(userData.createdAt).toLocaleDateString() 
          : new Date(decoded.iat * 1000).toLocaleDateString()
      };

      setUserInfo(userInfo);
      setEditData({ name: userInfo.name, email: userInfo.email });

      // Calculate stats from complaints
      const complaints = complaintsResponse.data;
      const statusCounts = complaints.reduce((acc, c) => {
        acc[c.status] = (acc[c.status] || 0) + 1;
        return acc;
      }, {});

      setStats({
        totalComplaints: complaints.length,
        submitted: statusCounts["Submitted"] || 0,
        inProgress: statusCounts["In Progress"] || 0,
        resolved: statusCounts["Resolved"] || 0,
        escalated: statusCounts["Escalated"] || 0
      });

      setLoading(false);
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError("Failed to load profile data");
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleEditChange = useCallback((e) => {
    setEditData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      const response = await api.put("/auth/update-profile", editData, {
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
      
      await api.put("/auth/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

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
      setError(err.response?.data?.message || "Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
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
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/officer")}
            className="text-blue-700 hover:text-orange-600 font-semibold mb-4 flex items-center gap-2 transition-colors group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Dashboard
          </button>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-blue-900 flex items-center gap-3">
                <Settings className="w-8 h-8 text-orange-500" />
                Officer Profile
              </h1>
              <p className="text-gray-600 mt-2 text-lg">Manage your account settings and view statistics</p>
            </div>
            <button onClick={handleLogout} className="bg-red-600 text-white px-6 py-2.5 rounded-lg hover:bg-red-700 font-semibold transition-colors">Logout</button>
          </div>
        </div>

        {/* Messages */}
        {error && <Alert type="error" message={error} icon={AlertCircle} />}
        {success && <Alert type="success" message={success} icon={CheckCircle} />}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* Left Column - Stats */}
          <div className="space-y-6 lg:col-span-1">
            
            {/* Avatar Card */}
            <div className="bg-white p-6 rounded-xl shadow-xl border-t-4 border-blue-500 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-xl font-bold text-blue-900 mb-1">{userInfo.name}</h2>
              <p className="text-gray-600 text-sm mb-2 break-all">{userInfo.email}</p>
              <span className="inline-block px-4 py-1.5 bg-blue-600 text-white rounded-full text-sm font-semibold">{userInfo.role}</span>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">Member Since</p>
                <p className="text-sm font-semibold text-gray-700">{userInfo.createdAt}</p>
              </div>
            </div>

            {/* Stats Card */}
            <div className="bg-white p-6 rounded-xl shadow-xl border-t-4 border-orange-400 hover:shadow-2xl transition-shadow duration-300">
              <h3 className="text-lg font-semibold text-blue-900 mb-5 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-orange-500" />
                My Statistics
              </h3>
              
              <div className="space-y-3">
                <StatCard 
                  icon={FileText}
                  label="Total"
                  value={stats.totalComplaints}
                  gradient="from-blue-50 to-blue-100"
                  iconBg="bg-blue-500"
                  textColor="text-blue-600"
                />
                <StatCard 
                  icon={Clock}
                  label="Submitted"
                  value={stats.submitted}
                  gradient="from-yellow-50 to-yellow-100"
                  iconBg="bg-yellow-500"
                  textColor="text-yellow-600"
                />
                <StatCard 
                  icon={Activity}
                  label="In Progress"
                  value={stats.inProgress}
                  gradient="from-blue-50 to-blue-100"
                  iconBg="bg-blue-600"
                  textColor="text-blue-600"
                />
                <StatCard 
                  icon={CheckCircle}
                  label="Resolved"
                  value={stats.resolved}
                  gradient="from-green-50 to-green-100"
                  iconBg="bg-green-500"
                  textColor="text-green-600"
                />
                <StatCard 
                  icon={AlertCircle}
                  label="Escalated"
                  value={stats.escalated}
                  gradient="from-red-50 to-red-100"
                  iconBg="bg-red-500"
                  textColor="text-red-600"
                />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-xl shadow-xl border-t-4 border-purple-400">
              <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5 text-purple-500" />Quick Actions
              </h3>
              <button onClick={() => navigate("/officer")} className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold transition-colors flex items-center justify-center gap-2">
                <Activity className="w-4 h-4" />Dashboard
              </button>
            </div>

          </div>

          {/* Right Column - Profile Details */}
          <div className="lg:col-span-3 space-y-6">

            {/* Profile Information */}
            <div className="bg-white p-6 rounded-xl shadow-xl border-t-4 border-blue-500 hover:shadow-2xl transition-shadow duration-300">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-blue-900 flex items-center gap-2">
                  <User className="w-6 h-6 text-blue-600" />
                  Profile Information
                </h3>
                {!isEditing ? (
                  <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 font-semibold transition-colors">
                    <Edit2 className="w-4 h-4" />Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={handleSaveProfile} disabled={saving} className="flex items-center gap-2 bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 font-semibold transition-colors disabled:opacity-50">
                      <Save className="w-4 h-4" />{saving ? "Saving..." : "Save"}
                    </button>
                    <button onClick={() => { setIsEditing(false); setEditData({ name: userInfo.name, email: userInfo.email }); }} className="flex items-center gap-2 bg-gray-300 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-400 font-semibold transition-colors">
                      <X className="w-4 h-4" />Cancel
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {[
                  { icon: User, label: 'Full Name', key: 'name', editable: true },
                  { icon: Mail, label: 'Email Address', key: 'email', editable: true, type: 'email' },
                  { icon: Shield, label: 'Role', key: 'role' },
                  { icon: Calendar, label: 'Member Since', key: 'createdAt' },
                  { icon: Key, label: 'User ID', key: 'id', mono: true }
                ].map(({ icon: Icon, label, key, editable, type, mono }) => (
                  <div key={key}>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <Icon className="w-4 h-4 text-blue-600" />{label}
                    </label>
                    {isEditing && editable ? (
                      <input type={type || 'text'} name={key} value={editData[key]} onChange={handleEditChange} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600" placeholder={`Enter ${label.toLowerCase()}`} />
                    ) : (
                      <p className={`text-gray-800 bg-gray-50 px-4 py-3 rounded-lg font-medium ${mono ? 'font-mono text-sm' : ''} break-all`}>{userInfo[key]}</p>
                    )}
                  </div>
                ))}
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
                  <button onClick={() => { setShowPasswordChange(true); setError(""); setSuccess(""); }} className="bg-orange-600 text-white px-5 py-2 rounded-lg hover:bg-orange-700 font-semibold transition-colors flex items-center gap-2">
                    <Key className="w-4 h-4" />Change Password
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
                  <PasswordInput
                    label="Current Password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    showPassword={showCurrentPassword}
                    toggleShow={() => setShowCurrentPassword(!showCurrentPassword)}
                    icon={Lock}
                    placeholder="Enter current password"
                  />

                  <PasswordInput
                    label="New Password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    showPassword={showNewPassword}
                    toggleShow={() => setShowNewPassword(!showNewPassword)}
                    icon={Key}
                    placeholder="Enter new password"
                    strengthInfo={passwordData.newPassword && (
                      <div className="mt-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-medium text-gray-600">Password Strength</span>
                          <span className={`text-xs font-semibold ${
                            passwordStrength < PASSWORD_STRENGTH_THRESHOLDS.WEAK ? "text-red-500" : 
                            passwordStrength < PASSWORD_STRENGTH_THRESHOLDS.MEDIUM ? "text-yellow-500" : "text-green-500"
                          }`}>
                            {passwordStrengthText}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-300 ${passwordStrengthColor}`}
                            style={{ width: `${passwordStrength}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Use at least 10 characters with a mix of uppercase, lowercase, numbers, and symbols
                        </p>
                      </div>
                    )}
                  />

                  <PasswordInput
                    label="Confirm New Password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    showPassword={showConfirmPassword}
                    toggleShow={() => setShowConfirmPassword(!showConfirmPassword)}
                    icon={CheckCircle}
                    placeholder="Confirm new password"
                    strengthInfo={passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                      <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Passwords do not match
                      </p>
                    )}
                  />

                  <div className="flex gap-3">
                    <button type="submit" disabled={saving} className="flex-1 bg-orange-600 text-white py-2.5 rounded-lg hover:bg-orange-700 font-semibold transition-colors disabled:opacity-50">
                      {saving ? "Changing..." : "Change Password"}
                    </button>
                    <button type="button" onClick={() => { setShowPasswordChange(false); setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" }); setPasswordStrength(0); setError(""); }} className="bg-gray-300 text-gray-700 py-2.5 px-6 rounded-lg hover:bg-gray-400 font-semibold transition-colors">
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200 flex items-center gap-3">
                  <Lock className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-gray-800 font-semibold">Password is secure</p>
                    <p className="text-sm text-gray-600">Click Change Password to update</p>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default OfficerProfile;
