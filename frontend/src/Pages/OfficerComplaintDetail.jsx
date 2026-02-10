import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../Services/api";
import { 
  ArrowLeft, Calendar, MapPin, AlertCircle, Clock, User, 
  Mail, Phone, FileText, CheckCircle, Tag, Building2, Info 
} from "lucide-react";

const OfficerComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get(`/complaints/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setComplaint(res.data);
        setStatus(res.data.status);
      } catch (err) {
        console.error("Failed to load complaint details:", err);
        alert("Failed to load complaint details");
      }
    };
    fetchComplaint();
  }, [id]);

  const updateStatus = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await api.put(`/complaints/getupdatestatus/${id}`, 
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update complaint state
      setComplaint(prev => ({
        ...prev,
        status,
        history: [...prev.history, { status, updatedAt: new Date() }]
      }));
      
      alert("Status updated successfully ✓");
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  const getSLAStatus = () => {
    if (!complaint?.slaDeadline) return { text: "N/A", hours: 0 };
    const diff = new Date(complaint.slaDeadline) - new Date();

    if (diff <= 0) return { text: "BREACHED", hours: 0, breached: true };
    const hours = Math.floor(diff / (1000 * 60 * 60));
    return { text: `${hours}h remaining`, hours, breached: false };
  };

  const getPriorityColor = (priority) => {
    const colors = {
      "Critical": "bg-red-500",
      "High": "bg-orange-500",
      "Medium": "bg-yellow-500",
      "Low": "bg-blue-500"
    };
    return colors[priority] || "bg-gray-500";
  };

  const getStatusColor = (status) => {
    const colors = {
      "Resolved": "bg-green-500",
      "In Progress": "bg-blue-500",
      "Escalated": "bg-red-500",
      "Submitted": "bg-yellow-500"
    };
    return colors[status] || "bg-gray-500";
  };

  if (!complaint) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-lg text-gray-600">Loading complaint details...</p>
      </div>
    </div>
  );

  const slaInfo = getSLAStatus();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 py-6 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/officer")}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium mb-4 
              transition-colors group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </button>
          
          {/* Hero Card */}
          <div className="bg-gradient-to-r from-blue-600 to-orange-500 rounded-2xl shadow-2xl p-8 text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <FileText size={32} className="opacity-90" />
                  <h1 className="text-3xl md:text-4xl font-bold">
                    #{complaint._id?.slice(-6).toUpperCase()}
                  </h1>
                </div>
                <p className="text-blue-50 text-lg font-medium mb-1">{complaint.title}</p>
                <div className="flex items-center gap-2 text-blue-100">
                  <Calendar size={16} />
                  <span className="text-sm">
                    Filed {new Date(complaint.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>
              
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-end gap-3">
                  <span className={`px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(complaint.status)} 
                    text-white shadow-lg`}>
                    {complaint.status}
                  </span>
                  <span className={`px-4 py-2 rounded-full text-sm font-bold ${getPriorityColor(complaint.priority)} 
                    text-white shadow-lg`}>
                    {complaint.priority}
                  </span>
                </div>
                <div className={`flex items-center justify-end gap-2 px-4 py-2 rounded-lg 
                  ${slaInfo.breached ? 'bg-red-500/20 border border-red-300' : 'bg-green-500/20 border border-green-300'}`}>
                  <Clock size={16} />
                  <span className="text-sm font-semibold">
                    SLA: {slaInfo.text}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Left & Center - Main Details */}
          <div className="xl:col-span-2 space-y-6">
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-blue-500">
                <div className="flex items-center gap-3">
                  <Tag className="text-blue-500" size={24} />
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Category</p>
                    <p className="text-sm font-bold text-gray-800">{complaint.category}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-orange-500">
                <div className="flex items-center gap-3">
                  <AlertCircle className="text-orange-500" size={24} />
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Priority</p>
                    <p className="text-sm font-bold text-gray-800">{complaint.priority}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-green-500">
                <div className="flex items-center gap-3">
                  <CheckCircle className="text-green-500" size={24} />
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Status</p>
                    <p className="text-sm font-bold text-gray-800">{complaint.status}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-purple-500">
                <div className="flex items-center gap-3">
                  <Clock className="text-purple-500" size={24} />
                  <div>
                    <p className="text-xs text-gray-500 font-medium">SLA Status</p>
                    <p className={`text-sm font-bold ${slaInfo.breached ? 'text-red-600' : 'text-green-600'}`}>
                      {slaInfo.hours}h
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="text-blue-600" size={24} />
                <h2 className="text-xl font-bold text-gray-800">Description</h2>
              </div>
              <p className="text-gray-700 leading-relaxed text-base">{complaint.description}</p>
            </div>

            {/* Priority Justification */}
            {complaint.priorityReason && (
              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-orange-600 flex-shrink-0 mt-1" size={24} />
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">Priority Justification</h3>
                    <p className="text-gray-700 leading-relaxed">{complaint.priorityReason}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Location & Department */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="text-green-600" size={24} />
                  <h2 className="text-xl font-bold text-gray-800">Location</h2>
                </div>
                <div className="space-y-2">
                  <p className="text-gray-700">
                    <span className="font-semibold">Address:</span><br />
                    {complaint.address}
                  </p>
                  {complaint.landmark && (
                    <p className="text-gray-700">
                      <span className="font-semibold">Landmark:</span> {complaint.landmark}
                    </p>
                  )}
                </div>
              </div>

              {complaint.suggestedDepartment && (
                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
                  <div className="flex items-center gap-2 mb-4">
                    <Building2 className="text-purple-600" size={24} />
                    <h2 className="text-xl font-bold text-gray-800">Department</h2>
                  </div>
                  <p className="text-gray-700">
                    <span className="font-semibold">Suggested:</span><br />
                    {complaint.suggestedDepartment}
                  </p>
                </div>
              )}
            </div>

            {/* Status Timeline */}
            {complaint.history && complaint.history.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Clock className="text-blue-600" size={24} />
                  <h2 className="text-xl font-bold text-gray-800">Status Timeline</h2>
                </div>
                <div className="relative">
                  {/* Timeline Line */}
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-orange-500"></div>
                  
                  <div className="space-y-6">
                    {complaint.history.map((h, index) => (
                      <div key={index} className="relative flex items-start gap-6 pl-11">
                        <div className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center 
                          ${getStatusColor(h.status)} shadow-lg`}>
                          <CheckCircle size={16} className="text-white" />
                        </div>
                        <div className="flex-1 bg-gray-50 rounded-lg p-4 shadow">
                          <p className="font-bold text-gray-800 text-lg mb-1">{h.status}</p>
                          <p className="text-sm text-gray-500 flex items-center gap-2">
                            <Calendar size={14} />
                            {new Date(h.updatedAt || h.time).toLocaleString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            
            {/* Photo Proof */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Info className="text-blue-600" size={24} />
                Evidence
              </h2>
              {complaint.photo ? (
                <img
                  src={`http://localhost:4000${complaint.photo}`}
                  alt="Complaint Evidence"
                  className="w-full rounded-lg border-2 border-gray-200 shadow-md 
                    hover:shadow-xl transition-shadow"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="%23f3f4f6" width="200" height="200"/><text x="50%" y="50%" text-anchor="middle" fill="%239ca3af" font-size="14">Image not found</text></svg>';
                  }}
                />
              ) : (
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-dashed 
                  border-gray-400 rounded-lg p-12 text-center">
                  <FileText className="mx-auto text-gray-400 mb-3" size={48} />
                  <p className="text-gray-500 font-medium">No photo uploaded</p>
                </div>
              )}
            </div>

            {/* Citizen Info */}
            {complaint.citizen && (
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-lg p-6 border-t-4 border-blue-500">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <User className="text-blue-600" size={24} />
                  Citizen Details
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                    <User className="text-gray-500" size={20} />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 font-medium">Name</p>
                      <p className="text-gray-800 font-semibold">{complaint.citizen.Name || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                    <Mail className="text-gray-500" size={20} />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 font-medium">Email</p>
                      <p className="text-gray-800 font-semibold text-sm break-all">{complaint.citizen.Email || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Status Update */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-orange-500">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <CheckCircle className="text-orange-600" size={24} />
                Update Status
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Change Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:ring-2 
                      focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                  >
                    <option value="Submitted">Submitted</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Escalated">Escalated</option>
                  </select>
                </div>

                <button
                  onClick={updateStatus}
                  disabled={loading || status === complaint.status}
                  className="w-full bg-gradient-to-r from-blue-600 to-orange-500 text-white py-4 rounded-lg 
                    font-bold text-lg hover:from-blue-700 hover:to-orange-600 transition-all duration-300 
                    shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed 
                    transform hover:scale-105 active:scale-95"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Updating...
                    </span>
                  ) : status === complaint.status ? (
                    "No Changes"
                  ) : (
                    "Update Status"
                  )}
                </button>
                
                {status !== complaint.status && (
                  <p className="text-xs text-gray-500 text-center">
                    Status will be changed from <span className="font-bold">{complaint.status}</span> to{' '}
                    <span className="font-bold">{status}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficerComplaintDetail;
