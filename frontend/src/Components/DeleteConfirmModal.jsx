import React from 'react';
import { X, Trash2, AlertTriangle } from 'lucide-react';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, complaint, isDeleting = false }) => {
  if (!isOpen || !complaint) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="popup-backdrop" onClick={onClose} />

      {/* Modal */}
      <div className="popup-panel delete-confirm-modal">
        {/* Header */}
        <div className="popup-header bg-red-50 border-b-2 border-red-600">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-lg border border-red-200">
              <AlertTriangle className="w-6 h-6 text-red-700" />
            </div>
            <h3 className="popup-title text-red-900">Official Deletion Confirmation</h3>
          </div>
          <button onClick={onClose} className="popup-close-btn" disabled={isDeleting}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="popup-body">
          <div className="text-center py-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-red-200">
              <Trash2 className="w-10 h-10 text-red-700" />
            </div>
            
            <h4 className="text-2xl font-bold text-slate-900 mb-4 uppercase tracking-wide">
              Permanent Record Deletion
            </h4>
            
            <div className="bg-slate-50 border-2 border-slate-200 rounded-lg p-5 mb-6 text-left">
              <p className="text-sm text-slate-700 mb-3 font-bold uppercase tracking-wide">
                Complaint Record:
              </p>
              <p className="text-lg font-bold text-slate-900 mb-4">
                {complaint.title}
              </p>
              <p className="text-sm text-slate-600 font-medium">
                Reference ID: #{complaint._id?.slice(-8) || 'N/A'}
              </p>
            </div>

            <div className="bg-red-50 border-l-4 border-red-600 rounded-r-lg p-5 mb-6">
              <div className="flex items-start gap-4">
                <AlertTriangle className="w-6 h-6 text-red-700 flex-shrink-0 mt-1" />
                <div className="text-left">
                  <p className="text-base font-bold text-red-900 mb-2 uppercase tracking-wide">
                    ⚠️ IRREVERSIBLE ACTION WARNING
                  </p>
                  <p className="text-sm text-red-800 leading-relaxed">
                    This action will permanently remove all complaint data, attachments, communication history, 
                    and audit trail from the municipal database. This operation cannot be undone.
                  </p>
                </div>
              </div>
            </div>

            <p className="text-base text-slate-700 mb-8 font-medium">
              Do you authorize the permanent deletion of this municipal complaint record?
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 border-t-2 border-slate-200">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 px-8 py-4 bg-white border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 hover:border-slate-400 font-bold uppercase tracking-wide transition-all"
            >
              Cancel Operation
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-red-700 text-white rounded-lg hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed font-bold uppercase tracking-wide transition-all shadow-lg hover:shadow-xl"
            >
              <Trash2 className="w-6 h-6" />
              {isDeleting ? 'Deleting Record...' : 'Authorize Deletion'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default DeleteConfirmModal;
