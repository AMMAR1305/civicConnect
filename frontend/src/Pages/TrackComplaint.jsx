import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const TrackComplaint = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showModal, setShowModal] = useState(false);

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

  const filteredAndSortedComplaints = complaints
    .filter(c => filter === "all" || c.status === filter)
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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-blue-900">
                Track Your Complaints
              </h1>
              <p className="text-gray-700 mt-1">
                Monitor status and progress of your service requests
              </p>
            </div>
            <button
              onClick={() => navigate("/create")}
              className="bg-gradient-to-r from-orange-400 to-orange-500 text-white px-6 py-2 rounded-lg hover:from-orange-500 hover:to-orange-600 font-semibold transition-all duration-300 shadow-md"
            >
              + New Complaint
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-lg border-t-4 border-blue-500 hover:shadow-xl transition-shadow">
            <p className="text-blue-900 text-sm font-semibold">Total</p>
            <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-lg border-t-4 border-orange-400 hover:shadow-xl transition-shadow">
            <p className="text-blue-900 text-sm font-semibold">Pending</p>
            <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-lg border-t-4 border-blue-400 hover:shadow-xl transition-shadow">
            <p className="text-blue-900 text-sm font-semibold">In Progress</p>
            <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-lg border-t-4 border-green-500 hover:shadow-xl transition-shadow">
            <p className="text-blue-900 text-sm font-semibold">Resolved</p>
            <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-4 rounded-xl shadow-lg border-t-4 border-orange-400 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <input
              type="text"
              placeholder="Search by ID, title, category, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 min-w-[200px] px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-semibold text-blue-900"
            >
              <option value="all">All Status</option>
              <option value="Submitted">Submitted</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-semibold text-blue-900"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="priority">High Priority</option>
            </select>
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
          <div className="space-y-4">
            {filteredAndSortedComplaints.map((complaint) => {
              const slaStatus = getSLAStatus(complaint);
              const progress = getProgressPercentage(complaint.status);
              
              return (
                <div
                  key={complaint._id}
                  className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border-l-4 border-blue-400 hover:border-orange-400"
                  onClick={() => openModal(complaint)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-slate-800">
                          {complaint.title}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            complaint.status
                          )}`}
                        >
                          {complaint.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 mb-1">
                        ID: <span className="font-mono">{complaint._id?.substring(0, 12)}...</span> • {complaint.category}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-semibold ${getPriorityColor(complaint.priority)}`}>
                        {complaint.priority} Priority
                      </span>
                      {slaStatus && (
                        <div className={`mt-2 px-3 py-1 rounded text-xs font-medium ${slaStatus.color}`}>
                          {slaStatus.text}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <p className="text-slate-600 mb-4 line-clamp-2">{complaint.description}</p>

                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">📍 Location:</span>
                      <span className="text-slate-700 font-medium">{complaint.location}</span>
                    </div>
                    {complaint.assignedOfficer && (
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500">👤 Officer:</span>
                        <span className="text-slate-700 font-medium">
                          {complaint.assignedOfficer.Name}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">📅 Created:</span>
                      <span className="text-slate-700 font-medium">
                        {new Date(complaint.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric"
                        })}
                      </span>
                    </div>
                  </div>

                  {complaint.photo && (
                    <div className="mt-4">
                      <img
                        src={`http://localhost:4000${complaint.photo}`}
                        alt="Complaint"
                        className="w-full max-w-xs h-48 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Modal for Detailed View */}
        {showModal && selectedComplaint && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={closeModal}>
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-t-4 border-orange-400" onClick={(e) => e.stopPropagation()}>
              <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-orange-50 border-b-2 border-orange-400 px-6 py-4 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-blue-900">Complaint Details</h2>
                <button
                  onClick={closeModal}
                  className="text-blue-900 hover:text-orange-600 text-3xl font-bold transition-colors"
                >
                  ×
                </button>
              </div>

              <div className="p-6">
                {/* Header Info */}
                <div className="mb-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-xl font-semibold text-slate-800 mb-2">
                        {selectedComplaint.title}
                      </h3>
                      <p className="text-sm text-slate-500">
                        ID: <span className="font-mono">{selectedComplaint._id}</span>
                      </p>
                    </div>
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(
                        selectedComplaint.status
                      )}`}
                    >
                      {selectedComplaint.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-500">Category:</span>
                      <span className="ml-2 font-medium">{selectedComplaint.category}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Priority:</span>
                      <span className={`ml-2 font-semibold ${getPriorityColor(selectedComplaint.priority)}`}>
                        {selectedComplaint.priority}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Location:</span>
                      <span className="ml-2 font-medium">{selectedComplaint.location}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Created:</span>
                      <span className="ml-2 font-medium">
                        {new Date(selectedComplaint.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h4 className="font-semibold text-slate-700 mb-2">Description</h4>
                  <p className="text-slate-600 bg-slate-50 p-4 rounded-lg">
                    {selectedComplaint.description}
                  </p>
                </div>

                {/* Address */}
                {selectedComplaint.address && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-slate-700 mb-2">Address</h4>
                    <p className="text-slate-600 bg-slate-50 p-4 rounded-lg">
                      {selectedComplaint.address}
                    </p>
                  </div>
                )}

                {/* Photo */}
                {selectedComplaint.photo && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-slate-700 mb-2">Photo Evidence</h4>
                    <img
                      src={`http://localhost:4000${selectedComplaint.photo}`}
                      alt="Complaint"
                      className="w-full max-h-96 object-contain rounded-lg border"
                    />
                  </div>
                )}

                {/* Timeline */}
                <div className="mb-6">
                  <h4 className="font-semibold text-slate-700 mb-4">Timeline</h4>
                  <div className="space-y-4">
                    {getTimeline(selectedComplaint).map((item, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className={`mt-1 w-4 h-4 rounded-full ${item.active ? "bg-indigo-600" : "bg-slate-300"}`}></div>
                        <div className="flex-1">
                          <p className={`font-medium ${item.active ? "text-slate-800" : "text-slate-400"}`}>
                            {item.status}
                          </p>
                          {item.date && (
                            <p className="text-sm text-slate-500">
                              {new Date(item.date).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Officer Info */}
                {selectedComplaint.assignedOfficer && (
                  <div className="mb-6 bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-slate-700 mb-2">Assigned Officer</h4>
                    <p className="text-slate-700">
                      <strong>Name:</strong> {selectedComplaint.assignedOfficer.Name}
                    </p>
                    {selectedComplaint.assignedOfficer.Email && (
                      <p className="text-slate-700">
                        <strong>Email:</strong> {selectedComplaint.assignedOfficer.Email}
                      </p>
                    )}
                  </div>
                )}

                {/* Resolution */}
                {selectedComplaint.resolutionNote && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">✓ Resolution</h4>
                    <p className="text-green-700">{selectedComplaint.resolutionNote}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default TrackComplaint;
