const Complaint = require("../models/complaint");

const calculateSLA = (category) => {
  const now = new Date();
  let hours;

  if (category === "Water") hours = 24;
  else if (category === "Electricity") hours = 48;
  else if (category === "Road") hours = 72;
  else hours = 96;
now.setHours(now.getHours() + hours);
  return now;
};

// only citizen can create complaints
exports.createComplaint = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    if (req.user.Role !== "Citizen") {
      console.log(req.user);
      return res.status(403).json({ message: "Only citizens can create complaints", userRole: req.user.Role });
    }
    
    const slaDeadline = calculateSLA(req.body.category);

    const complaint = await Complaint.create({
      ...req.body,
      citizen: req.user.id,
      slaDeadline,
      history: [
        { status: "Submitted", updatedAt: new Date() }
      ]
    });
    res.status(201).json({msg : "Successfully created",complaint});
    
  } catch (error) {
    console.error('Create complaint error:', error);
    res.status(500).json({ message: "Failed!", error: error.message });
  }
};


// only access for admin and officer
exports.getAllComplaints = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    if (req.user.Role !== "Officer" && req.user.Role !== "Admin") {
      return res.status(403).json({ message: "Only officers and Admin can view all complaints", userRole: req.user.Role });
    }
    const complaints = await Complaint.find();
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// only access for admin and officer
exports.updateComplaintStatus = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    if (req.user.Role !== "Officer" && req.user.Role !== "Admin") {
      return res.status(403).json({ message: "Only officers and admins can update complaint status", userRole: req.user.Role });
    }

    const { status } = req.body;

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    complaint.status = status;
    complaint.history.push({
      status,
      updatedAt: new Date()
    });

    await complaint.save();

    res.json({
      message: "Complaint status updated successfully",
      complaint
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.checkEscalations = async (req, res) => {
  try {
    const now = new Date();

    const overdueComplaints = await Complaint.find({
      slaDeadline: { $lt: now },
      status: { $nin: ["Resolved", "Closed"] },
      isEscalated: false
    });

    for (let complaint of overdueComplaints) {
      complaint.isEscalated = true;
      complaint.priority = "High";
      complaint.history.push({
        status: "Escalated",
        updatedAt: new Date()
      });
      await complaint.save();
    }

    res.json({
      message: "Escalation check completed",
      escalatedCount: overdueComplaints.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getComplaintAnalytics = async (req, res) => {
  try {
    if (!req.user || req.user.Role !== "Admin") {
      return res.status(403).json({ message: "Admin access only" });
    }

    const totalComplaints = await Complaint.countDocuments();
    const pendingComplaints = await Complaint.countDocuments({
      status: { $in: ["Submitted", "Assigned", "In Progress"] }
    });
    const resolvedComplaints = await Complaint.countDocuments({
      status: "Resolved"
    });
    const escalatedComplaints = await Complaint.countDocuments({
      isEscalated: true
    });
    const highPriorityComplaints = await Complaint.countDocuments({
      priority: "High"
    });

    res.json({
      totalComplaints,
      pendingComplaints,
      resolvedComplaints,
      escalatedComplaints,
      highPriorityComplaints
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Citizen can track their own complaint
exports.trackComplaint = async (req, res) => {
  try {
    if (!req.user || req.user.Role !== "Citizen") {
      return res.status(403).json({ message: "Only citizens can track complaints" });
    }

    const complaint = await Complaint.findById(req.params.id)
      .populate("assignedOfficer", "name email");

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // Citizen can track only their own complaint
    if (complaint.citizen.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json({
      complaintId: complaint._id,
      status: complaint.status,
      priority: complaint.priority,
      slaDeadline: complaint.slaDeadline,
      isEscalated: complaint.isEscalated,
      assignedOfficer: complaint.assignedOfficer,
      history: complaint.history
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

