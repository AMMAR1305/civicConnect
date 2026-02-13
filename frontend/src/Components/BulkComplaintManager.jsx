import React, { useState, useEffect, useCallback, memo } from 'react';
import { 
  MapPin, Users, Package, RefreshCw, CheckCircle, 
  AlertTriangle, Clock, TrendingUp, Filter, X
} from 'lucide-react';
import api from '../Services/api';

const BulkComplaintManager = memo(({ isOpen, onClose }) => {
  const [locationGroups, setLocationGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [bulkStatus, setBulkStatus] = useState('');
  const [comment, setComment] = useState('');
  const [updating, setUpdating] = useState(false);

  // Fetch complaints grouped by location
  const fetchLocationGroups = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await api.get('/complaints/by-location', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLocationGroups(response.data.locationGroups || []);
    } catch (error) {
      console.error('Failed to fetch location groups:', error);
      alert('Failed to load complaint groups');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchLocationGroups();
    }
  }, [isOpen, fetchLocationGroups]);

  const handleBulkUpdate = async () => {
    if (!selectedGroup || !bulkStatus) {
      alert('Please select a location group and status');
      return;
    }

    try {
      setUpdating(true);
      const token = localStorage.getItem('token');
      
      const response = await api.post('/complaints/bulk-update', {
        area: selectedGroup._id.area,
        district: selectedGroup._id.district,
        category: selectedGroup._id.category,
        status: bulkStatus,
        comment: comment
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert(response.data.message);
      setSelectedGroup(null);
      setBulkStatus('');
      setComment('');
      fetchLocationGroups(); // Refresh the data
    } catch (error) {
      console.error('Bulk update failed:', error);
      alert(error.response?.data?.message || 'Failed to update complaints');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Submitted': return 'text-blue-600 bg-blue-50';
      case 'Assigned': return 'text-purple-600 bg-purple-50';
      case 'In Progress': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical': return 'text-red-600 bg-red-50';
      case 'High': return 'text-orange-600 bg-orange-50';
      case 'Medium': return 'text-yellow-600 bg-yellow-50';
      case 'Low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="popup-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="popup-panel" style={{ width: '900px', maxHeight: '90vh' }}>
        {/* Header */}
        <div className="popup-header">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="popup-title">Bulk Complaint Manager</h3>
              <p className="text-xs text-gray-500">Update multiple complaints by location</p>
            </div>
          </div>
          <button
            className="popup-close-btn"
            onClick={onClose}
            disabled={updating}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="popup-body">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading complaint groups...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Location Groups List */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  Complaint Groups by Location
                </h4>
                
                {locationGroups.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p>No complaint groups found</p>
                    <p className="text-sm">Groups appear when 2+ complaints exist in same location</p>
                  </div>
                ) : (
                  <div className="grid gap-4 max-h-60 overflow-y-auto">
                    {locationGroups.map((group, index) => (
                      <div
                        key={index}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedGroup === group
                            ? 'border-blue-500 bg-blue-50 shadow-md'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-blue-25'
                        }`}
                        onClick={() => setSelectedGroup(group)}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <MapPin className="w-4 h-4 text-blue-600" />
                              <span className="font-semibold text-gray-800">
                                {group._id.area}, {group._id.district}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
                              <span className="px-2 py-1 bg-gray-100 rounded">
                                {group._id.category}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                {group.count} complaints
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {[...new Set(group.statuses)].map((status) => (
                                <span
                                  key={status}
                                  className={`px-2 py-1 text-xs rounded ${getStatusColor(status)}`}
                                >
                                  {status}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-blue-600">{group.count}</div>
                            <div className="text-xs text-gray-500">complaints</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bulk Update Section */}
              {selectedGroup && (
                <div className="border-t pt-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Bulk Update Selected Group
                  </h4>
                  
                  <div className="bg-blue-50 p-4 rounded-lg mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">
                        {selectedGroup._id.area}, {selectedGroup._id.district}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">{selectedGroup.count} complaints</span> in{' '}
                      <span className="font-medium">{selectedGroup._id.category}</span> category
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Status
                      </label>
                      <select
                        value={bulkStatus}
                        onChange={(e) => setBulkStatus(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Status</option>
                        <option value="Assigned">Assigned</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Comment (Optional)
                      </label>
                      <input
                        type="text"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Update comment..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      onClick={() => setSelectedGroup(null)}
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                      disabled={updating}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleBulkUpdate}
                      disabled={!bulkStatus || updating}
                      className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {updating ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Update {selectedGroup.count} Complaints
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

BulkComplaintManager.displayName = 'BulkComplaintManager';

export default BulkComplaintManager;