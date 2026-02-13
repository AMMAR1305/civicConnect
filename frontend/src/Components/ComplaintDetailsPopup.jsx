import React, { useState, useMemo, memo, useCallback } from 'react';
import { 
  X, MapPin, Clock, User, Mail, Phone, Shield, AlertCircle, 
  CheckCircle, FileText, Calendar, Tag, TrendingUp, Image as ImageIcon,
  UserCog, AlertTriangle, Edit, Trash2, Send
} from 'lucide-react';

const ComplaintDetailsPopup = memo(({ complaint, isOpen, onClose, onEdit, onReassign, onDelete, isAdmin = false }) => {
  // Early return BEFORE any hooks to avoid hook violations
  if (!isOpen || !complaint) return null;
  
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleEdit = useCallback(() => {
    if (onEdit) {
      onEdit(complaint);
    }
  }, [onEdit, complaint]);

  const handleReassign = useCallback(() => {
    if (onReassign) {
      onReassign(complaint);
    }
  }, [onReassign, complaint]);

  const handleDelete = useCallback(() => {
    if (onDelete) {
      onDelete(complaint);
    }
  }, [onDelete, complaint]);

  const statusConfig = useMemo(() => {
    const status = complaint.status;
    switch (status) {
      case 'Resolved':
      case 'Closed':
        return {
          color: 'bg-green-50 text-green-700 border-green-200',
          icon: <CheckCircle className="w-5 h-5" />
        };
      case 'In Progress':
        return {
          color: 'bg-blue-50 text-blue-700 border-blue-200',
          icon: <TrendingUp className="w-5 h-5" />
        };
      case 'Assigned':
        return {
          color: 'bg-amber-50 text-amber-700 border-amber-200',
          icon: <UserCog className="w-5 h-5" />
        };
      case 'Submitted':
        return {
          color: 'bg-slate-50 text-slate-700 border-slate-200',
          icon: <AlertCircle className="w-5 h-5" />
        };
      default:
        return {
          color: 'bg-gray-50 text-gray-700 border-gray-200',
          icon: <AlertCircle className="w-5 h-5" />
        };
    }
  }, [complaint.status]);

  const priorityConfig = useMemo(() => {
    const priority = complaint.priority?.toLowerCase();
    switch (priority) {
      case 'high':
      case 'critical':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'medium':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'low':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  }, [complaint.priority]);

  const formatDate = useCallback((date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  return (
    <>
      {/* Blurred Backdrop */}
      <div 
        className="popup-backdrop"
        onClick={onClose}
      />

      {/* Complaint Details Popup Panel */}
      <div className="popup-panel complaint-details-popup">
        {/* Header */}
        <div className="popup-header">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${statusConfig.color}`}>
              {statusConfig.icon}
            </div>
            <div>
              <h3 className="popup-title">Complaint Details</h3>
              <p className="text-xs text-gray-500">ID: #{complaint._id?.slice(-8) || 'N/A'}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="popup-close-btn"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="popup-body">
          {/* Status & Priority Badges */}
          <div className="flex gap-3 mb-4">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border font-semibold ${statusConfig.color}`}>
              {statusConfig.icon}
              <span>{complaint.status || 'Pending'}</span>
            </div>
            <div className={`px-4 py-2 rounded-lg border font-semibold ${priorityConfig}`}>
              {complaint.priority || 'Normal'} Priority
            </div>
          </div>

          {/* Title */}
          <div className="complaint-detail-section">
            <h4 className="complaint-detail-title">
              <FileText className="w-5 h-5 text-blue-500" />
              Title
            </h4>
            <p className="text-lg font-bold text-gray-800">{complaint.title || 'Untitled Complaint'}</p>
          </div>

          {/* Description */}
          <div className="complaint-detail-section">
            <h4 className="complaint-detail-title">
              <FileText className="w-5 h-5 text-blue-500" />
              Description
            </h4>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {complaint.description || 'No description provided.'}
            </p>
          </div>

          {/* Image */}
          {complaint.image && (
            <div className="complaint-detail-section">
              <h4 className="complaint-detail-title">
                <ImageIcon className="w-5 h-5 text-blue-500" />
                Attached Evidence
              </h4>
              <div className="complaint-image-container">
                <div className="relative">
                  {!imageLoaded && (
                    <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="text-gray-400 text-sm">Loading image...</div>
                    </div>
                  )}
                  <img 
                    src={`http://localhost:4000${complaint.image}`} 
                    alt="Complaint Evidence" 
                    className={`complaint-image transition-opacity duration-200 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={() => setImageLoaded(true)}
                    onError={() => setImageLoaded(false)}
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Category & Location Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="complaint-info-card">
              <Tag className="w-5 h-5 text-purple-500" />
              <div>
                <p className="complaint-info-label">Category</p>
                <p className="complaint-info-value">{complaint.category || 'Uncategorized'}</p>
              </div>
            </div>
            
            <div className="complaint-info-card">
              <MapPin className="w-5 h-5 text-red-500" />
              <div>
                <p className="complaint-info-label">Location</p>
                <p className="complaint-info-value">{complaint.location || complaint.ward || 'Not specified'}</p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="complaint-detail-section">
            <h4 className="complaint-detail-title">
              <Calendar className="w-5 h-5 text-blue-500" />
              Timeline
            </h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Created</p>
                  <p className="text-xs text-gray-600">{formatDate(complaint.createdAt)}</p>
                </div>
              </div>
              {complaint.updatedAt && complaint.updatedAt !== complaint.createdAt && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Last Updated</p>
                    <p className="text-xs text-gray-600">{formatDate(complaint.updatedAt)}</p>
                  </div>
                </div>
              )}
              {complaint.slaDeadline && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-orange-500 mt-2"></div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">SLA Deadline</p>
                    <p className="text-xs text-gray-600">{formatDate(complaint.slaDeadline)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Citizen Information */}
          {complaint.citizen && (
            <div className="complaint-detail-section">
              <h4 className="complaint-detail-title">
                <User className="w-5 h-5 text-blue-500" />
                Submitted By
              </h4>
              <div className="citizen-info-card">
                <div className="citizen-avatar">
                  {complaint.citizen.Name?.charAt(0)?.toUpperCase() || 'C'}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-800">{complaint.citizen.Name || 'Anonymous'}</p>
                  {complaint.citizen.Email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                      <Mail className="w-4 h-4" />
                      {complaint.citizen.Email}
                    </div>
                  )}
                  {complaint.citizen.Phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                      <Phone className="w-4 h-4" />
                      {complaint.citizen.Phone}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Assigned Officer */}
          {complaint.assignedOfficer ? (
            <div className="complaint-detail-section">
              <h4 className="complaint-detail-title">
                <Shield className="w-5 h-5 text-blue-500" />
                Assigned Officer
              </h4>
              <div className="officer-info-card">
                <div className="officer-avatar">
                  {complaint.assignedOfficer.Name?.charAt(0)?.toUpperCase() || 'O'}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-800">{complaint.assignedOfficer.Name}</p>
                  {complaint.assignedOfficer.Email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                      <Mail className="w-4 h-4" />
                      {complaint.assignedOfficer.Email}
                    </div>
                  )}
                  {complaint.assignedOfficer.specializations && complaint.assignedOfficer.specializations.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {complaint.assignedOfficer.specializations.map((spec, idx) => (
                      <span key={idx} className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs font-medium border border-purple-200">
                          {spec}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </div>
          ) : (
            <div className="complaint-detail-section">
              <h4 className="complaint-detail-title">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                Assignment Status
              </h4>
              <div className="unassigned-card">
                <AlertTriangle className="w-10 h-10 text-orange-600" />
                <div>
                  <p className="font-bold text-gray-800">No Officer Assigned</p>
                  <p className="text-sm text-gray-600">This complaint is awaiting assignment</p>
                </div>
              </div>
            </div>
          )}

          {/* Additional Details */}
          {(complaint.ward || complaint.pincode || complaint.feedback) && (
            <div className="complaint-detail-section">
              <h4 className="complaint-detail-title">
                <FileText className="w-5 h-5 text-blue-500" />
                Additional Information
              </h4>
              <div className="space-y-2">
                {complaint.ward && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold text-gray-700">Ward:</span>
                    <span className="text-gray-600">{complaint.ward}</span>
                  </div>
                )}
                {complaint.pincode && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold text-gray-700">Pincode:</span>
                    <span className="text-gray-600">{complaint.pincode}</span>
                  </div>
                )}
                {complaint.feedback && (
                  <div className="text-sm">
                    <span className="font-semibold text-gray-700 block mb-1">Feedback:</span>
                    <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{complaint.feedback}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions - Only visible for admins */}
        {isAdmin && (
          <div className="popup-footer">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-semibold text-gray-700">Admin Actions</span>
              </div>
              <span className="text-xs text-gray-500">Administrator privileges</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <button 
                onClick={handleEdit}
                className="admin-action-btn admin-action-edit"
                title="Modify complaint details"
              >
                <Edit className="w-5 h-5" />
                <span className="text-sm font-semibold">Edit</span>
              </button>
              <button 
                onClick={handleReassign}
                className="admin-action-btn admin-action-reassign"
                title="Reassign to different officer"
              >
                <Send className="w-5 h-5" />
                <span className="text-sm font-semibold">Reassign</span>
              </button>
              <button 
                onClick={handleDelete}
                className="admin-action-btn admin-action-delete"
                title="Delete this complaint permanently"
              >
                <Trash2 className="w-5 h-5" />
                <span className="text-sm font-semibold">Delete</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
});

export default ComplaintDetailsPopup;
