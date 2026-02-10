import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

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

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:4000/complaints/my", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = response.data;
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
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 p-8">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-blue-900">
              Citizen Dashboard
            </h1>
            <p className="text-sm text-gray-700">
              Integrated Municipal Service Portal
            </p>
          </div>

          <button
            onClick={logout}
            className="bg-gradient-to-r from-orange-400 to-orange-500 text-white px-6 py-2 rounded-lg hover:from-orange-500 hover:to-orange-600 font-semibold transition-all duration-300 shadow-md"
          >
            Logout
          </button>
        </div>

        {/* QUICK ACTIONS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">

          <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-blue-500 hover:shadow-xl transition-shadow">
            <h2 className="text-blue-900 font-semibold">
              Total Complaints
            </h2>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {stats.total}
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-orange-400 hover:shadow-xl transition-shadow">
            <h2 className="text-blue-900 font-semibold">
              Pending
            </h2>
            <p className="text-3xl font-bold text-orange-600 mt-2">
              {stats.pending}
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-blue-400 hover:shadow-xl transition-shadow">
            <h2 className="text-blue-900 font-semibold">
              In Progress
            </h2>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {stats.inProgress}
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-green-500 hover:shadow-xl transition-shadow">
            <h2 className="text-blue-900 font-semibold">
              Resolved
            </h2>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {stats.resolved}
            </p>
          </div>

        </div>

        {/* ACTION BUTTONS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border-l-4 border-orange-400">
            <h2 className="text-blue-900 font-semibold">
              Create Complaint
            </h2>
            <p className="text-sm text-gray-600 mt-2">
              Submit a new service request
            </p>
            <button
              onClick={() => navigate("/create")}
              className="mt-4 bg-gradient-to-r from-orange-400 to-orange-500 text-white px-4 py-2 rounded-lg hover:from-orange-500 hover:to-orange-600 font-semibold transition-all duration-300 w-full"
            >
              Create New
            </button>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border-l-4 border-blue-400">
            <h2 className="text-blue-900 font-semibold">
              Track Complaints
            </h2>
            <p className="text-sm text-gray-600 mt-2">
              View your complaint status
            </p>
            <button
              onClick={() => navigate("/track")}
              className="mt-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 font-semibold transition-all duration-300 w-full"
            >
              Track Now
            </button>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border-l-4 border-blue-500">
            <h2 className="text-blue-900 font-semibold">
              Profile
            </h2>
            <p className="text-sm text-gray-600 mt-2">
              Manage your account
            </p>
            <button
              onClick={() => navigate("/profile")}
              className="mt-4 bg-gradient-to-r from-blue-700 to-blue-800 text-white px-4 py-2 rounded-lg hover:from-blue-800 hover:to-blue-900 font-semibold transition-all duration-300 w-full"
            >
              View Profile
            </button>
          </div>

        </div>

        {/* COMPLAINT HISTORY */}
          <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-orange-400">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-blue-900">
              Complaint History ({filteredComplaints.length})
            </h2>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search complaints..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-1 border rounded-lg text-sm"
              />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-1 border rounded-lg text-sm"
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
            <div className="text-center py-8 text-slate-500">
              Loading complaints...
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              {searchTerm || filter !== "all" 
                ? "No complaints match your filters" 
                : "No complaints yet. Create your first complaint!"}
            </div>
          ) : (
            <div className="overflow-x-auto">
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
          )}
        </div>

      </div>
    </div>
  );
};

export default CitizenDashboard;
