import { useEffect, useState, useMemo, useCallback } from "react";
import api from "../Services/api";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";
import "../Components/Popup.css";
import ProfilePopup from "../Components/ProfilePopup";
import NotificationPopup from "../Components/NotificationPopup";
import ComplaintDetailsPopup from "../Components/ComplaintDetailsPopup";
import ReassignModal from "../Components/ReassignModal";
import EditComplaintModal from "../Components/EditComplaintModal";
import DeleteConfirmModal from "../Components/DeleteConfirmModal";
import LazyImage from "../Components/LazyImage";
import { LayoutDashboard, FileText, CheckCircle, Clock, AlertTriangle, Users, Shield, TrendingUp, TrendingDown, Activity, Settings, Download, RefreshCw, Search, UserPlus, BarChart3, Bell, X, Eye, Edit, Trash2, Save, Lock, Unlock, Database, Sliders, MapPin, Megaphone, AlertOctagon, FileSpreadsheet, History, UserCog, Target, Zap, Map as MapIcon, Send } from "lucide-react";

const AdminDashboard = () => {
  const [state, setState] = useState({
    stats: {}, workload: [], users: [], officers: [], citizens: [], complaints: [], auditLogs: [], slaBreaches: [], categoryStats: [], wardStats: [],
    loading: true, activeTab: "overview", searchTerm: "", filterStatus: "all", officerFilter: "all", announcementText: "", mobileMenuOpen: false, showNotifications: false,
    currentUser: { Name: 'Admin', Email: '' }, showUserProfile: false,
    // New advanced features
    dateRange: 'all', priorityFilter: 'all', trendData: [], performanceMetrics: {},
    showFilters: false, chartView: 'bar', timeRange: '7days', categoryFilter: 'all',
    // Add user modal
    showAddUserModal: false, newUserData: { Name: '', Email: '', Password: '' },
    // Officer management
    newOfficerData: { 
      Name: '', 
      Email: '', 
      Password: '', 
      assignedZones: [], 
      specializations: [], 
      isAvailable: true 
    },
    // Selected items for inline details
    selectedOfficerId: null,
    selectedCitizenId: null,
    selectedComplaint: null, // For complaint details popup
    showAddOfficerForm: false,
    showAddUserForm: false,
    // Complaint editing and reassignment
    showReassignModal: false,
    reassignComplaintId: null,
    editingComplaint: null,
    showEditModal: false,
    showDeleteModal: false,
    deletingComplaint: null,
    isDeleting: false,
    complaintsPerPage: 12 // Pagination control
  });
  const navigate = useNavigate();
  
  const updateState = useCallback((updates) => setState(prev => ({ ...prev, ...updates })), []);
  
  // Memoize filtered complaints for better performance
  const filteredComplaints = useMemo(() => {
    if (!state.complaints || state.complaints.length === 0) return [];
    
    return state.complaints.filter(c => {
      const matchesSearch = !state.searchTerm || 
        c.title?.toLowerCase().includes(state.searchTerm.toLowerCase()) || 
        c.description?.toLowerCase().includes(state.searchTerm.toLowerCase());
      const matchesStatus = state.filterStatus === 'all' || c.status === state.filterStatus;
      const matchesCategory = state.categoryFilter === 'all' || c.category === state.categoryFilter;
      const matchesOfficer = state.officerFilter === 'all' || 
                            (state.officerFilter === 'assigned' && c.assignedOfficer) ||
                            (state.officerFilter === 'unassigned' && !c.assignedOfficer);
      return matchesSearch && matchesStatus && matchesCategory && matchesOfficer;
    });
  }, [state.complaints, state.searchTerm, state.filterStatus, state.categoryFilter, state.officerFilter]);

  // Debounced search to improve performance
  const [searchInput, setSearchInput] = useState('');
  
  useEffect(() => {
    const timer = setTimeout(() => {
      updateState({ searchTerm: searchInput });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, updateState]);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    updateState({ loading: true });
    try {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/login");
      const headers = { Authorization: `Bearer ${token}` };

      const [analyticsRes, complaintsRes, officersRes, citizensRes] = await Promise.all([
        api.get("/complaints/analytics", { headers }).catch(() => ({ data: {} })),
        api.get("/complaints/getcomplaints", { headers }).catch(() => ({ data: [] })),
        api.get("/auth/officers", { headers }).catch(() => ({ data: [] })),
        api.get("/auth/citizens", { headers }).catch(() => ({ data: [] }))
      ]);

      // Get user info from token (reusing existing token variable)
      let currentUser = { Name: 'Admin', Email: '', Role: 'admin' };
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const userRole = (payload.Role || payload.role || '').toLowerCase();
          currentUser = { 
            Name: payload.Name || 'Admin', 
            Email: payload.Email || '',
            Role: userRole || 'admin' // Extract role from token, default to admin
          };
          console.log('User Role:', currentUser.Role); // Debug log
        } catch (e) { 
          console.log('Token parse error:', e); 
          currentUser.Role = 'admin'; // Default to admin if token parse fails
        }
      }

      const complaints = complaintsRes.data || [];
      const stats = analyticsRes.data || {};
      const officers = officersRes.data || [];
      const citizens = citizensRes.data || [];

      // Calculate workload, categories, wards
      const officerMap = new Map(), categoryMap = new Map(), wardMap = new Map();
      complaints.forEach(c => {
        if (c.assignedOfficer) {
          const id = c.assignedOfficer._id || c.assignedOfficer;
          if (!officerMap.has(id)) officerMap.set(id, { id, name: c.assignedOfficer.Name, assigned: 0, resolved: 0, pending: 0 });
          const o = officerMap.get(id);
          o.assigned++;
          if (c.status === "Resolved" || c.status === "Closed") o.resolved++; else o.pending++;
        }
        
        const cat = c.category || "Other";
        if (!categoryMap.has(cat)) categoryMap.set(cat, { category: cat, total: 0, resolved: 0, pending: 0 });
        const catStat = categoryMap.get(cat);
        catStat.total++;
        if (c.status === "Resolved" || c.status === "Closed") catStat.resolved++; else catStat.pending++;

        const ward = c.ward || c.location || "Unknown";
        if (!wardMap.has(ward)) wardMap.set(ward, { ward, complaints: 0, resolved: 0, pending: 0 });
        const w = wardMap.get(ward);
        w.complaints++;
        if (c.status === "Resolved" || c.status === "Closed") w.resolved++; else w.pending++;
      });

      const slaBreaches = complaints.filter(c => c.slaDeadline && c.status !== "Resolved" && new Date(c.slaDeadline) < new Date());
      const auditLogs = complaints.slice(0, 10).map((c, i) => ({
        timestamp: new Date(c.updatedAt || c.createdAt).toLocaleString(),
        action: c.status === "Resolved" ? "Status Changed to Resolved" : "Complaint Created",
        user: c.assignedOfficer?.Name || c.citizen?.Name || "System",
        target: `Complaint #${c._id?.slice(-6)}`
      }));

      // Calculate trend data (last 30 days)
      const trendData = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        const dateStr = date.toISOString().split('T')[0];
        const dayComplaints = complaints.filter(c => c.createdAt?.startsWith(dateStr));
        return {
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          total: dayComplaints.length,
          resolved: dayComplaints.filter(c => c.status === 'Resolved').length,
          pending: dayComplaints.filter(c => c.status === 'Submitted' || c.status === 'Pending').length
        };
      });

      // Calculate performance metrics
      const resolvedComplaints = complaints.filter(c => c.status === 'Resolved');
      const avgResolutionTime = resolvedComplaints.length > 0
        ? resolvedComplaints.reduce((sum, c) => {
            const created = new Date(c.createdAt);
            const resolved = new Date(c.updatedAt);
            return sum + (resolved - created);
          }, 0) / resolvedComplaints.length / (1000 * 60 * 60 * 24) // Convert to days
        : 0;

      const performanceMetrics = {
        avgResolutionTime: avgResolutionTime.toFixed(1),
        slaComplianceRate: stats.total ? ((stats.total - slaBreaches.length) / stats.total * 100).toFixed(1) : 100,
        todayComplaints: complaints.filter(c => new Date(c.createdAt).toDateString() === new Date().toDateString()).length,
        weeklyGrowth: complaints.filter(c => {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return new Date(c.createdAt) > weekAgo;
        }).length,
        priorityHigh: complaints.filter(c => c.priority === 'High' || slaBreaches.some(s => s._id === c._id)).length,
        priorityMedium: complaints.filter(c => c.priority === 'Medium').length,
        priorityLow: complaints.filter(c => c.priority === 'Low' || !c.priority).length
      };

      updateState({
        stats, complaints, officers, citizens, workload: Array.from(officerMap.values()),
        categoryStats: Array.from(categoryMap.values()), wardStats: Array.from(wardMap.values()),
        slaBreaches, auditLogs, users: complaints.map(c => c.citizen).filter(Boolean),
        currentUser, trendData, performanceMetrics, loading: false
      });
    } catch (error) {
      console.error("Load error:", error);
      if (error.response?.status === 401) navigate("/login");
      updateState({ loading: false });
    }
  };

  const actions = {
    export: () => {
      const blob = new Blob([JSON.stringify(state.complaints, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `complaints-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
    },
    broadcast: () => state.announcementText.trim() && alert(`Broadcasting: "${state.announcementText}"`),
    escalate: () => alert(`Escalating ${state.slaBreaches.length} SLA breached complaints`),
    addCitizen: async () => {
      try {
        const { Name, Email, Password } = state.newUserData;
        if (!Name || !Email || !Password) {
          alert('Please fill all fields');
          return;
        }
        
        const token = localStorage.getItem("token");
        const response = await api.post('/auth/register', {
          Name,
          Email,
          Password,
          Role: 'Citizen'
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        alert('Citizen added successfully!');
        updateState({ 
          showAddUserForm: false,
          showAddUserModal: false, 
          newUserData: { Name: '', Email: '', Password: '' }
        });
        loadData(); // Refresh the data
      } catch (error) {
        console.error('Error adding citizen:', error);
        alert(error.response?.data?.message || 'Failed to add citizen');
      }
    },
    addOfficer: async () => {
      try {
        const { Name, Email, Password, assignedZones, specializations, isAvailable } = state.newOfficerData;
        if (!Name || !Email || !Password) {
          alert('Please fill all fields');
          return;
        }
        
        const token = localStorage.getItem("token");
        const response = await api.post('/auth/register', {
          Name,
          Email,
          Password,
          Role: 'Officer',
          assignedZones,
          specializations,
          isAvailable
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        alert('Officer added successfully!');
        updateState({ 
          showAddOfficerForm: false, 
          newOfficerData: { 
            Name: '', 
            Email: '', 
            Password: '', 
            assignedZones: [], 
            specializations: [], 
            isAvailable: true 
          }
        });
        loadData(); // Refresh the data
      } catch (error) {
        console.error('Error adding officer:', error);
        alert(error.response?.data?.message || 'Failed to add officer');
      }
    },
    // Complaint management actions
    editComplaint: (complaint) => {
      // Check if user is admin
      if (state.currentUser.Role !== 'admin') {
        alert('Access denied. Only administrators can edit complaints.');
        return;
      }
      
      updateState({ 
        editingComplaint: complaint,
        selectedComplaint: null,
        showEditModal: true
      });
    },
    performEdit: async (complaint, formData) => {
      // Check if user is admin
      if (state.currentUser.Role !== 'admin') {
        throw new Error('Access denied. Only administrators can edit complaints.');
      }
      
      try {
        const token = localStorage.getItem("token");
        
        const response = await api.put(`/complaints/${complaint._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        alert('Complaint updated successfully!');
        updateState({ showEditModal: false, editingComplaint: null });
        loadData(); // Refresh data
      } catch (error) {
        console.error('Error updating complaint:', error);
        throw new Error(error.response?.data?.message || 'Failed to update complaint');
      }
    },
    reassignComplaint: (complaint) => {
      // Check if user is admin
      if (state.currentUser.Role !== 'admin') {
        alert('Access denied. Only administrators can reassign complaints.');
        return;
      }
      
      updateState({ 
        showReassignModal: true,
        reassignComplaintId: complaint._id,
        selectedComplaint: null 
      });
    },
    performReassign: async (complaint, officerId) => {
      // Check if user is admin
      if (state.currentUser.Role !== 'admin') {
        alert('Access denied. Only administrators can reassign complaints.');
        return;
      }
      
      try {
        const token = localStorage.getItem("token");
        
        const response = await api.put(`/complaints/${complaint._id}`, {
          assignedOfficer: officerId,
          status: 'Assigned'
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const selectedOfficer = state.officers.find(o => o._id === officerId);
        alert(`Complaint reassigned to ${selectedOfficer?.Name || 'Officer'} successfully!`);
        updateState({ showReassignModal: false, reassignComplaintId: null });
        loadData(); // Refresh data
      } catch (error) {
        console.error('Error reassigning complaint:', error);
        alert(error.response?.data?.message || 'Failed to reassign complaint');
      }
    },
    deleteComplaint: async (complaint) => {
      // Check if user is admin
      if (state.currentUser.Role !== 'admin') {
        alert('Access denied. Only administrators can delete complaints.');
        return;
      }
      
      // Open confirmation modal
      updateState({ 
        showDeleteModal: true,
        deletingComplaint: complaint,
        selectedComplaint: null
      });
    },
    performDelete: async () => {
      if (!state.deletingComplaint) return;
      
      updateState({ isDeleting: true });
      
      try {
        const token = localStorage.getItem("token");
        
        await api.delete(`/complaints/${state.deletingComplaint._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        alert('Complaint deleted successfully!');
        updateState({ 
          showDeleteModal: false, 
          deletingComplaint: null,
          isDeleting: false
        });
        loadData(); // Refresh data
      } catch (error) {
        console.error('Error deleting complaint:', error);
        alert(error.response?.data?.message || 'Failed to delete complaint');
        updateState({ isDeleting: false });
      }
    }
  };

  if (state.loading) return <div className="dashboard-loading"><RefreshCw className="w-12 h-12 text-blue-600 loading-spinner" /><p>Loading...</p></div>;

  const { stats, complaints, officers, workload, categoryStats, wardStats, slaBreaches, auditLogs } = state;
  const tabs = [
    { id: 'overview', label: 'Analytics', icon: BarChart3 },
    { id: 'sla', label: 'SLA Control', icon: Target },
    { id: 'officers', label: 'Officers', icon: Shield },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'complaints', label: 'Complaints', icon: FileText },
    { id: 'geospatial', label: 'Geo Heatmap', icon: MapIcon },
    { id: 'audit', label: 'Audit Logs', icon: History },
    { id: 'communications', label: 'Broadcast', icon: Megaphone },
    { id: 'reports', label: 'Reports', icon: FileSpreadsheet }
  ];

  return (
    <div className="admin-dashboard min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 relative overflow-hidden">
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating Geometric Shapes */}
        <div className="absolute top-20 left-10 animate-float-slow opacity-10">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg rotate-12 shadow-lg"></div>
        </div>
        
        <div className="absolute top-40 right-20 animate-float opacity-15">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full shadow-lg"></div>
        </div>

        <div className="absolute bottom-32 left-1/4 animate-float-slow opacity-12">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-indigo-600 transform rotate-45 shadow-lg"></div>
        </div>

        <div className="absolute top-1/3 right-10 animate-float opacity-18">
          <div className="w-14 h-28 bg-gradient-to-br from-purple-400 to-purple-600 rounded-t-full shadow-lg"></div>
        </div>

        <div className="absolute bottom-20 right-1/3 animate-float-slow opacity-15">
          <div className="w-32 h-8 bg-gradient-to-r from-green-400 to-green-600 rounded-full shadow-lg"></div>
        </div>

        {/* Smart Civic Icons with Enhanced Styling */}
        <div className="absolute top-60 left-1/3 animate-float opacity-20">
          <div className="p-4 bg-white bg-opacity-20 rounded-full backdrop-blur-sm shadow-xl">
            <BarChart3 className="w-12 h-12 text-blue-700" />
          </div>
        </div>

        <div className="absolute bottom-40 left-20 animate-float-slow opacity-25">
          <div className="p-4 bg-white bg-opacity-20 rounded-full backdrop-blur-sm shadow-xl">
            <Shield className="w-14 h-14 text-green-700" />
          </div>
        </div>

        <div className="absolute top-80 right-1/4 animate-float opacity-15">
          <div className="p-3 bg-white bg-opacity-20 rounded-full backdrop-blur-sm shadow-xl">
            <Users className="w-10 h-10 text-purple-700" />
          </div>
        </div>

        <div className="absolute top-1/2 left-16 animate-float-slow opacity-20">
          <div className="p-4 bg-white bg-opacity-20 rounded-full backdrop-blur-sm shadow-xl">
            <FileText className="w-12 h-12 text-orange-700" />
          </div>
        </div>

        <div className="absolute bottom-60 right-16 animate-float opacity-18">
          <div className="p-3 bg-white bg-opacity-20 rounded-full backdrop-blur-sm shadow-xl">
            <Target className="w-11 h-11 text-red-600" />
          </div>
        </div>

        {/* Digital Governance Themed Elements */}
        <div className="absolute top-32 right-1/3 animate-float-slow opacity-12">
          <div className="relative">
            <div className="w-20 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg shadow-lg opacity-80"></div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-ping"></div>
          </div>
        </div>

        <div className="absolute bottom-80 left-1/2 animate-float opacity-16">
          <div className="flex space-x-2">
            <div className="w-4 h-12 bg-gradient-to-t from-blue-500 to-blue-300 rounded-full"></div>
            <div className="w-4 h-8 bg-gradient-to-t from-green-500 to-green-300 rounded-full"></div>
            <div className="w-4 h-16 bg-gradient-to-t from-orange-500 to-orange-300 rounded-full"></div>
          </div>
        </div>

        {/* Sophisticated Animated Blobs */}
        <div className="absolute top-1/4 left-1/3 w-40 h-40 bg-gradient-to-br from-blue-300 via-blue-400 to-indigo-500 rounded-full mix-blend-multiply filter blur-2xl opacity-15 animate-blob"></div>
        <div className="absolute top-1/2 right-1/4 w-48 h-48 bg-gradient-to-br from-orange-300 via-orange-400 to-red-500 rounded-full mix-blend-multiply filter blur-2xl opacity-12 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/2 w-44 h-44 bg-gradient-to-br from-purple-300 via-purple-400 to-indigo-500 rounded-full mix-blend-multiply filter blur-2xl opacity-15 animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/6 right-1/6 w-36 h-36 bg-gradient-to-br from-green-300 via-emerald-400 to-teal-500 rounded-full mix-blend-multiply filter blur-2xl opacity-13 animate-blob animation-delay-1000"></div>
        
        {/* Smart City Grid Pattern */}
        <div className="absolute top-0 left-0 w-full h-full opacity-5 smart-grid">
          <div className="absolute top-1/4 left-1/4 transform rotate-12">
            <div className="grid grid-cols-3 gap-2">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="w-3 h-3 bg-blue-600 rounded-sm animate-pulse" style={{animationDelay: `${i * 0.5}s`}}></div>
              ))}
            </div>
          </div>
          
          {/* Digital Government Illustration Elements */}
          <div className="absolute bottom-1/4 right-1/4 transform -rotate-12 opacity-8">
            <div className="relative">
              <div className="w-32 h-20 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-lg shadow-lg opacity-60"></div>
              <div className="absolute top-2 left-2 w-28 h-16 bg-white bg-opacity-90 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="w-4 h-4 bg-blue-500 rounded-full mx-auto mb-1 animate-pulse"></div>
                  <div className="h-1 bg-gray-300 rounded w-16 mx-auto mb-1"></div>
                  <div className="h-1 bg-gray-300 rounded w-12 mx-auto"></div>
                </div>
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full animate-bounce-subtle"></div>
              <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-orange-400 rounded-full animate-pulse"></div>
            </div>
          </div>
          
          {/* Connecting Lines */}
          <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 opacity-10">
            <svg width="200" height="100" viewBox="0 0 200 100">
              <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.5">
                    <animate attributeName="stop-opacity" values="0.5;1;0.5" dur="3s" repeatCount="indefinite"/>
                  </stop>
                  <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.8">
                    <animate attributeName="stop-opacity" values="0.8;0.3;0.8" dur="3s" repeatCount="indefinite"/>
                  </stop>
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.5">
                    <animate attributeName="stop-opacity" values="0.5;1;0.5" dur="3s" repeatCount="indefinite"/>
                  </stop>
                </linearGradient>
              </defs>
              <path d="M10,50 Q50,10 100,50 T190,50" stroke="url(#lineGradient)" strokeWidth="2" fill="none"/>
              <circle cx="10" cy="50" r="3" fill="#3B82F6" opacity="0.7">
                <animate attributeName="r" values="3;6;3" dur="2s" repeatCount="indefinite"/>
              </circle>
              <circle cx="100" cy="50" r="3" fill="#8B5CF6" opacity="0.7">
                <animate attributeName="r" values="3;6;3" dur="2s" repeatCount="indefinite" begin="0.7s"/>
              </circle>
              <circle cx="190" cy="50" r="3" fill="#F59E0B" opacity="0.7">
                <animate attributeName="r" values="3;6;3" dur="2s" repeatCount="indefinite" begin="1.4s"/>
              </circle>
            </svg>
          </div>
        </div>
      </div>

      {/* Animation Styles */}
      <style>{`
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) translateX(0px) rotate(0deg); 
          }
          25% { 
            transform: translateY(-15px) translateX(5px) rotate(2deg); 
          }
          50% { 
            transform: translateY(-25px) translateX(0px) rotate(5deg); 
          }
          75% { 
            transform: translateY(-15px) translateX(-5px) rotate(2deg); 
          }
        }
        @keyframes float-slow {
          0%, 100% { 
            transform: translateY(0px) translateX(0px) rotate(0deg) scale(1); 
          }
          25% { 
            transform: translateY(-20px) translateX(-7px) rotate(-2deg) scale(1.05); 
          }
          50% { 
            transform: translateY(-35px) translateX(0px) rotate(-5deg) scale(1.1); 
          }
          75% { 
            transform: translateY(-20px) translateX(7px) rotate(-2deg) scale(1.05); 
          }
        }
        @keyframes blob {
          0%, 100% { 
            transform: translate(0px, 0px) scale(1) rotate(0deg); 
          }
          25% { 
            transform: translate(25px, -40px) scale(1.1) rotate(90deg); 
          }
          50% { 
            transform: translate(50px, -80px) scale(1.3) rotate(180deg); 
          }
          75% { 
            transform: translate(-25px, -40px) scale(1.1) rotate(270deg); 
          }
        }
        @keyframes pulse-glow {
          0%, 100% { 
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); 
            transform: scale(1); 
          }
          50% { 
            box-shadow: 0 0 40px rgba(59, 130, 246, 0.6); 
            transform: scale(1.05); 
          }
        }
        @keyframes slide-in-elegant {
          0% { 
            transform: translateX(-100px) rotate(-10deg); 
            opacity: 0; 
          }
          100% { 
            transform: translateX(0px) rotate(0deg); 
            opacity: 1; 
          }
        }
        @keyframes bounce-subtle {
          0%, 20%, 50%, 80%, 100% { 
            transform: translateY(0); 
          }
          40% { 
            transform: translateY(-8px); 
          }
          60% { 
            transform: translateY(-4px); 
          }
        }
        
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        .animate-float-slow {
          animation: float-slow 12s ease-in-out infinite;
        }
        .animate-blob {
          animation: blob 20s ease-in-out infinite;
        }
        .animate-pulse-glow {
          animation: pulse-glow 3s ease-in-out infinite;
        }
        .animate-slide-in {
          animation: slide-in-elegant 1s ease-out;
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }
        
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        .animation-delay-2000 {
          animation-delay: 3s;
        }
        .animation-delay-4000 {
          animation-delay: 6s;
        }
        
        /* Enhanced Card Animations */
        .dashboard-card {
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .dashboard-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }
        
        /* Advanced Stats Card Animation */
        .stats-card {
          transition: all 0.5s ease;
          animation: subtle-pulse 6s ease-in-out infinite;
        }
        .stats-card:hover {
          animation-play-state: paused;
          transform: scale(1.05) rotateY(5deg);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
        }
        
        @keyframes subtle-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.95; }
        }

        /* Smart Digital Governance Theme */
        .governance-glow {
          animation: pulse-glow 4s ease-in-out infinite;
        }
        
        /* Background Pattern Animation */
        .smart-grid {
          animation: grid-pulse 8s ease-in-out infinite;
        }
        
        @keyframes grid-pulse {
          0%, 100% { opacity: 0.05; }
          50% { opacity: 0.15; }
        }
      `}</style>

      {/* Mobile Sidebar - Full Screen Overlay */}
      {state.mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden" 
          style={{ zIndex: 9998 }}
          onClick={() => updateState({ mobileMenuOpen: false })} 
        />
      )}
      <div 
        className={`fixed inset-0 bg-white shadow-2xl transform transition-transform duration-300 md:hidden ${state.mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ zIndex: 9999 }}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-indigo-600">
            <div className="flex items-center gap-2"><LayoutDashboard className="w-6 h-6 text-white" /><span className="font-bold text-white">Menu</span></div>
            <button onClick={() => updateState({ mobileMenuOpen: false })} className="p-2 text-white hover:bg-white/10 rounded-lg"><X className="w-5 h-5" /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return <button key={tab.id} onClick={() => updateState({ activeTab: tab.id, mobileMenuOpen: false })} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${state.activeTab === tab.id ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}><Icon className="w-5 h-5" /><span>{tab.label}</span></button>;
            })}
          </div>
        </div>
      </div>

      {/* Header - Citizen Theme - Mobile Responsive */}
      <div className="bg-white shadow-md border-b border-gray-200 relative z-10 animate-slide-in">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-4">
          <div className="flex items-center justify-between gap-1 sm:gap-2">
            <div className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0">
              <button onClick={() => updateState({ mobileMenuOpen: !state.mobileMenuOpen })} className="md:hidden p-1.5 sm:p-2 text-gray-700 hover:bg-gray-100 rounded-lg flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
              <div className="flex flex-col min-w-0">
                <h1 className="text-base sm:text-2xl md:text-3xl font-bold text-blue-900 truncate">Admin Dashboard</h1>
                <p className="text-[10px] sm:text-sm text-gray-700 truncate">Welcome, {state.currentUser.Name}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              {/* Profile Button */}
              <button 
                onClick={() => updateState({ 
                  showUserProfile: !state.showUserProfile,
                  showNotifications: false // Close notifications when opening profile
                })} 
                className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all font-bold text-base sm:text-lg shadow-md"
                aria-label="Profile"
              >
                {state.currentUser.Name?.charAt(0) || 'B'}
              </button>

              {/* Notification Bell Button */}
              <button 
                onClick={() => updateState({ 
                  showNotifications: !state.showNotifications,
                  showUserProfile: false // Close profile when opening notifications
                })} 
                className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors relative ${slaBreaches.length > 0 ? 'animate-bounce-subtle' : ''}`}
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                {slaBreaches.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 text-white text-[10px] sm:text-xs rounded-full flex items-center justify-center animate-pulse governance-glow">
                    {slaBreaches.length}
                  </span>
                )}
              </button>

              {/* Refresh Button */}
              <button 
                onClick={loadData} 
                className="hidden sm:flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors dashboard-card"
                aria-label="Refresh"
              >
                <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Logout Button */}
              <button 
                onClick={() => localStorage.clear() || navigate("/login")} 
                className="bg-gradient-to-r from-orange-400 to-orange-500 text-white px-2 sm:px-6 py-1 sm:py-2 rounded-lg hover:from-orange-500 hover:to-orange-600 font-semibold transition-all duration-300 shadow-md text-xs sm:text-base"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-2 sm:px-6 py-3 sm:py-8 relative z-10 animate-slide-in" style={{ animationDelay: '0.2s' }}>
        {/* Stats Cards - Citizen Theme with colored borders - Mobile Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2 sm:gap-4 md:gap-6 mb-3 sm:mb-8">
          {[
            { title: "Total Complaints", value: stats.total || 0, icon: FileText, border: "border-blue-500", color: "text-blue-600" },
            { title: "Resolved", value: stats.resolved || 0, icon: CheckCircle, border: "border-green-500", color: "text-green-600" },
            { title: "In Progress", value: stats.inProgress || 0, icon: Activity, border: "border-blue-400", color: "text-blue-500" },
            { title: "Pending", value: stats.submitted || 0, icon: Clock, border: "border-orange-400", color: "text-orange-600" },
            { title: "SLA Breached", value: stats.slaBreached || 0, icon: AlertTriangle, border: "border-red-500", color: "text-red-600" }
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div 
                key={i} 
                className={`bg-white p-3 sm:p-5 md:p-6 rounded-xl shadow-lg border-t-4 ${stat.border} hover:shadow-xl transition-shadow dashboard-card stats-card governance-glow animate-slide-in`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-8 h-8 sm:w-12 sm:h-12 ${stat.color} flex items-center justify-center`}>
                    <Icon className="w-5 h-5 sm:w-8 sm:h-8" />
                  </div>
                </div>
                <h3 className="text-blue-900 font-semibold text-[10px] sm:text-sm mb-1">{stat.title}</h3>
                <p className={`text-2xl sm:text-4xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            );
          })}
        </div>

        {/* Tab Navigation - Mobile Responsive */}
        <div className="dashboard-tabs-container">
          <div className="md:hidden mb-3">
            <select value={state.activeTab} onChange={(e) => updateState({ activeTab: e.target.value })} className="w-full px-3 py-2 bg-white border-2 border-gray-300 rounded-xl text-xs sm:text-base">
              {tabs.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </div>
          <div className="dashboard-tabs-nav hidden md:flex overflow-x-auto">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return <button key={tab.id} onClick={() => updateState({ activeTab: tab.id })} className={`dashboard-tab-button ${state.activeTab === tab.id ? 'active' : ''} whitespace-nowrap`}><div className="dashboard-tab-button-content"><Icon className="w-4 h-4" /><span className="text-sm lg:text-base">{tab.label}</span></div></button>;
            })}
          </div>
          {/* Tab Content */}
          <div className="dashboard-tab-content">
            {state.activeTab === "overview" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                    Smart Analytics Dashboard
                  </h2>
                  <div className="flex gap-2">
                    <button onClick={() => updateState({ showFilters: !state.showFilters })} className={`px-4 py-2 rounded-lg flex items-center gap-2 ${state.showFilters ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
                      <Sliders className="w-4 h-4" />
                      Filters
                    </button>
                    <select value={state.timeRange} onChange={(e) => updateState({ timeRange: e.target.value })} className="px-4 py-2 border-2 border-gray-300 rounded-lg">
                      <option value="7days">Last 7 Days</option>
                      <option value="30days">Last 30 Days</option>
                      <option value="90days">Last 90 Days</option>
                      <option value="all">All Time</option>
                    </select>
                  </div>
                </div>

                {/* Advanced Filters */}
                {state.showFilters && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-200">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                        <select value={state.priorityFilter} onChange={(e) => updateState({ priorityFilter: e.target.value })} className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg">
                          <option value="all">All Priorities</option>
                          <option value="high">High Priority</option>
                          <option value="medium">Medium Priority</option>
                          <option value="low">Low Priority</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <select value={state.filterStatus} onChange={(e) => updateState({ filterStatus: e.target.value })} className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg">
                          <option value="all">All Statuses</option>
                          <option value="Submitted">Submitted</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                        <select className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg">
                          <option value="all">All Categories</option>
                          {categoryStats.map(cat => <option key={cat.category} value={cat.category}>{cat.category}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Chart Type</label>
                        <select value={state.chartView} onChange={(e) => updateState({ chartView: e.target.value })} className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg">
                          <option value="bar">Bar Chart</option>
                          <option value="line">Line Chart</option>
                          <option value="area">Area Chart</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Performance Metrics - Citizen Theme - Mobile Responsive */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
                  <div className="bg-white p-3 sm:p-5 md:p-6 rounded-xl shadow-lg border-t-4 border-blue-500 hover:shadow-xl transition-shadow">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-5 h-5 sm:w-8 sm:h-8 text-blue-600" />
                    </div>
                    <h3 className="text-blue-900 font-semibold text-[10px] sm:text-sm mb-1">Avg Resolution</h3>
                    <p className="text-xl sm:text-3xl font-bold text-blue-600">{state.performanceMetrics.avgResolutionTime || '0'}</p>
                    <p className="text-[10px] sm:text-xs text-gray-600 mt-1">days</p>
                  </div>
                  <div className="bg-white p-3 sm:p-5 md:p-6 rounded-xl shadow-lg border-t-4 border-green-500 hover:shadow-xl transition-shadow">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-5 h-5 sm:w-8 sm:h-8 text-green-600" />
                    </div>
                    <h3 className="text-blue-900 font-semibold text-[10px] sm:text-sm mb-1">SLA Compliance</h3>
                    <p className="text-xl sm:text-3xl font-bold text-green-600">{state.performanceMetrics.slaComplianceRate || '0'}%</p>
                    <p className="text-[10px] sm:text-xs text-gray-600 mt-1">compliance rate</p>
                  </div>
                  <div className="bg-white p-3 sm:p-5 md:p-6 rounded-xl shadow-lg border-t-4 border-purple-500 hover:shadow-xl transition-shadow">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5 sm:w-8 sm:h-8 text-purple-600" />
                    </div>
                    <h3 className="text-blue-900 font-semibold text-[10px] sm:text-sm mb-1">Today's Complaints</h3>
                    <p className="text-xl sm:text-3xl font-bold text-purple-600">{state.performanceMetrics.todayComplaints || '0'}</p>
                    <p className="text-[10px] sm:text-xs text-gray-600 mt-1">today</p>
                  </div>
                  <div className="bg-white p-3 sm:p-5 md:p-6 rounded-xl shadow-lg border-t-4 border-orange-400 hover:shadow-xl transition-shadow">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5 sm:w-8 sm:h-8 text-orange-600" />
                    </div>
                    <h3 className="text-blue-900 font-semibold text-[10px] sm:text-sm mb-1">This Week</h3>
                    <p className="text-xl sm:text-3xl font-bold text-orange-600">{state.performanceMetrics.weeklyGrowth || '0'}</p>
                    <p className="text-[10px] sm:text-xs text-gray-600 mt-1">complaints</p>
                  </div>
                </div>

                {/* Trend Chart */}
                <div className="bg-white p-6 rounded-xl border-2 border-gray-200">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                      Complaint Trends (Last 30 Days)
                    </h3>
                    <div className="flex gap-4 text-sm">
                      <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded"></div><span>Total</span></div>
                      <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-500 rounded"></div><span>Resolved</span></div>
                      <div className="flex items-center gap-2"><div className="w-3 h-3 bg-yellow-500 rounded"></div><span>Pending</span></div>
                    </div>
                  </div>
                  <div className="h-64 flex items-end justify-between gap-1">
                    {state.trendData.slice(-14).map((day, i) => {
                      const maxValue = Math.max(...state.trendData.map(d => d.total));
                      const heightPercent = maxValue > 0 ? (day.total / maxValue * 100) : 0;
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                          <div className="w-full flex flex-col items-center gap-1" style={{ height: '200px', justifyContent: 'flex-end' }}>
                            {day.resolved > 0 && (
                              <div className="w-full bg-green-500 rounded-t hover:bg-green-600 transition-all" 
                                   style={{ height: `${(day.resolved / maxValue * 200)}px` }} 
                                   title={`Resolved: ${day.resolved}`}>
                              </div>
                            )}
                            {day.pending > 0 && (
                              <div className="w-full bg-yellow-500 hover:bg-yellow-600 transition-all" 
                                   style={{ height: `${(day.pending / maxValue * 200)}px` }} 
                                   title={`Pending: ${day.pending}`}>
                              </div>
                            )}
                          </div>
                          <div className="text-xs text-gray-600 transform -rotate-45 origin-top-left mt-2">{day.date}</div>
                          <div className="opacity-0 group-hover:opacity-100 absolute bg-gray-900 text-white text-xs px-2 py-1 rounded -mt-20">Total: {day.total}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Priority Distribution */}
                <div className="bg-white p-6 rounded-xl border-2 border-gray-200">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <AlertOctagon className="w-5 h-5 text-red-600" />
                    Priority Distribution
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { label: 'High Priority', value: state.performanceMetrics.priorityHigh || 0, color: 'red', icon: AlertTriangle },
                      { label: 'Medium Priority', value: state.performanceMetrics.priorityMedium || 0, color: 'yellow', icon: Clock },
                      { label: 'Low Priority', value: state.performanceMetrics.priorityLow || 0, color: 'green', icon: CheckCircle }
                    ].map((priority, i) => {
                      const Icon = priority.icon;
                      const total = (state.performanceMetrics.priorityHigh || 0) + (state.performanceMetrics.priorityMedium || 0) + (state.performanceMetrics.priorityLow || 0);
                      const percentage = total > 0 ? ((priority.value / total) * 100).toFixed(0) : 0;
                      return (
                        <div key={i} className={`p-4 border-2 border-${priority.color}-200 rounded-xl bg-${priority.color}-50`}>
                          <div className="flex items-center justify-between mb-3">
                            <Icon className={`w-6 h-6 text-${priority.color}-600`} />
                            <span className={`text-2xl font-bold text-${priority.color}-600`}>{priority.value}</span>
                          </div>
                          <p className="text-sm font-medium text-gray-700 mb-2">{priority.label}</p>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className={`bg-${priority.color}-500 h-2 rounded-full transition-all`} style={{ width: `${percentage}%` }}></div>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">{percentage}% of total</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Officer Performance Leaderboard */}
                <div className="bg-white p-6 rounded-xl border-2 border-gray-200">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-purple-600" />
                    Officer Performance Leaderboard
                  </h3>
                  <div className="space-y-3">
                    {workload.slice(0, 5).sort((a, b) => b.resolved - a.resolved).map((officer, i) => {
                      const efficiency = officer.assigned > 0 ? ((officer.resolved / officer.assigned) * 100).toFixed(0) : 0;
                      return (
                        <div key={i} className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg hover:shadow-md transition-all">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-orange-600' : 'bg-purple-600'}`}>
                            #{i + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-800">{officer.name}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                              <span>Assigned: {officer.assigned}</span>
                              <span className="text-green-600 font-medium">Resolved: {officer.resolved}</span>
                              <span className="text-yellow-600">Pending: {officer.pending}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-purple-600">{efficiency}%</p>
                            <p className="text-xs text-gray-600">Efficiency</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* Quick Actions */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Complaints', value: complaints.length, icon: FileText, color: 'blue', action: () => updateState({ activeTab: 'complaints' }) },
                    { label: 'Active Officers', value: officers.length, icon: Shield, color: 'purple', action: () => updateState({ activeTab: 'officers' }) },
                    { label: 'SLA Breaches', value: slaBreaches.length, icon: AlertTriangle, color: 'red', action: () => updateState({ activeTab: 'sla' }) },
                    { label: 'Categories', value: categoryStats.length, icon: BarChart3, color: 'green', action: () => {} }
                  ].map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <button key={i} onClick={item.action} className={`p-4 bg-gradient-to-br from-${item.color}-50 to-${item.color}-100 border-2 border-${item.color}-200 rounded-xl hover:shadow-lg transition-all text-left`}>
                        <Icon className={`w-8 h-8 text-${item.color}-600 mb-2`} />
                        <p className={`text-3xl font-bold text-${item.color}-600 mb-1`}>{item.value}</p>
                        <p className="text-sm text-gray-700 font-medium">{item.label}</p>
                      </button>
                    );
                  })}
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Complaints Activity */}
                  <div className="bg-white p-6 rounded-xl border-2 border-gray-200">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Activity className="w-5 h-5 text-blue-600" />Recent Complaints</h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {complaints.slice(0, 8).map((c, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors" onClick={() => navigate(`/officer/${c._id}`)}>
                          <div className={`w-10 h-10 rounded-full ${c.status === 'Resolved' ? 'bg-green-500' : c.status === 'In Progress' ? 'bg-blue-500' : 'bg-yellow-500'} flex items-center justify-center flex-shrink-0`}>
                            {c.status === 'Resolved' ? <CheckCircle className="w-5 h-5 text-white" /> : c.status === 'In Progress' ? <Activity className="w-5 h-5 text-white" /> : <Clock className="w-5 h-5 text-white" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-800 truncate">{c.title}</p>
                            <p className="text-xs text-gray-600 mt-1">{c.citizen?.Name || 'Anonymous'} • {c.category}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${c.status === 'Resolved' ? 'bg-green-100 text-green-700' : c.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>{c.status}</span>
                              <span className="text-xs text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Critical Alerts */}
                  <div className="bg-white p-6 rounded-xl border-2 border-gray-200">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-red-600" />Critical Alerts</h3>
                    {slaBreaches.length > 0 ? (
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded-lg">
                          <p className="font-semibold text-red-900 flex items-center gap-2"><AlertOctagon className="w-5 h-5" />{slaBreaches.length} SLA Breaches</p>
                          <p className="text-sm text-red-700 mt-1">Immediate action required</p>
                        </div>
                        {slaBreaches.slice(0, 5).map(b => (
                          <div key={b._id} className="p-3 bg-orange-50 hover:bg-orange-100 rounded-lg cursor-pointer transition-colors" onClick={() => navigate(`/officer/${b._id}`)}>
                            <div className="flex items-start gap-3">
                              <Clock className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">{b.title}</p>
                                <p className="text-xs text-gray-600 mt-1">{b.category} • {b.location || 'N/A'}</p>
                                <p className="text-xs text-orange-600 mt-1 font-medium">Overdue by {Math.floor((new Date() - new Date(b.slaDeadline)) / (1000 * 60 * 60 * 24))} days</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8"><CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" /><p className="font-medium text-gray-700">All Within SLA</p><p className="text-sm text-gray-500 mt-1">No critical alerts</p></div>
                    )}
                  </div>
                </div>
                
                {/* Category Breakdown */}
                <div className="content-box">
                  <h3><BarChart3 className="w-5 h-5 text-blue-600" />Category Distribution</h3>
                  {categoryStats.length > 0 ? (
                    <div className="category-cards-grid">
                      {categoryStats.map((cat, i) => (
                        <div key={i} className="category-card hover:shadow-lg transition-all cursor-pointer" onClick={() => { updateState({ activeTab: 'complaints', filterStatus: 'all', categoryFilter: cat.category, searchTerm: '' }); }}>
                          <h4 className="category-card-title">{cat.category}</h4>
                          <div className="grid grid-cols-3 gap-2 my-3">
                            <div className="text-center p-2 bg-blue-50 rounded"><p className="text-2xl font-bold text-blue-600">{cat.total}</p><p className="text-xs text-gray-600">Total</p></div>
                            <div className="text-center p-2 bg-green-50 rounded"><p className="text-2xl font-bold text-green-600">{cat.resolved}</p><p className="text-xs text-gray-600">Resolved</p></div>
                            <div className="text-center p-2 bg-yellow-50 rounded"><p className="text-2xl font-bold text-yellow-600">{cat.pending}</p><p className="text-xs text-gray-600">Pending</p></div>
                          </div>
                          <div className="progress-bar-container"><div className="progress-bar" style={{ width: `${cat.total ? (cat.resolved / cat.total) * 100 : 0}%` }}></div></div>
                          <p className="text-xs text-gray-500 mt-2 text-center font-medium">{cat.total ? Math.round((cat.resolved / cat.total) * 100) : 0}% Resolution Rate</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8"><p className="text-gray-600">No data yet</p><div className="grid grid-cols-3 gap-3 mt-4">{['Water', 'Electricity', 'Roads', 'Sanitation', 'Safety', 'Other'].map((c, i) => <div key={i} className="p-3 bg-gray-50 rounded-lg"><p className="text-xs font-medium">{c}</p><p className="text-sm text-gray-400">0</p></div>)}</div></div>
                  )}
                </div>
              </div>
            )}

            {state.activeTab === "sla" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center"><h2>SLA & Escalation Control</h2><button onClick={actions.escalate} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"><Zap className="w-4 h-4 inline mr-2" />Escalate All ({slaBreaches.length})</button></div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {[{ title: 'Compliant', value: (stats.total || 0) - slaBreaches.length, color: 'green', icon: CheckCircle }, { title: 'Breached', value: slaBreaches.length, color: 'red', icon: AlertOctagon }, { title: 'At Risk', value: Math.floor((stats.submitted || 0) * 0.3), color: 'yellow', icon: AlertTriangle }].map((card, i) => {
                    const Icon = card.icon;
                    return <div key={i} className={`bg-${card.color}-50 p-6 rounded-xl border-2 border-${card.color}-200`}><div className="flex justify-between mb-3"><h3 className="font-semibold">{card.title}</h3><Icon className={`w-6 h-6 text-${card.color}-600`} /></div><p className={`text-4xl font-bold text-${card.color}-600`}>{card.value}</p></div>;
                  })}
                </div>
                {slaBreaches.length > 0 && <div className="bg-white p-6 rounded-xl border-2 border-gray-200"><h3 className="font-semibold mb-4">Active SLA Breaches</h3><div className="space-y-2">{slaBreaches.slice(0, 5).map((b, i) => <div key={i} className="p-4 bg-red-50 rounded-lg flex justify-between"><div><p className="font-medium">{b.title}</p><p className="text-sm text-gray-600">{b.category}</p></div><button onClick={() => navigate(`/officer/${b._id}`)} className="px-3 py-1 bg-blue-600 text-white rounded"><Eye className="w-4 h-4" /></button></div>)}</div></div>}
              </div>
            )}

            {state.activeTab === "officers" && (() => {
              const selectedOfficer = state.selectedOfficerId ? officers.find(o => o._id === state.selectedOfficerId) : null;
              const officerComplaints = selectedOfficer ? complaints.filter(c => c.assignedOfficer?._id === selectedOfficer._id || c.assignedOfficer === selectedOfficer._id) : [];
              const resolvedCount = officerComplaints.filter(c => c.status === 'Resolved' || c.status === 'Closed').length;
              const inProgressCount = officerComplaints.filter(c => c.status === 'In Progress').length;
              const efficiency = officerComplaints.length > 0 ? Math.round((resolvedCount / officerComplaints.length) * 100) : 0;
              
              return (
                <div className="space-y-6">
                  {!selectedOfficer && !state.showAddOfficerForm ? (
                    <>
                      <div className="flex justify-between items-center flex-wrap gap-4 mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Officer Performance Tracking</h2>
                        <button 
                          onClick={() => updateState({ showAddOfficerForm: true })}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                        >
                          <UserPlus className="w-4 h-4" />
                          <span>Add Officer</span>
                        </button>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[{ label: 'Total Officers', value: workload.length, icon: Users }, { label: 'High Performers', value: workload.filter(o => o.resolved > o.pending).length, icon: TrendingUp }].map((s, i) => { const Icon = s.icon; return <div key={i} className="bg-white p-4 rounded-xl border-2 border-gray-200"><Icon className="w-5 h-5 text-blue-600 mb-2" /><p className="text-3xl font-bold">{s.value}</p><p className="text-sm text-gray-600">{s.label}</p></div>; })}
                      </div>
                      <div className="bg-white p-6 rounded-xl border-2 border-gray-200">
                        <h3 className="font-semibold mb-4">Officer Efficiency Scores</h3>
                        <div className="space-y-3">{workload.map((o, i) => { const score = o.assigned > 0 ? Math.round((o.resolved / o.assigned) * 100) : 0; return <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">{o.name?.charAt(0)}</div><div><p className="font-medium">{o.name}</p><p className="text-sm text-gray-600">Assigned: {o.assigned}</p></div></div><div className="text-right"><p className="text-2xl font-bold text-blue-600">{score}%</p><p className="text-xs text-gray-500">{o.resolved} resolved</p></div></div>; })}</div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{officers.map(o => <div key={o._id} className="bg-blue-50 p-4 rounded-xl border-2 border-blue-200"><div className="flex items-center gap-3 mb-3"><div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xl">{o.Name?.charAt(0)}</div><div className="flex-1 min-w-0"><h4 className="font-bold truncate">{o.Name}</h4><p className="text-sm text-gray-600 truncate">{o.Email}</p></div></div>{(o.specializations && o.specializations.length > 0) && <div className="mb-3"><p className="text-xs text-gray-600 mb-1">Specializations:</p><div className="flex flex-wrap gap-1">{o.specializations.slice(0, 3).map((s, i) => <span key={i} className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs">{s}</span>)}{o.specializations.length > 3 && <span className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded text-xs">+{o.specializations.length - 3}</span>}</div></div>}<button onClick={() => updateState({ selectedOfficerId: o._id })} className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><Eye className="w-4 h-4 inline mr-2" />View Details</button></div>)}</div>
                    </>
                  ) : state.showAddOfficerForm ? (
                    <>
                      <button onClick={() => updateState({ showAddOfficerForm: false, newOfficerData: { Name: '', Email: '', Password: '', assignedZones: [], specializations: [], isAvailable: true } })} className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-4">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        Back to Officers
                      </button>
                      
                      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white p-4 sm:p-6 rounded-xl mb-6">
                        <h2 className="text-2xl sm:text-3xl font-bold">Add New Officer</h2>
                        <p className="text-white text-sm sm:text-base mt-1">Create a new officer account</p>
                      </div>
                      
                      <div className="bg-white p-6 rounded-xl border-2 border-gray-200 space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                          <input
                            type="text"
                            value={state.newOfficerData.Name}
                            onChange={(e) => updateState({ 
                              newOfficerData: { ...state.newOfficerData, Name: e.target.value }
                            })}
                            placeholder="Enter officer's full name"
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 text-base"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                          <input
                            type="email"
                            value={state.newOfficerData.Email}
                            onChange={(e) => updateState({ 
                              newOfficerData: { ...state.newOfficerData, Email: e.target.value }
                            })}
                            placeholder="Enter officer's email address"
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 text-base"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                          <input
                            type="password"
                            value={state.newOfficerData.Password}
                            onChange={(e) => updateState({ 
                              newOfficerData: { ...state.newOfficerData, Password: e.target.value }
                            })}
                            placeholder="Create a password"
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 text-base"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Specializations (Categories)
                          </label>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {['Water', 'Electricity', 'Road', 'Sanitation', 'Public Works', 'Traffic'].map(cat => (
                              <button
                                key={cat}
                                type="button"
                                onClick={() => {
                                  const specs = state.newOfficerData.specializations || [];
                                  const newSpecs = specs.includes(cat) 
                                    ? specs.filter(s => s !== cat)
                                    : [...specs, cat];
                                  updateState({ 
                                    newOfficerData: { ...state.newOfficerData, specializations: newSpecs }
                                  });
                                }}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                  (state.newOfficerData.specializations || []).includes(cat)
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                              >
                                {cat}
                              </button>
                            ))}
                          </div>
                          <p className="text-xs text-gray-500">Select categories this officer can handle</p>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Assigned Zones/Districts
                          </label>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {state.newOfficerData.assignedZones?.map((zone, idx) => (
                              <div key={idx} className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg">
                                <span className="text-sm">{zone}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newZones = state.newOfficerData.assignedZones.filter((_, i) => i !== idx);
                                    updateState({ 
                                      newOfficerData: { ...state.newOfficerData, assignedZones: newZones }
                                    });
                                  }}
                                  className="ml-1 text-blue-900 hover:text-blue-600"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Enter zone/district name"
                              className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 text-sm"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter' && e.target.value.trim()) {
                                  e.preventDefault();
                                  const newZones = [...(state.newOfficerData.assignedZones || []), e.target.value.trim()];
                                  updateState({ 
                                    newOfficerData: { ...state.newOfficerData, assignedZones: newZones }
                                  });
                                  e.target.value = '';
                                }
                              }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Press Enter to add a zone</p>
                        </div>
                        
                        <div className="flex gap-3 pt-4">
                          <button
                            onClick={actions.addOfficer}
                            className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-base"
                          >
                            Create Officer Account
                          </button>
                          <button
                            onClick={() => updateState({ 
                              showAddOfficerForm: false,
                              newOfficerData: { Name: '', Email: '', Password: '' }
                            })}
                            className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium text-base"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <button onClick={() => updateState({ selectedOfficerId: null })} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        Back to Officers
                      </button>
                      
                      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white p-4 sm:p-6 rounded-xl">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white text-indigo-600 flex items-center justify-center font-bold text-2xl sm:text-3xl shadow-lg flex-shrink-0">
                            {selectedOfficer.Name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold truncate">{selectedOfficer.Name}</h2>
                            <p className="text-white text-sm sm:text-base truncate">{selectedOfficer.Email}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white p-6 rounded-xl border-2 border-gray-200">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                          <Target className="w-5 h-5 text-indigo-600" />
                          Assignment Configuration
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Specializations (Categories)
                            </label>
                            {selectedOfficer.specializations && selectedOfficer.specializations.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {selectedOfficer.specializations.map((spec, idx) => (
                                  <span key={idx} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium">
                                    {spec}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="text-gray-500 text-sm italic">All categories</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Assigned Zones/Districts
                            </label>
                            {selectedOfficer.assignedZones && selectedOfficer.assignedZones.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {selectedOfficer.assignedZones.map((zone, idx) => (
                                  <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                                    {zone}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="text-gray-500 text-sm italic">All zones</p>
                            )}
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${selectedOfficer.isAvailable !== false ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <span className="text-sm font-medium text-gray-700">
                              {selectedOfficer.isAvailable !== false ? 'Available for assignments' : 'Currently unavailable'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                          <BarChart3 className="w-5 h-5 text-indigo-600" />
                          Performance Statistics
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border-2 border-blue-200">
                            <p className="text-sm text-gray-600 mb-1">Assigned</p>
                            <p className="text-3xl font-bold text-blue-600">{officerComplaints.length}</p>
                          </div>
                          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border-2 border-green-200">
                            <p className="text-sm text-gray-600 mb-1">Resolved</p>
                            <p className="text-3xl font-bold text-green-600">{resolvedCount}</p>
                          </div>
                          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl border-2 border-orange-200">
                            <p className="text-sm text-gray-600 mb-1">In Progress</p>
                            <p className="text-3xl font-bold text-orange-600">{inProgressCount}</p>
                          </div>
                          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border-2 border-purple-200">
                            <p className="text-sm text-gray-600 mb-1">Efficiency</p>
                            <p className="text-3xl font-bold text-purple-600">{efficiency}%</p>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                          <FileText className="w-5 h-5 text-indigo-600" />
                          Assigned Complaints
                        </h3>
                        {officerComplaints.length > 0 ? (
                          <div className="space-y-3">
                            {officerComplaints.map((complaint, idx) => (
                              <div key={idx} className="bg-white p-4 rounded-xl border-2 border-gray-200 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-2">
                                  <h4 className="font-semibold text-gray-800">{complaint.title}</h4>
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    complaint.status === 'Resolved' || complaint.status === 'Closed' ? 'bg-green-100 text-green-700' :
                                    complaint.status === 'In Progress' ? 'bg-orange-100 text-orange-700' :
                                    'bg-gray-100 text-gray-700'
                                  }`}>
                                    {complaint.status}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{complaint.description}</p>
                                <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {complaint.location}
                                  </span>
                                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">{complaint.category}</span>
                                  <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">{complaint.priority}</span>
                                  <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
                                </div>
                                {complaint.citizen && (
                                  <div className="mt-2 pt-2 border-t border-gray-300">
                                    <p className="text-xs text-gray-600">
                                      Filed by: <span className="font-medium text-indigo-600">{complaint.citizen.Name}</span>
                                    </p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 bg-white rounded-xl border-2 border-gray-200">
                            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-600">No complaints assigned yet</p>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })()}

            {state.activeTab === "users" && (() => {
              const citizens = state.citizens.filter(user => 
                user.Name?.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
                user.Email?.toLowerCase().includes(state.searchTerm.toLowerCase())
              );
              const selectedCitizen = state.selectedCitizenId ? citizens.find(c => c._id === state.selectedCitizenId) : null;
              const citizenComplaints = selectedCitizen ? complaints.filter(c => c.citizen?._id === selectedCitizen._id) : [];
              const resolvedCount = citizenComplaints.filter(c => c.status === 'Resolved').length;
              const pendingCount = citizenComplaints.filter(c => c.status === 'Submitted').length;
              const inProgressCount = citizenComplaints.filter(c => c.status === 'In Progress').length;
              
              return (
                <div className="space-y-6">
                  {!selectedCitizen && !state.showAddUserForm ? (
                    // Citizens List View
                    <>
                      <div className="flex justify-between items-center flex-wrap gap-4 mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">User & Role Management</h2>
                        <div className="flex gap-3 flex-wrap">
                          <input 
                            type="text" 
                            placeholder="Search..." 
                            value={state.searchTerm} 
                            onChange={(e) => updateState({ searchTerm: e.target.value })} 
                            className="px-4 py-2 border-2 border-gray-300 rounded-lg text-sm"
                          />
                          <button 
                            onClick={() => updateState({ showAddUserForm: true })}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                          >
                            <UserPlus className="w-4 h-4" />
                            <span>Add User</span>
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        {citizens.map((user, i) => (
                          <div key={i} className="bg-white p-5 rounded-xl border-2 border-gray-200 hover:shadow-lg transition-shadow flex justify-between items-center">
                            <div className="flex items-center gap-4">
                              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-400 to-green-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
                                {user.Name?.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold text-lg text-gray-800">{user.Name}</p>
                                <p className="text-sm text-gray-600">{user.Email}</p>
                                <span className="inline-block mt-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                  Citizen
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => updateState({ selectedCitizenId: user._id })}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="View Details"
                              >
                                <Eye className="w-5 h-5" />
                              </button>
                              <button 
                                onClick={() => alert(`Lock/Unlock ${user.Name}`)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Lock/Unlock User"
                              >
                                <Lock className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {citizens.length === 0 && (
                        <div className="text-center py-16 bg-white rounded-xl border-2 border-gray-200">
                          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <p className="text-lg font-medium text-gray-600">No citizens found</p>
                          <p className="text-sm text-gray-500 mt-2">Try adjusting your search or add new users</p>
                        </div>
                      )}
                    </>
                  ) : state.showAddUserForm ? (
                    <>
                      <button onClick={() => updateState({ showAddUserForm: false, newUserData: { Name: '', Email: '', Password: '' } })} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        Back to Citizens
                      </button>
                      
                      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 sm:p-6 rounded-xl mb-6">
                        <h2 className="text-2xl sm:text-3xl font-bold">Add New Citizen</h2>
                        <p className="text-white text-sm sm:text-base mt-1">Create a new citizen account</p>
                      </div>
                      
                      <div className="bg-white p-6 rounded-xl border-2 border-gray-200 space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                          <input
                            type="text"
                            value={state.newUserData.Name}
                            onChange={(e) => updateState({ 
                              newUserData: { ...state.newUserData, Name: e.target.value }
                            })}
                            placeholder="Enter citizen's full name"
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-base"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                          <input
                            type="email"
                            value={state.newUserData.Email}
                            onChange={(e) => updateState({ 
                              newUserData: { ...state.newUserData, Email: e.target.value }
                            })}
                            placeholder="Enter citizen's email address"
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-base"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                          <input
                            type="password"
                            value={state.newUserData.Password}
                            onChange={(e) => updateState({ 
                              newUserData: { ...state.newUserData, Password: e.target.value }
                            })}
                            placeholder="Create a password"
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-base"
                          />
                        </div>
                        
                        <div className="flex gap-3 pt-4">
                          <button
                            onClick={actions.addCitizen}
                            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-base"
                          >
                            Create Citizen Account
                          </button>
                          <button
                            onClick={() => updateState({ 
                              showAddUserForm: false,
                              newUserData: { Name: '', Email: '', Password: '' }
                            })}
                            className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium text-base"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    // Citizen Details View
                    <>
                      <button onClick={() => updateState({ selectedCitizenId: null })} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        Back to Citizens
                      </button>
                      
                      {/* Citizen Header */}
                      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 sm:p-6 rounded-xl">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white text-blue-600 flex items-center justify-center font-bold text-2xl sm:text-3xl shadow-lg flex-shrink-0">
                            {selectedCitizen.Name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold truncate">{selectedCitizen.Name}</h2>
                            <p className="text-white text-sm sm:text-base truncate">{selectedCitizen.Email}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Statistics */}
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                          <BarChart3 className="w-5 h-5 text-blue-600" />
                          Complaint Statistics
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border-2 border-blue-200">
                            <p className="text-sm text-gray-600 mb-1">Total</p>
                            <p className="text-3xl font-bold text-blue-600">{citizenComplaints.length}</p>
                          </div>
                          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border-2 border-green-200">
                            <p className="text-sm text-gray-600 mb-1">Resolved</p>
                            <p className="text-3xl font-bold text-green-600">{resolvedCount}</p>
                          </div>
                          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl border-2 border-orange-200">
                            <p className="text-sm text-gray-600 mb-1">In Progress</p>
                            <p className="text-3xl font-bold text-orange-600">{inProgressCount}</p>
                          </div>
                          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border-2 border-gray-200">
                            <p className="text-sm text-gray-600 mb-1">Pending</p>
                            <p className="text-3xl font-bold text-gray-600">{pendingCount}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Complaint History */}
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                          <FileText className="w-5 h-5 text-blue-600" />
                          Complaint History
                        </h3>
                        {citizenComplaints.length > 0 ? (
                          <div className="space-y-3">
                            {citizenComplaints.map((complaint, idx) => (
                              <div key={idx} className="bg-white p-4 rounded-xl border-2 border-gray-200 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-2">
                                  <h4 className="font-semibold text-gray-800">{complaint.title}</h4>
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    complaint.status === 'Resolved' ? 'bg-green-100 text-green-700' :
                                    complaint.status === 'In Progress' ? 'bg-orange-100 text-orange-700' :
                                    'bg-gray-100 text-gray-700'
                                  }`}>
                                    {complaint.status}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{complaint.description}</p>
                                <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {complaint.location}
                                  </span>
                                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">{complaint.category}</span>
                                  <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">{complaint.priority}</span>
                                  <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
                                </div>
                                {complaint.assignedOfficer && (
                                  <div className="mt-2 pt-2 border-t border-gray-300">
                                    <p className="text-xs text-gray-600">
                                      Assigned to: <span className="font-medium text-blue-600">{complaint.assignedOfficer.Name}</span>
                                    </p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 bg-white rounded-xl border-2 border-gray-200">
                            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-600">No complaints filed yet</p>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })()}

            {state.activeTab === "complaints" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center flex-wrap gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">Complaint Management & Tracking</h2>
                    {state.categoryFilter !== 'all' && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-sm text-gray-600">Filtered by:</span>
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium flex items-center gap-2">
                          {state.categoryFilter}
                          <button onClick={() => updateState({ categoryFilter: 'all' })} className="hover:bg-purple-200 rounded-full p-0.5">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-3 flex-wrap">
                    <input type="text" placeholder="Search complaints..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="px-4 py-2 border-2 border-gray-300 rounded-lg" />
                    <select value={state.categoryFilter} onChange={(e) => updateState({ categoryFilter: e.target.value })} className="px-4 py-2 border-2 border-gray-300 rounded-lg">
                      <option value="all">All Categories</option>
                      {categoryStats.map(cat => <option key={cat.category} value={cat.category}>{cat.category}</option>)}
                    </select>
                    <select value={state.filterStatus} onChange={(e) => updateState({ filterStatus: e.target.value })} className="px-4 py-2 border-2 border-gray-300 rounded-lg">
                      <option value="all">All Status</option>
                      <option value="Submitted">Submitted</option>
                      <option value="Assigned">Assigned</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                    <select onChange={(e) => updateState({ officerFilter: e.target.value })} className="px-4 py-2 border-2 border-gray-300 rounded-lg bg-blue-50">
                      <option value="all">All Assignments</option>
                      <option value="assigned">✓ Assigned</option>
                      <option value="unassigned">✗ Unassigned</option>
                    </select>
                    <button onClick={actions.export} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"><Download className="w-4 h-4 inline mr-2" />Export</button>
                  </div>
                </div>
                
                {/* Complaint Cards View - Interactive like Citizen Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredComplaints.slice(0, state.complaintsPerPage).map((c, i) => (
                    <div 
                      key={c._id || i} 
                      className="bg-white rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:shadow-xl transition-all p-5 cursor-pointer dashboard-card" 
                      onClick={() => updateState({ 
                        selectedComplaint: c,
                        showUserProfile: false,
                        showNotifications: false 
                      })}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${c.status === 'Resolved' ? 'bg-green-500' : c.status === 'In Progress' ? 'bg-blue-500 animate-pulse' : 'bg-yellow-500'}`}></div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${c.status === 'Resolved' ? 'bg-green-100 text-green-700' : c.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>{c.status}</span>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${c.priority === 'High' || c.priority === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>{c.priority || 'Normal'}</span>
                      </div>
                      
                      <h3 className="font-bold text-gray-800 text-lg mb-2 line-clamp-2">{c.title}</h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{c.description}</p>
                      
                      <div className="space-y-2 mb-3">
                        <div className="flex items-center gap-2 text-sm"><span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">{c.category}</span><MapPin className="w-4 h-4 text-gray-500" /><span className="text-gray-600 text-xs truncate">{c.location || c.ward || 'N/A'}</span></div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center gap-1"><Users className="w-4 h-4" /><span>By: {c.citizen?.Name || 'Anonymous'}</span></div>
                          <div className="flex items-center gap-1"><Clock className="w-4 h-4" /><span>{new Date(c.createdAt).toLocaleDateString()}</span></div>
                        </div>
                      </div>
                      
                      {/* Officer Assignment Display */}
                      {c.assignedOfficer ? (
                        <div className="flex items-center gap-2 p-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg mb-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                            {c.assignedOfficer.Name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-blue-600 font-semibold uppercase tracking-wide">Assigned Officer</p>
                            <p className="text-sm font-bold text-gray-800 truncate">{c.assignedOfficer.Name}</p>
                            <p className="text-[10px] text-gray-500 truncate">{c.assignedOfficer.Email}</p>
                          </div>
                          <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                            <UserCog className="w-4 h-4 text-green-600" />
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 p-2.5 bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-lg mb-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-white flex items-center justify-center shadow-md">
                            <AlertTriangle className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-orange-600 font-semibold uppercase tracking-wide">Unassigned</p>
                            <p className="text-sm font-bold text-gray-800">No Officer Assigned</p>
                            <p className="text-[10px] text-gray-500">Awaiting assignment</p>
                          </div>
                        </div>
                      )}
                      
                      {c.image && <div className="mb-3"><LazyImage src={`http://localhost:4000${c.image}`} alt="Complaint" className="w-full h-40 object-cover rounded-lg" loading="lazy" /></div>}
                      
                      <div className="flex gap-2 pt-3 border-t">
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            updateState({ 
                              selectedComplaint: c,
                              showUserProfile: false,
                              showNotifications: false 
                            }); 
                          }} 
                          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                        >
                          <Eye className="w-4 h-4" />View Details
                        </button>
                        {/* Admin-only actions */}
                        {state.currentUser.Role === 'admin' && (
                          <>
                            <button 
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                actions.reassignComplaint(c);
                              }} 
                              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                              title="Reassign complaint"
                            >
                              <UserCog className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                actions.editComplaint(c);
                              }} 
                              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                              title="Edit complaint"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Load More Button */}
                {(() => {
                  const hasMore = filteredComplaints.length > state.complaintsPerPage;
                  return hasMore && (
                    <div className="flex justify-center mt-6">
                      <button 
                        onClick={() => updateState({ complaintsPerPage: state.complaintsPerPage + 12 })}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2 transition-all"
                      >
                        <Download className="w-5 h-5" />
                        Load More Complaints ({filteredComplaints.length - state.complaintsPerPage} remaining)
                      </button>
                    </div>
                  );
                })()}
                
                {/* Show message if no complaints */}
                {filteredComplaints.length === 0 && (
                  <div className="text-center py-16 bg-white rounded-xl border-2 border-gray-200"><FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" /><p className="text-lg font-medium text-gray-600">No complaints found</p><p className="text-sm text-gray-500 mt-2">Try adjusting your filters or search terms</p></div>
                )}
              </div>
            )}

            {state.activeTab === "geospatial" && (
              <div className="space-y-6">
                <h2>Geo-Based Heatmap Visualization</h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">{wardStats.map((w, i) => <div key={i} className="bg-white p-4 rounded-xl border-2 border-gray-200"><div className="flex justify-between mb-2"><h4 className="font-semibold">{w.ward}</h4><MapPin className="w-5 h-5 text-blue-600" /></div><p className="text-3xl font-bold text-blue-600">{w.complaints}</p><p className="text-sm text-gray-600">{w.pending} pending</p></div>)}</div>
                <div className="bg-white p-6 rounded-xl border-2 border-gray-200"><h3 className="font-semibold mb-4">Interactive Heatmap</h3><div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg flex items-center justify-center" style={{ height: "400px" }}><div className="text-center"><MapIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" /><p className="text-gray-600 font-medium">Google Maps/Mapbox Integration</p><button className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg">Configure Map API</button></div></div></div>
              </div>
            )}

            {state.activeTab === "audit" && (
              <div className="space-y-6">
                <h2>Security Monitoring & Audit Logs</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[{ label: 'Total Actions', value: auditLogs.length, icon: History }, { label: 'Status Changes', value: auditLogs.filter(l => l.action.includes('Status')).length, icon: RefreshCw }].map((s, i) => { const Icon = s.icon; return <div key={i} className="bg-white p-4 rounded-xl border-2 border-gray-200"><Icon className="w-5 h-5 text-blue-600 mb-2" /><p className="text-3xl font-bold">{s.value}</p><p className="text-sm text-gray-600">{s.label}</p></div>; })}</div>
                <div className="bg-white p-6 rounded-xl border-2 border-gray-200"><h3 className="font-semibold mb-4">Activity Log</h3><div className="space-y-2">{auditLogs.map((log, i) => <div key={i} className="p-3 bg-gray-50 rounded-lg flex justify-between"><div><p className="text-sm font-medium">{log.action}</p><p className="text-xs text-gray-600">{log.user} - {log.target}</p></div><p className="text-xs text-gray-500">{log.timestamp}</p></div>)}</div></div>
              </div>
            )}

            {state.activeTab === "communications" && (
              <div className="space-y-6">
                <h2>Broadcast Messaging System</h2>
                <div className="bg-white p-6 rounded-xl border-2 border-gray-200"><h3 className="font-semibold mb-4 flex items-center gap-2"><Megaphone className="w-5 h-5 text-blue-600" />Emergency Announcements</h3><textarea value={state.announcementText} onChange={(e) => updateState({ announcementText: e.target.value })} placeholder="Type announcement..." className="w-full p-4 border rounded-lg resize-none" rows="4"></textarea><div className="flex gap-3 mt-4"><button onClick={actions.broadcast} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><Send className="w-4 h-4 inline mr-2" />Broadcast to All</button><button className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"><AlertOctagon className="w-4 h-4 inline mr-2" />Emergency Alert</button></div></div>
              </div>
            )}

            {state.activeTab === "reports" && (
              <div className="space-y-6">
                <h2>Reports & Data Export</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[{ label: 'PDF Report', icon: FileText, color: 'red' }, { label: 'CSV Export', icon: FileSpreadsheet, color: 'green' }, { label: 'Analytics', icon: BarChart3, color: 'purple' }, { label: 'Audit Trail', icon: History, color: 'orange' }].map((r, i) => { const Icon = r.icon; return <button key={i} onClick={actions.export} className={`p-6 bg-${r.color}-50 border-2 border-${r.color}-200 rounded-xl hover:shadow-lg text-left`}><Icon className={`w-8 h-8 text-${r.color}-600 mb-3`} /><h3 className="font-semibold">{r.label}</h3></button>; })}</div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Add Citizen Modal */}
      {state.showAddUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
            <button 
              onClick={() => updateState({ showAddUserModal: false })}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Add New Citizen</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={state.newUserData.Name}
                  onChange={(e) => updateState({ 
                    newUserData: { ...state.newUserData, Name: e.target.value }
                  })}
                  placeholder="Enter full name"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={state.newUserData.Email}
                  onChange={(e) => updateState({ 
                    newUserData: { ...state.newUserData, Email: e.target.value }
                  })}
                  placeholder="Enter email address"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  value={state.newUserData.Password}
                  onChange={(e) => updateState({ 
                    newUserData: { ...state.newUserData, Password: e.target.value }
                  })}
                  placeholder="Enter password"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={actions.addCitizen}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Add Citizen
                </button>
                <button
                  onClick={() => updateState({ 
                    showAddUserModal: false,
                    newUserData: { Name: '', Email: '', Password: '' }
                  })}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Popup with Blur Backdrop */}
      <ProfilePopup 
        user={state.currentUser}
        isOpen={state.showUserProfile}
        onClose={() => updateState({ showUserProfile: false })}
      />

      {/* Notification Popup with Blur Backdrop */}
      <NotificationPopup 
        notifications={slaBreaches}
        isOpen={state.showNotifications}
        onClose={() => updateState({ showNotifications: false })}
        onClearAll={() => {
          // Clear all notifications logic
          console.log('Clear all notifications');
          updateState({ showNotifications: false });
        }}
        onMarkAsRead={(notification) => {
          // Mark as read logic
          console.log('Mark as read:', notification);
        }}
      />

      {/* Complaint Details Popup with Blur Backdrop */}
      <ComplaintDetailsPopup 
        complaint={state.selectedComplaint}
        isOpen={!!state.selectedComplaint}
        onClose={() => updateState({ selectedComplaint: null })}
        onEdit={actions.editComplaint}
        onReassign={actions.reassignComplaint}
        onDelete={actions.deleteComplaint}
        isAdmin={state.currentUser.Role === 'admin'}
      />

      {/* Reassign Modal - Only for admins */}
      {state.currentUser.Role === 'admin' && (
        <ReassignModal 
          isOpen={state.showReassignModal}
          onClose={() => updateState({ showReassignModal: false, reassignComplaintId: null })}
          complaint={state.complaints.find(c => c._id === state.reassignComplaintId)}
          officers={state.officers}
          onReassign={actions.performReassign}
        />
      )}

      {/* Edit Complaint Modal - Only for admins */}
      {state.currentUser.Role === 'admin' && (
        <EditComplaintModal 
          isOpen={state.showEditModal}
          onClose={() => updateState({ showEditModal: false, editingComplaint: null })}
          complaint={state.editingComplaint}
          onSave={actions.performEdit}
        />
      )}

      {/* Delete Confirm Modal - Only for admins */}
      {state.currentUser.Role === 'admin' && (
        <DeleteConfirmModal 
          isOpen={state.showDeleteModal}
          onClose={() => updateState({ showDeleteModal: false, deletingComplaint: null, isDeleting: false })}
          onConfirm={actions.performDelete}
          complaint={state.deletingComplaint}
          isDeleting={state.isDeleting}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
