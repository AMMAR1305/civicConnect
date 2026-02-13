import React, { useState } from 'react';
import { X, Shield, Check, User, Mail } from 'lucide-react';

const ReassignModal = ({ isOpen, onClose, complaint, officers, onReassign }) => {
  const [selectedOfficer, setSelectedOfficer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOfficer) {
      alert('Please select an officer');
      return;
    }

    setIsSubmitting(true);
    try {
      await onReassign(complaint, selectedOfficer);
      onClose();
      setSelectedOfficer('');
    } catch (error) {
      console.error('Reassignment failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !complaint) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="popup-backdrop" onClick={onClose} />

      {/* Modal */}
      <div className="popup-panel reassign-modal">
        <div className="popup-header">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <Shield className="w-6 h-6 text-blue-800" />
            </div>
            <h3 className="popup-title">Official Case Reassignment</h3>
          </div>
          <button onClick={onClose} className="popup-close-btn">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="popup-body">
          {/* Complaint Info */}
          <div className="mb-8 p-6 bg-slate-50 rounded-lg border-2 border-slate-200">
            <h4 className="font-bold text-slate-900 mb-3 text-lg">{complaint.title}</h4>
            <p className="text-sm text-slate-700 mb-4 leading-relaxed">{complaint.description?.slice(0, 150)}...</p>
            <div className="flex gap-3 text-sm">
              <span className="px-3 py-2 bg-blue-100 text-blue-800 rounded-lg border border-blue-300 font-semibold">{complaint.category}</span>
              <span className="px-3 py-2 bg-orange-100 text-orange-800 rounded-lg border border-orange-300 font-semibold">{complaint.priority || 'Normal'} Priority</span>
            </div>
          </div>

          {/* Officer Selection */}
          <form onSubmit={handleSubmit}>
            <div className="mb-8">
              <label className="block text-sm font-bold text-slate-800 mb-4 uppercase tracking-wide">
                Select Municipal Officer for Assignment:
              </label>
              
              <div className="space-y-4 max-h-80 overflow-y-auto border border-slate-200 rounded-lg p-2">
                {officers.map((officer) => (
                  <div 
                    key={officer._id}
                    className={`p-5 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedOfficer === officer._id
                        ? 'border-blue-600 bg-blue-50 shadow-md transform scale-[1.02]'
                        : 'border-slate-300 bg-white hover:border-slate-400 hover:shadow-sm hover:bg-slate-50'
                    }`}
                    onClick={() => setSelectedOfficer(officer._id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-700 to-blue-800 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md border-2 border-blue-600">
                        {officer.Name?.charAt(0)?.toUpperCase() || 'O'}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-slate-900 text-lg">{officer.Name}</p>
                        <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                          <Mail className="w-4 h-4" />
                          <span className="font-medium">{officer.Email}</span>
                        </div>
                        {officer.specializations && officer.specializations.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {officer.specializations.slice(0, 3).map((spec, idx) => (
                              <span key={idx} className="px-3 py-1 bg-green-100 text-green-800 rounded-lg text-sm border border-green-300 font-semibold">
                                {spec}
                              </span>
                            ))}
                            {officer.specializations.length > 3 && (
                              <span className="px-3 py-1 bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold">
                                +{officer.specializations.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      {selectedOfficer === officer._id && (
                        <div className="p-2 bg-blue-600 rounded-full">
                          <Check className="w-6 h-6 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {officers.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  <User className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                  <p className="text-lg font-semibold">No Officers Available</p>
                  <p className="text-sm mt-1">Contact administration for officer assignment</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6 border-t-2 border-slate-200">
              <button
                type="submit"
                disabled={!selectedOfficer || isSubmitting}
                className="flex-1 px-8 py-4 bg-blue-800 text-white rounded-lg hover:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed font-bold uppercase tracking-wide transition-all shadow-lg hover:shadow-xl"
              >
                {isSubmitting ? 'Processing Assignment...' : 'Authorize Reassignment'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-8 py-4 bg-white border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 hover:border-slate-400 font-bold uppercase tracking-wide transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ReassignModal;