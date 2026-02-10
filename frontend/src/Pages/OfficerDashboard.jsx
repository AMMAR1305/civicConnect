import { useEffect, useState } from "react";
import api from "../Services/api";
import { useNavigate } from "react-router-dom";
import { 
  Search, Filter, LogOut, Clock, AlertTriangle, CheckCircle, FileText,
  TrendingUp, BarChart3, Users, Calendar, MapPin, Eye, 
  RefreshCw, Download, ChevronDown, User, Settings, X
} from "lucide-react";

const OfficerDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [viewMode, setViewMode] = useState("table"); // 'table' or 'grid'
  const [sortBy, setSortBy] = useState("newest"); // 'newest', 'oldest', 'priority', 'sla'
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await api.get("/complaints/getcomplaints", {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Sort by createdAt in descending order (LIFO - newest first)
        const sortedComplaints = res.data.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        setComplaints(sortedComplaints);
        setFilteredComplaints(sortedComplaints);
      } catch (err) {
        console.error("Failed to load complaints:", err);
        alert("Failed to load complaints");
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

  useEffect(() => {
    let filtered = [...complaints];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(c => 
        c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "All") {
      filtered = filtered.filter(c => c.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== "All") {
      filtered = filtered.filter(c => c.priority === priorityFilter);
    }

    // Category filter
    if (categoryFilter !== "All") {
      filtered = filtered.filter(c => c.category === categoryFilter);
    }

    // Sorting
    if (sortBy === "newest") {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === "oldest") {
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortBy === "priority") {
      const priorityOrder = { "Critical": 0, "High": 1, "Medium": 2, "Low": 3 };
      filtered.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    } else if (sortBy === "sla") {
      filtered.sort((a, b) => new Date(a.slaDeadline) - new Date(b.slaDeadline));
    }

    setFilteredComplaints(filtered);
  }, [searchTerm, statusFilter, priorityFilter, categoryFilter, complaints, sortBy]);

  const getStats = () => {
    return {
      total: complaints.length,
      submitted: complaints.filter(c => c.status === "Submitted").length,
      inProgress: complaints.filter(c => c.status === "In Progress").length,
      resolved: complaints.filter(c => c.status === "Resolved").length,
      escalated: complaints.filter(c => c.status === "Escalated").length,
      highPriority: complaints.filter(c => c.priority === "High" || c.priority === "Critical").length,
    };
  };

  const getSLAStatus = (slaDeadline) => {
    const diff = new Date(slaDeadline) - new Date();
    if (diff <= 0) return { text: "BREACHED", color: "text-red-600", bgColor: "bg-red-100" };
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours <= 24) return { text: `${hours}h left`, color: "text-orange-600", bgColor: "bg-orange-100" };
    return { text: `${hours}h left`, color: "text-green-600", bgColor: "bg-green-100" };
  };

  const getStatusColor = (status) => {
    const colors = {
      "Submitted": "bg-yellow-100 text-yellow-700",
      "In Progress": "bg-blue-100 text-blue-700",
      "Resolved": "bg-green-100 text-green-700",
      "Escalated": "bg-red-100 text-red-700"
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  const getPriorityColor = (priority) => {
    const colors = {
      "Critical": "bg-red-500 text-white",
      "High": "bg-orange-500 text-white",
      "Medium": "bg-yellow-500 text-white",
      "Low": "bg-blue-500 text-white"
    };
    return colors[priority] || "bg-gray-500 text-white";
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setPriorityFilter("All");
    setCategoryFilter("All");
  };

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  const stats = getStats();
  const categories = [...new Set(complaints.map(c => c.category))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-900 font-semibold text-lg">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-orange-50 py-3 sm:py-6 px-3 sm:px-4">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">
              Officer Dashboard
            </h1>
            <p className="text-gray-600 text-xs sm:text-sm md:text-base mt-1 hidden sm:block">Manage and track complaints efficiently</p>
          </div>
          
          {/* Mobile Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="flex items-center gap-2 bg-white text-gray-700 px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg font-semibold transition-all shadow-lg border-2 border-gray-200"
            >
              <Settings size={18} className="sm:hidden" />
              <span className="hidden sm:inline">Menu</span>
              <ChevronDown size={16} className={`transition-transform ${showMobileMenu ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Dropdown Menu */}
            {showMobileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-2xl border-2 border-gray-200 z-50">
                <button
                  onClick={() => { navigate("/officer/profile"); setShowMobileMenu(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-left border-b border-gray-100"
                >
                  <User size={18} className="text-blue-600" />
                  <span className="font-medium text-gray-700">Profile</span>
                </button>
                <button
                  onClick={() => { window.location.reload(); }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-left border-b border-gray-100"
                >
                  <RefreshCw size={18} className="text-blue-600" />
                  <span className="font-medium text-gray-700">Refresh</span>
                </button>
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-left rounded-b-lg"
                >
                  <LogOut size={18} className="text-red-600" />
                  <span className="font-medium text-red-600">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6 md:mb-8">
          <div className="bg-white rounded-lg sm:rounded-xl shadow-lg sm:shadow-xl p-3 sm:p-5 border-t-4 border-blue-500 hover:shadow-2xl transition-all">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-blue-500 rounded-lg flex items-center justify-center shadow-md">
                <FileText className="text-white" size={16} />
              </div>
              <BarChart3 className="text-blue-300 hidden sm:block" size={18} />
            </div>
            <p className="text-xl sm:text-3xl font-bold text-gray-800 mb-0.5 sm:mb-1">{stats.total}</p>
            <p className="text-[10px] sm:text-sm text-gray-600 font-medium">Total</p>
          </div>

          <div className="bg-white rounded-lg sm:rounded-xl shadow-lg sm:shadow-xl p-3 sm:p-5 border-t-4 border-yellow-500 hover:shadow-2xl transition-all">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-yellow-500 rounded-lg flex items-center justify-center shadow-md">
                <Clock className="text-white" size={16} />
              </div>
              <TrendingUp className="text-yellow-300 hidden sm:block" size={18} />
            </div>
            <p className="text-xl sm:text-3xl font-bold text-gray-800 mb-0.5 sm:mb-1">{stats.submitted}</p>
            <p className="text-[10px] sm:text-sm text-gray-600 font-medium">Submitted</p>
          </div>

          <div className="bg-white rounded-lg sm:rounded-xl shadow-lg sm:shadow-xl p-3 sm:p-5 border-t-4 border-blue-600 hover:shadow-2xl transition-all">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
                <RefreshCw className="text-white" size={16} />
              </div>
              <TrendingUp className="text-blue-300 hidden sm:block" size={18} />
            </div>
            <p className="text-xl sm:text-3xl font-bold text-gray-800 mb-0.5 sm:mb-1">{stats.inProgress}</p>
            <p className="text-[10px] sm:text-sm text-gray-600 font-medium">In Progress</p>
          </div>

          <div className="bg-white rounded-lg sm:rounded-xl shadow-lg sm:shadow-xl p-3 sm:p-5 border-t-4 border-green-500 hover:shadow-2xl transition-all">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-green-500 rounded-lg flex items-center justify-center shadow-md">
                <CheckCircle className="text-white" size={16} />
              </div>
              <TrendingUp className="text-green-300 hidden sm:block" size={18} />
            </div>
            <p className="text-xl sm:text-3xl font-bold text-gray-800 mb-0.5 sm:mb-1">{stats.resolved}</p>
            <p className="text-[10px] sm:text-sm text-gray-600 font-medium">Resolved</p>
          </div>

          <div className="bg-white rounded-lg sm:rounded-xl shadow-lg sm:shadow-xl p-3 sm:p-5 border-t-4 border-red-500 hover:shadow-2xl transition-all">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-red-500 rounded-lg flex items-center justify-center shadow-md">
                <AlertTriangle className="text-white" size={16} />
              </div>
              <TrendingUp className="text-red-300 hidden sm:block" size={18} />
            </div>
            <p className="text-xl sm:text-3xl font-bold text-gray-800 mb-0.5 sm:mb-1">{stats.escalated}</p>
            <p className="text-[10px] sm:text-sm text-gray-600 font-medium">Escalated</p>
          </div>

          <div className="bg-white rounded-lg sm:rounded-xl shadow-lg sm:shadow-xl p-3 sm:p-5 border-t-4 border-orange-500 hover:shadow-2xl transition-all">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-orange-500 rounded-lg flex items-center justify-center shadow-md">
                <AlertTriangle className="text-white" size={16} />
              </div>
              <TrendingUp className="text-orange-300 hidden sm:block" size={18} />
            </div>
            <p className="text-xl sm:text-3xl font-bold text-gray-800 mb-0.5 sm:mb-1">{stats.highPriority}</p>
            <p className="text-[10px] sm:text-sm text-gray-600 font-medium">High Priority</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-lg sm:shadow-xl p-4 sm:p-6 mb-4 sm:mb-6 border-t-4 border-blue-500">
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-600 to-orange-500 rounded-lg flex items-center justify-center">
                <Filter className="text-white" size={18} />
              </div>
              <h2 className="text-base sm:text-xl md:text-2xl font-bold text-gray-800">Filters</h2>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-lg font-semibold transition-all text-sm"
            >
              <span className="hidden sm:inline">{showFilters ? 'Hide' : 'Show'}</span>
              <ChevronDown size={16} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
              {/* Search */}
              <div className="sm:col-span-2">
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2 flex items-center gap-2">
                  <Search size={14} />
                  Search
                </label>
                <input
                  type="text"
                  placeholder="Search complaints..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 sm:px-4 sm:py-2.5 focus:ring-2 
                    focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                />
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 sm:px-4 sm:py-2.5 focus:ring-2 
                    focus:ring-blue-500 focus:border-blue-500 transition-all text-sm appearance-none cursor-pointer"
                >
                <option value="All">All Status</option>
                <option value="Submitted">Submitted</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Escalated">Escalated</option>
              </select>
            </div>

              {/* Priority Filter */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">Priority</label>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 sm:px-4 sm:py-2.5 focus:ring-2 
                    focus:ring-blue-500 focus:border-blue-500 transition-all text-sm appearance-none cursor-pointer"
                >
                  <option value="All">All Priority</option>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 sm:px-4 sm:py-2.5 focus:ring-2 
                    focus:ring-blue-500 focus:border-blue-500 transition-all text-sm appearance-none cursor-pointer"
                >
                  <option value="All">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 sm:px-4 sm:py-2.5 focus:ring-2 
                    focus:ring-blue-500 focus:border-blue-500 transition-all text-sm appearance-none cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="priority">By Priority</option>
                  <option value="sla">By SLA Deadline</option>
                </select>
              </div>
            </div>
          )}

          {/* Clear Filters Button */}
          {(searchTerm || statusFilter !== "All" || priorityFilter !== "All" || categoryFilter !== "All") && (
            <div className="mt-4 sm:mt-5 pt-4 sm:pt-5 border-t border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <button
                onClick={clearFilters}
                className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-2"
              >
                <X size={14} />
                Clear all filters
              </button>
              <span className="text-xs sm:text-sm text-gray-600 bg-blue-50 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-semibold">
                Showing <span className="text-blue-600">{filteredComplaints.length}</span> of <span className="text-blue-600">{complaints.length}</span>
              </span>
            </div>
          )}
        </div>

        {/* Complaints List */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-lg sm:shadow-xl overflow-hidden border-t-4 border-orange-500">
          <div className="p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-orange-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-600 to-orange-500 rounded-lg flex items-center justify-center">
                  <FileText className="text-white" size={18} />
                </div>
                <div>
                  <h2 className="text-base sm:text-xl md:text-2xl font-bold text-gray-800">Complaints</h2>
                  <p className="text-xs sm:text-sm text-gray-600">{filteredComplaints.length} found</p>
                </div>
              </div>
              <button className="hidden sm:flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-semibold transition-all shadow-md border border-gray-200 text-sm">
                <Download size={16} />
                <span className="hidden md:inline">Export</span>
              </button>
            </div>
          </div>
          
          {/* Mobile Card View */}
          <div className="block lg:hidden">
            {filteredComplaints.length > 0 ? (
              filteredComplaints.map((c, index) => {
                const sla = getSLAStatus(c.slaDeadline);
                return (
                  <div key={c._id} className="p-4 border-b border-gray-200 hover:bg-blue-50 transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                          <span className="text-white text-xs font-bold">#{index + 1}</span>
                        </div>
                        <span className="font-mono text-[10px] font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded">
                          {c._id.slice(-6).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${getPriorityColor(c.priority)}`}>
                          {c.priority}
                        </span>
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-semibold ${sla.color} ${sla.bgColor}`}>
                          {sla.text}
                        </span>
                      </div>
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 mb-1 text-sm">{c.title}</h3>
                    <p className="text-xs text-gray-600 flex items-center gap-1 mb-2">
                      <MapPin size={10} />
                      {c.address}
                    </p>
                    
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span className="text-xs font-medium text-gray-800 bg-gray-100 px-2 py-1 rounded-full">
                        {c.category}
                      </span>
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-semibold ${getStatusColor(c.status)}`}>
                        {c.status}
                      </span>
                      <span className="text-[10px] text-gray-500 flex items-center gap-1">
                        <Calendar size={10} />
                        {new Date(c.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short'
                        })}
                      </span>
                    </div>
                    
                    <button
                      onClick={() => navigate(`/officer/${c._id}`)}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-orange-500 text-white px-4 py-2 
                        rounded-lg font-semibold hover:from-blue-700 hover:to-orange-600 transition-all shadow-md text-sm"
                    >
                      <Eye size={14} />
                      View Details
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="p-16 text-center">
                <FileText className="mx-auto mb-4 text-gray-300" size={48} />
                <p className="text-lg font-semibold text-gray-500 mb-2">No complaints found</p>
                <p className="text-sm text-gray-400">Try adjusting your filters</p>
              </div>
            )}
          </div>
          
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-600 to-orange-500 text-white">
                <tr>
                  <th className="px-5 py-4 text-left text-sm font-bold uppercase tracking-wider">ID</th>
                  <th className="px-5 py-4 text-left text-sm font-bold uppercase tracking-wider">Complaint Details</th>
                  <th className="px-5 py-4 text-left text-sm font-bold uppercase tracking-wider">Category</th>
                  <th className="px-5 py-4 text-left text-sm font-bold uppercase tracking-wider">Priority</th>
                  <th className="px-5 py-4 text-left text-sm font-bold uppercase tracking-wider">Status</th>
                  <th className="px-5 py-4 text-left text-sm font-bold uppercase tracking-wider">SLA</th>
                  <th className="px-5 py-4 text-left text-sm font-bold uppercase tracking-wider">Date</th>
                  <th className="px-5 py-4 text-center text-sm font-bold uppercase tracking-wider">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {filteredComplaints.length > 0 ? (
                  filteredComplaints.map((c, index) => {
                    const sla = getSLAStatus(c.slaDeadline);
                    return (
                      <tr key={c._id} className={`hover:bg-blue-50 transition-all ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                              <span className="text-white text-xs font-bold">#{index + 1}</span>
                            </div>
                            <span className="font-mono text-xs font-semibold text-gray-700">
                              {c._id.slice(-6).toUpperCase()}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div>
                            <p className="font-semibold text-gray-900 mb-1">{c.title}</p>
                            <p className="text-xs text-gray-600 flex items-center gap-1 truncate max-w-xs">
                              <MapPin size={12} />
                              {c.address}
                            </p>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm font-medium text-gray-800 bg-gray-100 px-3 py-1 rounded-full">
                            {c.category}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm ${getPriorityColor(c.priority)}`}>
                            {c.priority}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${getStatusColor(c.status)}`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${sla.color} ${sla.bgColor} border`}>
                            {sla.text}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1 text-sm text-gray-700">
                            <Calendar size={14} />
                            {new Date(c.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <button
                            onClick={() => navigate(`/officer/${c._id}`)}
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-orange-500 text-white px-4 py-2 
                              rounded-lg font-semibold hover:from-blue-700 hover:to-orange-600 
                              transition-all shadow-md hover:shadow-lg text-sm"
                          >
                            <Eye size={16} />
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8" className="px-5 py-16 text-center">
                      <FileText className="mx-auto mb-4 text-gray-300" size={64} />
                      <p className="text-xl font-semibold text-gray-500 mb-2">No complaints found</p>
                      <p className="text-sm text-gray-400">Try adjusting your filters to see more results</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default OfficerDashboard;
