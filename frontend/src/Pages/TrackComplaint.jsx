import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const TrackComplaint = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [showFilters, setShowFilters] = useState(false); // Mobile filter dropdown

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:4000/complaints/my", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComplaints(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch complaints");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Resolved":
        return "bg-green-100 text-green-700";
      case "In Progress":
        return "bg-yellow-100 text-yellow-700";
      case "Assigned":
        return "bg-blue-100 text-blue-700";
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

  const getSLAStatus = (complaint) => {
    if (!complaint.slaDeadline) return null;
    const deadline = new Date(complaint.slaDeadline);
    const now = new Date();
    const hoursLeft = (deadline - now) / (1000 * 60 * 60);
    
    if (complaint.status === "Resolved" || complaint.status === "Closed") return null;
    
    if (hoursLeft < 0) return { type: "breached", text: "SLA Breached!", color: "bg-red-500 text-white" };
    if (hoursLeft < 4) return { type: "critical", text: `${Math.floor(hoursLeft)}h left`, color: "bg-red-100 text-red-700" };
    if (hoursLeft < 24) return { type: "warning", text: `${Math.floor(hoursLeft)}h left`, color: "bg-yellow-100 text-yellow-700" };
    return { type: "safe", text: `${Math.floor(hoursLeft)}h left`, color: "bg-green-100 text-green-700" };
  };

  const getProgressPercentage = (status) => {
    switch (status) {
      case "Submitted": return 25;
      case "Assigned": return 50;
      case "In Progress": return 75;
      case "Resolved": return 100;
      case "Closed": return 100;
      default: return 0;
    }
  };

  const getTimeline = (complaint) => {
    const timeline = [
      { status: "Submitted", date: complaint.createdAt, active: true },
      { status: "Assigned", date: complaint.assignedAt, active: complaint.assignedOfficer != null },
      { status: "In Progress", date: complaint.inProgressAt, active: complaint.status === "In Progress" || complaint.status === "Resolved" || complaint.status === "Closed" },
      { status: "Resolved", date: complaint.resolvedAt, active: complaint.status === "Resolved" || complaint.status === "Closed" }
    ];
    return timeline;
  };

  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === "Submitted").length,
    inProgress: complaints.filter(c => c.status === "In Progress" || c.status === "Assigned").length,
    resolved: complaints.filter(c => c.status === "Resolved" || c.status === "Closed").length
  };

  // Get unique categories
  const categories = ["all", ...new Set(complaints.map(c => c.category))];

  const filteredAndSortedComplaints = complaints
    .filter(c => filter === "all" || c.status === filter)
    .filter(c => categoryFilter === "all" || c.category === categoryFilter)
    .filter(c => 
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c._id.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "priority":
          const priorityOrder = { Critical: 4, High: 3, Medium: 2, Low: 1 };
          return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
        default:
          return 0;
      }
    });

  const openModal = (complaint) => {
    setSelectedComplaint(complaint);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedComplaint(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/citizen")}
            className="text-blue-700 hover:text-orange-600 font-semibold mb-4 flex items-center gap-2 transition-colors"
          >
            <span>←</span> Back to Dashboard
          </button>
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-blue-900">
                Track Your Complaints
              </h1>
              <p className="text-sm md:text-base text-gray-700 mt-1">
                Monitor status and progress of your service requests
              </p>
            </div>
            <button
              onClick={() => navigate("/create")}
              className="bg-gradient-to-r from-orange-400 to-orange-500 text-white px-6 py-2.5 rounded-lg hover:from-orange-500 hover:to-orange-600 font-semibold transition-all duration-300 shadow-md w-full md:w-auto"
            >
              + New Complaint
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
          <div className="bg-white p-3 md:p-4 rounded-xl shadow-lg border-t-4 border-blue-500 hover:shadow-xl transition-shadow">
            <p className="text-blue-900 text-xs md:text-sm font-semibold">Total</p>
            <p className="text-xl md:text-2xl font-bold text-blue-600">{stats.total}</p>
          </div>
          <div className="bg-white p-3 md:p-4 rounded-xl shadow-lg border-t-4 border-orange-400 hover:shadow-xl transition-shadow">
            <p className="text-blue-900 text-xs md:text-sm font-semibold">Pending</p>
            <p className="text-xl md:text-2xl font-bold text-orange-600">{stats.pending}</p>
          </div>
          <div className="bg-white p-3 md:p-4 rounded-xl shadow-lg border-t-4 border-blue-400 hover:shadow-xl transition-shadow">
            <p className="text-blue-900 text-xs md:text-sm font-semibold">In Progress</p>
            <p className="text-xl md:text-2xl font-bold text-blue-600">{stats.inProgress}</p>
          </div>
          <div className="bg-white p-3 md:p-4 rounded-xl shadow-lg border-t-4 border-green-500 hover:shadow-xl transition-shadow">
            <p className="text-blue-900 text-xs md:text-sm font-semibold">Resolved</p>
            <p className="text-xl md:text-2xl font-bold text-green-600">{stats.resolved}</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-lg border-t-4 border-orange-400 mb-6">
          {/* Mobile: Show/Hide Filters Button */}
          <div className="lg:hidden p-4 border-b border-gray-200">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-semibold shadow-md"
            >
              <span className="flex items-center gap-2">
                🔍 Filters & Search
                {(filter !== "all" || categoryFilter !== "all" || searchTerm) && (
                  <span className="bg-white text-blue-600 text-xs font-bold px-2 py-1 rounded-full">
                    Active
                  </span>
                )}
              </span>
              <span className={`text-2xl transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>
          </div>

          {/* Filters Content */}
          <div className={`p-4 ${showFilters ? 'block' : 'hidden'} lg:block`}>
            <div className="flex flex-col gap-4">
              {/* Search Bar */}
              <div className="w-full">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="🔍 Search by ID, title, category, or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2.5 pr-10 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-sm md:text-base"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xl"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
              
              {/* Filters Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:flex lg:flex-wrap gap-3">
                {/* Status Filter */}
                <div className="w-full lg:w-auto">
                  <label className="block text-xs font-semibold text-gray-600 mb-1 lg:hidden">Status</label>
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-semibold text-blue-900 bg-white text-sm md:text-base"
                  >
                    <option value="all">📋 All Status</option>
                    <option value="Submitted">📝 Submitted</option>
                    <option value="Assigned">👤 Assigned</option>
                    <option value="In Progress">⚙️ In Progress</option>
                    <option value="Resolved">✅ Resolved</option>
                    <option value="Closed">🔒 Closed</option>
                  </select>
                </div>
                
                {/* Category Filter */}
                <div className="w-full lg:w-auto">
                  <label className="block text-xs font-semibold text-gray-600 mb-1 lg:hidden">Category</label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-semibold text-blue-900 bg-white text-sm md:text-base"
                  >
                    <option value="all">🏷️ All Categories</option>
                    {categories.filter(c => c !== "all").map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                
                {/* Sort */}
                <div className="w-full lg:w-auto">
                  <label className="block text-xs font-semibold text-gray-600 mb-1 lg:hidden">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-semibold text-blue-900 bg-white text-sm md:text-base"
                  >
                    <option value="newest">🕐 Newest First</option>
                    <option value="oldest">🕑 Oldest First</option>
                    <option value="priority">⚡ High Priority</option>
                  </select>
                </div>
                
                {/* View Mode Toggle */}
                <div className="w-full lg:w-auto">
                  <label className="block text-xs font-semibold text-gray-600 mb-1 lg:hidden">View Mode</label>
                  <div className="flex border-2 border-gray-300 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`flex-1 lg:flex-none px-4 py-2 font-semibold transition-colors text-sm md:text-base ${
                        viewMode === "grid" 
                          ? "bg-blue-600 text-white" 
                          : "bg-white text-gray-600 hover:bg-gray-50"
                      }`}
                      title="Grid View"
                    >
                      ⊞ Grid
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`flex-1 lg:flex-none px-4 py-2 font-semibold transition-colors border-l-2 text-sm md:text-base ${
                        viewMode === "list" 
                          ? "bg-blue-600 text-white" 
                          : "bg-white text-gray-600 hover:bg-gray-50"
                      }`}
                      title="List View"
                    >
                      ☰ List
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Active Filters Display */}
            {(filter !== "all" || categoryFilter !== "all" || searchTerm) && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-xs md:text-sm font-semibold text-gray-600 w-full md:w-auto mb-1 md:mb-0">Active Filters:</span>
                  {filter !== "all" && (
                    <span className="px-2 md:px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs md:text-sm font-medium flex items-center gap-2">
                      Status: {filter}
                      <button onClick={() => setFilter("all")} className="hover:text-blue-900 text-base">✕</button>
                    </span>
                  )}
                  {categoryFilter !== "all" && (
                    <span className="px-2 md:px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs md:text-sm font-medium flex items-center gap-2">
                      Category: {categoryFilter}
                      <button onClick={() => setCategoryFilter("all")} className="hover:text-green-900 text-base">✕</button>
                    </span>
                  )}
                  {searchTerm && (
                    <span className="px-2 md:px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs md:text-sm font-medium flex items-center gap-2">
                      Search: "{searchTerm.substring(0, 20)}{searchTerm.length > 20 ? '...' : ''}"
                      <button onClick={() => setSearchTerm("")} className="hover:text-purple-900 text-base">✕</button>
                    </span>
                  )}
                  <button
                    onClick={() => {
                      setFilter("all");
                      setCategoryFilter("all");
                      setSearchTerm("");
                    }}
                    className="text-xs md:text-sm text-red-600 hover:text-red-800 font-semibold px-3 py-1 bg-red-50 rounded-lg"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-pulse">
              <div className="h-8 bg-slate-200 rounded w-1/4 mx-auto mb-4"></div>
              <p className="text-slate-500">Loading complaints...</p>
            </div>
          </div>
        ) : filteredAndSortedComplaints.length === 0 ? (
          <div className="bg-white p-12 rounded-xl shadow text-center">
            <p className="text-slate-500 mb-4">
              {searchTerm || filter !== "all" 
                ? "No complaints match your filters" 
                : "No complaints found"}
            </p>
            {!searchTerm && filter === "all" && (
              <button
                onClick={() => navigate("/create")}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
              >
                Create Your First Complaint
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="mb-4 flex justify-between items-center">
              <p className="text-sm md:text-base text-gray-700 font-medium">
                Showing <span className="text-blue-600 font-bold">{filteredAndSortedComplaints.length}</span> of {complaints.length} complaints
              </p>
            </div>

            {/* Complaints Grid/List */}
            <div className={viewMode === "grid" 
              ? "grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6" 
              : "space-y-4"
            }>
              {filteredAndSortedComplaints.map((complaint) => {
                const slaStatus = getSLAStatus(complaint);
                const progress = getProgressPercentage(complaint.status);
                
                return (
                  <div
                    key={complaint._id}
                    className={`bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border-l-4 hover:scale-[1.02] ${
                      complaint.status === "Resolved" || complaint.status === "Closed"
                        ? "border-green-500"
                        : complaint.status === "In Progress"
                        ? "border-blue-500"
                        : complaint.status === "Assigned"
                        ? "border-yellow-500"
                        : "border-orange-500"
                    }`}
                    onClick={() => openModal(complaint)}
                  >
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-3 mb-2">
                            <h3 className="text-lg font-bold text-slate-800 flex-1">
                              {complaint.title}
                            </h3>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(
                                complaint.status
                              )} whitespace-nowrap`}
                            >
                              {complaint.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mb-2">
                            <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                              #{complaint._id?.substring(0, 8)}
                            </span>
                            {" • "}
                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded font-semibold">
                              {complaint.category}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Priority + SLA */}
                      <div className="flex gap-2 mb-4">
                        <span className={`px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-1 ${
                          complaint.priority === "Critical" 
                            ? "bg-red-100 text-red-700" 
                            : complaint.priority === "High"
                            ? "bg-orange-100 text-orange-700"
                            : complaint.priority === "Medium"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-700"
                        }`}>
                          {complaint.priority === "Critical" && "🔥"}
                          {complaint.priority === "High" && "⚠️"}
                          {complaint.priority === "Medium" && "⚡"}
                          {complaint.priority === "Low" && "📌"}
                          {complaint.priority}
                        </span>
                        {slaStatus && (
                          <span className={`px-3 py-1 rounded-lg text-xs font-bold ${slaStatus.color}`}>
                            ⏰ {slaStatus.text}
                          </span>
                        )}
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-xs font-semibold mb-2">
                          <span className="text-gray-600">Progress</span>
                          <span className="text-blue-600">{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div
                            className={`h-3 rounded-full transition-all duration-500 ${
                              progress === 100 
                                ? "bg-gradient-to-r from-green-400 to-green-600" 
                                : "bg-gradient-to-r from-blue-400 to-indigo-600"
                            }`}
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-slate-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                        {complaint.description}
                      </p>

                      {/* Info Grid */}
                      <div className="grid grid-cols-1 gap-2 text-xs bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 font-semibold">📍 Location:</span>
                          <span className="text-gray-700 font-medium truncate">{complaint.location}</span>
                        </div>
                        {complaint.assignedOfficer && (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500 font-semibold">👤 Officer:</span>
                            <span className="text-gray-700 font-medium">
                              {complaint.assignedOfficer.Name}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 font-semibold">📅 Created:</span>
                          <span className="text-gray-700 font-medium">
                            {new Date(complaint.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Photo Preview */}
                      {complaint.photo && (
                        <div className="mt-4">
                          <img
                            src={`http://localhost:4000${complaint.photo}`}
                            alt="Complaint"
                            className="w-full h-40 object-cover rounded-lg border-2 border-gray-200"
                          />
                        </div>
                      )}

                      {/* View Details Button */}
                      <button className="mt-4 w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2 px-4 rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all">
                        View Full Details →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Modal for Detailed View */}
        {showModal && selectedComplaint && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 md:p-4 backdrop-blur-sm" onClick={closeModal}>
            <div className="bg-white rounded-xl md:rounded-2xl max-w-4xl w-full max-h-[95vh] md:max-h-[90vh] overflow-hidden shadow-2xl border-t-4 border-gradient-to-r from-blue-500 to-orange-500" onClick={(e) => e.stopPropagation()}>
              
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-700 px-4 md:px-6 py-3 md:py-4 flex justify-between items-center shadow-lg z-10">
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg md:text-2xl font-bold text-white mb-1 truncate">Complaint Details</h2>
                  <p className="text-blue-100 text-xs md:text-sm truncate">
                    ID: #{selectedComplaint._id?.substring(0, 8)}<span className="hidden md:inline">{selectedComplaint._id?.substring(8, 12)}</span>
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-xl md:text-2xl font-bold transition-all flex-shrink-0 ml-2"
                >
                  ×
                </button>
              </div>

              {/* Tabs */}
              <div className="bg-gray-50 border-b border-gray-200 overflow-x-auto">
                <div className="flex min-w-max">
                  <button
                    onClick={() => setActiveTab("details")}
                    className={`flex-1 py-2.5 md:py-3 px-3 md:px-4 font-semibold transition-all text-sm md:text-base whitespace-nowrap ${
                      activeTab === "details"
                        ? "bg-white text-blue-600 border-b-2 border-blue-600"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    📋 Details
                  </button>
                  <button
                    onClick={() => setActiveTab("timeline")}
                    className={`flex-1 py-2.5 md:py-3 px-3 md:px-4 font-semibold transition-all text-sm md:text-base whitespace-nowrap ${
                      activeTab === "timeline"
                        ? "bg-white text-blue-600 border-b-2 border-blue-600"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    ⏱️ Timeline
                  </button>
                  <button
                    onClick={() => setActiveTab("officer")}
                    className={`flex-1 py-2.5 md:py-3 px-3 md:px-4 font-semibold transition-all text-sm md:text-base whitespace-nowrap ${
                      activeTab === "officer"
                        ? "bg-white text-blue-600 border-b-2 border-blue-600"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    👤 Officer
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="overflow-y-auto max-h-[calc(95vh-140px)] md:max-h-[calc(90vh-180px)]">
                <div className="p-4 md:p-6">
                  
                  {/* Details Tab */}
                  {activeTab === "details" && (
                    <div className="space-y-4 md:space-y-6">
                      {/* Status Banner */}
                      <div className={`p-3 md:p-4 rounded-xl flex flex-col md:flex-row md:items-center md:justify-between gap-3 ${
                        selectedComplaint.status === "Resolved" || selectedComplaint.status === "Closed"
                          ? "bg-gradient-to-r from-green-100 to-green-200"
                          : selectedComplaint.status === "In Progress"
                          ? "bg-gradient-to-r from-blue-100 to-blue-200"
                          : selectedComplaint.status === "Assigned"
                          ? "bg-gradient-to-r from-yellow-100 to-yellow-200"
                          : "bg-gradient-to-r from-orange-100 to-orange-200"
                      }`}>
                        <div className="flex-1">
                          <h3 className="text-lg md:text-2xl font-bold text-gray-800 mb-2 break-words">
                            {selectedComplaint.title}
                          </h3>
                          <div className="flex gap-2 flex-wrap">
                            <span className="bg-white px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-bold text-gray-700">
                              {selectedComplaint.category}
                            </span>
                            <span className={`px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-bold ${
                              selectedComplaint.priority === "Critical"
                                ? "bg-red-600 text-white"
                                : selectedComplaint.priority === "High"
                                ? "bg-orange-500 text-white"
                                : selectedComplaint.priority === "Medium"
                                ? "bg-yellow-500 text-white"
                                : "bg-gray-500 text-white"
                            }`}>
                              {selectedComplaint.priority === "Critical" && "🔥"}
                              {selectedComplaint.priority === "High" && "⚠️"}
                              {selectedComplaint.priority} Priority
                            </span>
                          </div>
                        </div>
                        <span className={`px-4 md:px-6 py-2 md:py-3 rounded-xl text-base md:text-lg font-bold shadow-lg text-center ${getStatusColor(selectedComplaint.status)}`}>
                          {selectedComplaint.status}
                        </span>
                      </div>

                      {/* Progress Indicator */}
                      <div>
                        <div className="flex justify-between text-xs md:text-sm font-semibold mb-2">
                          <span className="text-gray-600">Completion Progress</span>
                          <span className="text-blue-600">{getProgressPercentage(selectedComplaint.status)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 md:h-4 overflow-hidden shadow-inner">
                          <div
                            className={`h-3 md:h-4 rounded-full transition-all duration-500 ${
                              selectedComplaint.status === "Resolved" || selectedComplaint.status === "Closed"
                                ? "bg-gradient-to-r from-green-400 to-green-600"
                                : "bg-gradient-to-r from-blue-400 to-indigo-600"
                            }`}
                            style={{ width: `${getProgressPercentage(selectedComplaint.status)}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Description */}
                      <div className="bg-gray-50 p-3 md:p-4 rounded-lg border-l-4 border-blue-500">
                        <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2 text-sm md:text-base">
                          <span>📝</span> Description
                        </h4>
                        <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                          {selectedComplaint.description}
                        </p>
                      </div>

                      {/* Location Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                        <div className="bg-blue-50 p-3 md:p-4 rounded-lg border-l-4 border-blue-500">
                          <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2 text-sm md:text-base">
                            <span>📍</span> Location
                          </h4>
                          <p className="text-gray-700 text-sm md:text-base break-words">{selectedComplaint.location}</p>
                        </div>
                        <div className="bg-purple-50 p-3 md:p-4 rounded-lg border-l-4 border-purple-500">
                          <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2 text-sm md:text-base">
                            <span>📅</span> Submitted
                          </h4>
                          <p className="text-gray-700 text-sm md:text-base break-words">
                            {new Date(selectedComplaint.createdAt).toLocaleString("en-US", {
                              dateStyle: "full",
                              timeStyle: "short"
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Full Address */}
                      {selectedComplaint.address && (
                        <div className="bg-green-50 p-3 md:p-4 rounded-lg border-l-4 border-green-500">
                          <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2 text-sm md:text-base">
                            <span>🏠</span> Full Address
                          </h4>
                          <p className="text-gray-700 text-sm md:text-base break-words">{selectedComplaint.address}</p>
                        </div>
                      )}

                      {/* Photo */}
                      {selectedComplaint.photo && (
                        <div>
                          <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-sm md:text-base">
                            <span>📷</span> Photo Evidence
                          </h4>
                          <img
                            src={`http://localhost:4000${selectedComplaint.photo}`}
                            alt="Complaint"
                            className="w-full max-h-64 md:max-h-96 object-contain rounded-lg border-4 border-gray-200 shadow-lg"
                          />
                        </div>
                      )}

                      {/* Resolution Note */}
                      {selectedComplaint.resolutionNote && (
                        <div className="bg-gradient-to-r from-green-50 to-green-100 p-3 md:p-4 rounded-lg border-2 border-green-500 shadow-md">
                          <h4 className="font-bold text-green-800 mb-2 flex items-center gap-2 text-base md:text-lg">
                            <span>✅</span> Resolution
                          </h4>
                          <p className="text-green-700 leading-relaxed text-sm md:text-base break-words">{selectedComplaint.resolutionNote}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Timeline Tab */}
                  {activeTab === "timeline" && (
                    <div className="space-y-4 md:space-y-6">
                      <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-4">Complaint Timeline</h3>
                      <div className="relative">
                        {/* Timeline Line */}
                        <div className="absolute left-4 md:left-6 top-0 bottom-0 w-0.5 md:w-1 bg-gradient-to-b from-blue-500 via-indigo-500 to-gray-300"></div>
                        
                        {/* Timeline Items */}
                        <div className="space-y-4 md:space-y-6">
                          {getTimeline(selectedComplaint).map((item, index) => (
                            <div key={index} className="relative flex items-start gap-3 md:gap-4 pl-1 md:pl-2">
                              {/* Icon */}
                              <div className={`relative z-10 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shadow-lg text-sm md:text-base ${
                                item.active 
                                  ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white" 
                                  : "bg-gray-300 text-gray-500"
                              }`}>
                                {item.status === "Submitted" && "📝"}
                                {item.status === "Assigned" && "👤"}
                                {item.status === "In Progress" && "⚙️"}
                                {item.status === "Resolved" && "✅"}
                              </div>
                              
                              {/* Content */}
                              <div className={`flex-1 pb-4 md:pb-6 ${item.active ? "" : "opacity-50"}`}>
                                <div className={`p-3 md:p-4 rounded-lg border-l-4 ${
                                  item.active 
                                    ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-500" 
                                    : "bg-gray-50 border-gray-300"
                                }`}>
                                  <h4 className={`font-bold text-sm md:text-base ${item.active ? "text-gray-800" : "text-gray-500"}`}>
                                    {item.status}
                                  </h4>
                                  {item.date ? (
                                    <p className="text-xs md:text-sm text-gray-600 mt-1 break-words">
                                      {new Date(item.date).toLocaleString("en-US", {
                                        dateStyle: "full",
                                        timeStyle: "short"
                                      })}
                                    </p>
                                  ) : (
                                    <p className="text-xs md:text-sm text-gray-400 mt-1 italic">
                                      Pending
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Officer Info Tab */}
                  {activeTab === "officer" && (
                    <div className="space-y-4 md:space-y-6">
                      {selectedComplaint.assignedOfficer ? (
                        <>
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 md:p-6 rounded-xl border-2 border-blue-300 shadow-lg">
                            <div className="flex items-center gap-3 md:gap-4 mb-4">
                              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl md:text-2xl font-bold shadow-lg flex-shrink-0">
                                {selectedComplaint.assignedOfficer.Name.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <h3 className="text-lg md:text-2xl font-bold text-gray-800 break-words">
                                  {selectedComplaint.assignedOfficer.Name}
                                </h3>
                                <p className="text-blue-600 font-semibold text-sm md:text-base">Municipal Officer</p>
                              </div>
                            </div>
                            
                            <div className="space-y-2 md:space-y-3">
                              <div className="flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-white rounded-lg">
                                <span className="text-xl md:text-2xl flex-shrink-0">📧</span>
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold text-gray-500">Email</p>
                                  <p className="text-gray-800 font-medium text-sm md:text-base break-all">
                                    {selectedComplaint.assignedOfficer.Email || "Not provided"}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-white rounded-lg">
                                <span className="text-xl md:text-2xl flex-shrink-0">💼</span>
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold text-gray-500">Role</p>
                                  <p className="text-gray-800 font-medium text-sm md:text-base break-words">
                                    {selectedComplaint.assignedOfficer.Role || "Officer"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 md:p-4 rounded-lg">
                            <p className="text-yellow-800 font-medium text-sm md:text-base">
                              💡 Your complaint has been assigned to this officer for resolution. 
                              You can contact them via the email provided above for updates.
                            </p>
                          </div>
                        </>
                      ) : (
                        <div className="bg-orange-50 border-2 border-orange-300 p-6 md:p-8 rounded-xl text-center">
                          <div className="text-4xl md:text-6xl mb-4">⏳</div>
                          <h3 className="text-lg md:text-xl font-bold text-orange-800 mb-2">
                            No Officer Assigned Yet
                          </h3>
                          <p className="text-orange-700 text-sm md:text-base">
                            Your complaint is pending assignment. An officer will be assigned shortly to handle your request.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-4 md:px-6 py-3 md:py-4 flex flex-col sm:flex-row justify-end gap-2 md:gap-3">
                <button
                  onClick={closeModal}
                  className="w-full sm:w-auto px-4 md:px-6 py-2 md:py-2.5 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-sm md:text-base"
                >
                  Close
                </button>
                <button
                  onClick={() => window.print()}
                  className="w-full sm:w-auto px-4 md:px-6 py-2 md:py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm md:text-base"
                >
                  🖨️ Print
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default TrackComplaint;
