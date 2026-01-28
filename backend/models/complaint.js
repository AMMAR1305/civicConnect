const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    category: String,
    status: {
    type: String,
    enum: ["Submitted", "Assigned", "In Progress", "Resolved", "Closed"],
    default: "Submitted"
  },
  citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
     assignedOfficer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
    slaDeadline: {
      type: Date
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium"
    },
    isEscalated: {
      type: Boolean,
      default: false
    },
    history: [
  {
    status: String,
    updatedAt: Date
  }
]

  },
  { timestamps: true }
);

module.exports = mongoose.model("Complaint", complaintSchema);
