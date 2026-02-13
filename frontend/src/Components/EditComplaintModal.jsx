import React, { useState, useEffect, memo, useCallback, useMemo } from 'react';
import { X, Save, AlertCircle, FileText, MapPin, Tag, AlertTriangle } from 'lucide-react';

const EditComplaintModal = memo(({ isOpen, onClose, complaint, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    ward: '',
    pincode: '',
    status: '',
    priority: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (complaint) {
      setFormData({
        title: complaint.title || '',
        description: complaint.description || '',
        category: complaint.category || '',
        location: complaint.location || '',
        ward: complaint.ward || '',
        pincode: complaint.pincode || '',
        status: complaint.status || 'Submitted',
        priority: complaint.priority || 'Normal'
      });
      setErrors({});
    }
  }, [complaint]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  }, [errors]);

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData.title, formData.description, formData.category]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    try {
      await onSave(complaint, formData);
      onClose();
    } catch (error) {
      console.error('Error saving complaint:', error);
      setErrors({ submit: error.message || 'Failed to save changes' });
    } finally {
      setIsSaving(false);
    }
  }, [validateForm, onSave, complaint, formData, onClose]);

  if (!isOpen || !complaint) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="popup-backdrop" onClick={onClose} />

      {/* Modal */}
      <div className="popup-panel edit-complaint-modal">
        {/* Header */}
        <div className="popup-header">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <FileText className="w-6 h-6 text-blue-800" />
            </div>
            <div>
              <h3 className="popup-title">Edit Municipal Complaint</h3>
              <p className="text-sm text-blue-700 font-medium">Reference ID: #{complaint._id?.slice(-8) || 'N/A'}</p>
            </div>
          </div>
          <button onClick={onClose} className="popup-close-btn">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="popup-body">
          {/* Error Alert */}
          {errors.submit && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-600 rounded-r-lg flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-red-800">Error Occurred</h4>
                <p className="text-sm text-red-700 mt-1">{errors.submit}</p>
              </div>
            </div>
          )}

          {/* Title */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-800 mb-3 uppercase tracking-wide">
              Complaint Title <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`w-full px-4 py-4 border-2 rounded-lg focus:outline-none focus:ring-3 transition-all font-medium ${
                errors.title 
                  ? 'border-red-400 focus:ring-red-200 bg-red-50' 
                  : 'border-slate-300 focus:ring-blue-200 focus:border-blue-600'
              }`}
              placeholder="Enter detailed complaint title"
            />
            {errors.title && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-2 font-medium">
                <AlertTriangle className="w-4 h-4" />
                {errors.title}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-800 mb-3 uppercase tracking-wide">
              Detailed Description <span className="text-red-600">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="5"
              className={`w-full px-4 py-4 border-2 rounded-lg focus:outline-none focus:ring-3 transition-all resize-none font-medium ${
                errors.description 
                  ? 'border-red-400 focus:ring-red-200 bg-red-50' 
                  : 'border-slate-300 focus:ring-blue-200 focus:border-blue-600'
              }`}
              placeholder="Provide comprehensive details about the complaint"
            />
            {errors.description && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-2 font-medium">
                <AlertTriangle className="w-4 h-4" />
                {errors.description}
              </p>
            )}
          </div>

          {/* Category and Priority */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-3 uppercase tracking-wide">
                Service Category <span className="text-red-600">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`w-full px-4 py-4 border-2 rounded-lg focus:outline-none focus:ring-3 transition-all font-medium ${
                  errors.category 
                    ? 'border-red-400 focus:ring-red-200 bg-red-50' 
                    : 'border-slate-300 focus:ring-blue-200 focus:border-blue-600'
                }`}
              >
                <option value="">Select service category</option>
                <option value="Roads">Roads & Infrastructure</option>
                <option value="Water Supply">Water Supply & Sanitation</option>
                <option value="Electricity">Electricity & Power</option>
                <option value="Garbage">Waste Management</option>
                <option value="Drainage">Drainage & Sewerage</option>
                <option value="Street Lights">Street Lighting</option>
                <option value="Other">Other Municipal Services</option>
              </select>
              {errors.category && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-2 font-medium">
                  <AlertTriangle className="w-4 h-4" />
                  {errors.category}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-800 mb-3 uppercase tracking-wide">
                Priority Level
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-4 py-4 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-3 focus:ring-blue-200 focus:border-blue-600 font-medium"
              >
                <option value="Low">Low Priority</option>
                <option value="Normal">Normal Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="High">High Priority</option>
                <option value="Critical">Critical Priority</option>
              </select>
            </div>
          </div>

          {/* Status */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-800 mb-3 uppercase tracking-wide">
              Complaint Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-4 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-3 focus:ring-blue-200 focus:border-blue-600 font-medium"
            >
              <option value="Submitted">Submitted - Under Review</option>
              <option value="Assigned">Assigned - Officer Allocated</option>
              <option value="In Progress">In Progress - Work Ongoing</option>
              <option value="Resolved">Resolved - Work Completed</option>
              <option value="Closed">Closed - Case Finalized</option>
            </select>
          </div>

          {/* Location Details */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-800 mb-3 uppercase tracking-wide">
              Location Address
            </label>
            <div className="relative">
              <MapPin className="absolute left-4 top-4.5 w-5 h-5 text-slate-500" />
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-4 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-3 focus:ring-blue-200 focus:border-blue-600 font-medium"
                placeholder="Enter complete location address"
              />
            </div>
          </div>

          {/* Ward and Pincode */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-3 uppercase tracking-wide">
                Ward Number
              </label>
              <input
                type="text"
                name="ward"
                value={formData.ward}
                onChange={handleChange}
                className="w-full px-4 py-4 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-3 focus:ring-blue-200 focus:border-blue-600 font-medium"
                placeholder="Ward/Zone number"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-800 mb-3 uppercase tracking-wide">
                Postal Code
              </label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                maxLength="6"
                className="w-full px-4 py-4 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-3 focus:ring-blue-200 focus:border-blue-600 font-medium"
                placeholder="6-digit postal code"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 border-t-2 border-slate-200">
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-blue-800 text-white rounded-lg hover:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed font-bold uppercase tracking-wide transition-all shadow-lg hover:shadow-xl"
            >
              <Save className="w-6 h-6" />
              {isSaving ? 'Updating Record...' : 'Update Complaint'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-8 py-4 bg-white border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 hover:border-slate-400 font-bold uppercase tracking-wide transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </>
  );
});

export default EditComplaintModal;
