const Complaint = require("../models/complaint");
const User = require("../models/user");

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

// Auto-assign officer based on workload
const autoAssignOfficer = async () => {
  try {
    console.log('🔍 Finding best officer for assignment...');
    
    // Get all officers
    const officers = await User.find({ Role: 'Officer' });
    
    if (officers.length === 0) {
      console.log('⚠️ No officers found in system');
      return null;
    }
    
    console.log(`✓ Found ${officers.length} officer(s)`);
    
    // Get complaint count for each officer
    const officerWorkloads = await Promise.all(
      officers.map(async (officer) => {
        const activeComplaints = await Complaint.countDocuments({
          assignedOfficer: officer._id,
          status: { $nin: ['Resolved', 'Closed'] }
        });
        return {
          officer,
          workload: activeComplaints
        };
      })
    );
    
    // Sort by workload (ascending) - officer with least work gets the complaint
    officerWorkloads.sort((a, b) => a.workload - b.workload);
    
    const selectedOfficer = officerWorkloads[0].officer;
    console.log(`✓ Selected officer: ${selectedOfficer.Name} (${selectedOfficer.Email})`);
    console.log(`  Current workload: ${officerWorkloads[0].workload} active complaints`);
    
    return selectedOfficer._id;
  } catch (error) {
    console.error('❌ Error in auto-assign:', error);
    return null;
  }
};

// only citizen can create complaints
exports.createComplaint = async (req, res) => {
  try {
    console.log('\n📝 === CREATE COMPLAINT REQUEST ===');
    console.log('📥 User:', req.user ? `${req.user.Email} (${req.user.Role})` : 'No user');
    console.log('📥 Request body:', JSON.stringify(req.body, null, 2));
    console.log('📥 File uploaded:', req.file ? req.file.filename : 'No file');
    
    if (!req.user) {
      console.log('❌ No user in request - authentication failed');
      return res.status(401).json({ message: "Authentication required" });
    }
    
    if (req.user.Role !== "Citizen") {
      console.log(`❌ Wrong role: ${req.user.Role} (only Citizens can create complaints)`);
      return res.status(403).json({ message: "Only citizens can create complaints", userRole: req.user.Role });
    }
    
    console.log('✓ User authenticated as Citizen');
    console.log('🕐 Calculating SLA deadline for category:', req.body.category);
    
    const slaDeadline = calculateSLA(req.body.category);
    console.log('✓ SLA deadline:', slaDeadline);

    // Auto-assign to officer
    console.log('🤖 Auto-assigning officer...');
    const assignedOfficerId = await autoAssignOfficer();
    
    if (assignedOfficerId) {
      console.log('✓ Officer auto-assigned successfully');
    } else {
      console.log('⚠️ No officer assigned (no officers available)');
    }

    // If photo was uploaded, store the file path
    const complaintData = {
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      landmark: req.body.landmark,
      area: req.body.area,
      district: req.body.district,
      state: req.body.state,
      pincode: req.body.pincode,
      location: req.body.location,
      address: req.body.address,
      priority: req.body.priority,
      priorityReason: req.body.priorityReason || null,
      suggestedDepartment: req.body.suggestedDepartment || null,
      citizen: req.user.id,
      assignedOfficer: assignedOfficerId, // Auto-assigned officer
      slaDeadline,
      history: [
        { status: "Submitted", updatedAt: new Date() }
      ]
    };

    // Add photo path if file was uploaded
    if (req.file) {
      complaintData.photo = `/uploads/${req.file.filename}`;
      console.log('✓ Photo attached:', complaintData.photo);
    }

    console.log('💾 Saving complaint to database...');
    const complaint = await Complaint.create(complaintData);
    
    console.log('✅ COMPLAINT CREATED SUCCESSFULLY!');
    console.log(`   - ID: ${complaint._id}`);
    console.log(`   - Title: ${complaint.title}`);
    console.log(`   - Category: ${complaint.category}`);
    console.log(`   - Status: ${complaint.status}`);
    console.log(`   - Priority: ${complaint.priority}`);
    console.log('================================\n');
    
    res.status(201).json({msg : "Successfully created",complaint});
    
  } catch (error) {
    console.error('\n❌ === CREATE COMPLAINT ERROR ===');
    console.error('Error type:', error.name);
    console.error('Error message:', error.message);
    console.error('Full error:', error);
    console.error('===============================\n');
    res.status(500).json({ message: "Failed!", error: error.message });
  }
};


// only access for admin and officer
exports.getAllComplaints = async (req, res) => {
  try {
    if (!req.user) {
      console.log("❌ getAllComplaints: No user in request");
      return res.status(401).json({ message: "Authentication required" });
    }
    console.log(`📋 getAllComplaints: User ${req.user.Email} (${req.user.Role}) requesting complaints`);
    
    if (req.user.Role !== "Officer" && req.user.Role !== "Admin") {
      console.log(`❌ Unauthorized role: ${req.user.Role}`);
      return res.status(403).json({ message: "Only officers and Admin can view all complaints", userRole: req.user.Role });
    }
    
    // Officers see only their assigned complaints
    // Admins see all complaints
    let query = {};
    if (req.user.Role === "Officer") {
      query.assignedOfficer = req.user.id;
      console.log(`🔍 Filtering complaints for officer: ${req.user.id}`);
    }
    
    const complaints = await Complaint.find(query)
      .populate('citizen', 'Name Email')
      .populate('assignedOfficer', 'Name Email')
      .sort({ createdAt: -1 });
      
    console.log(`✅ Found ${complaints.length} complaints for ${req.user.Role}`);
    if (complaints[0]) {
      console.log(`📊 Sample complaint:`, {
        id: complaints[0]._id,
        title: complaints[0]._title,
        status: complaints[0].status,
        category: complaints[0].category,
        assignedTo: complaints[0].assignedOfficer?.Name || 'Unassigned'
      });
    }
    
    res.json(complaints);
  } catch (error) {
    console.error("❌ getAllComplaints error:", error);
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
    const slaBreachedComplaints = await Complaint.countDocuments({
      slaDeadline: { $lt: new Date() },
      status: { $nin: ["Resolved", "Closed"] }
    });
    const highPriorityComplaints = await Complaint.countDocuments({
      priority: "High"
    });

    res.json({
      total: totalComplaints,
      totalComplaints,
      pending: pendingComplaints,
      pendingComplaints,
      resolved: resolvedComplaints,
      resolvedComplaints,
      escalated: escalatedComplaints,
      escalatedComplaints,
      slaBreached: slaBreachedComplaints,
      highPriority: highPriorityComplaints,
      highPriorityComplaints
    });
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Citizen can get all their own complaints
exports.getMyComplaints = async (req, res) => {
  try {
    if (!req.user || req.user.Role !== "Citizen") {
      return res.status(403).json({ message: "Only citizens can view their complaints" });
    }

    const complaints = await Complaint.find({ citizen: req.user.id })
      .populate("assignedOfficer", "Name Email")
      .sort({ createdAt: -1 });

    res.json(complaints);
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

// Officer/Admin can view any complaint details
exports.getComplaintById = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    if (req.user.Role !== "Officer" && req.user.Role !== "Admin") {
      return res.status(403).json({ message: "Only officers and admins can view complaint details" });
    }

    const complaint = await Complaint.findById(req.params.id)
      .populate("assignedOfficer", "Name Email")
      .populate("citizen", "Name Email ContactNumber");

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

