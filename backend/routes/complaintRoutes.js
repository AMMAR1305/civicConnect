const express = require("express");
const router = express.Router();
const {createComplaint,getAllComplaints,updateComplaintStatus,checkEscalations, 
    getComplaintAnalytics,trackComplaint, getMyComplaints, getComplaintById, updateComplaint, 
    deleteComplaint, bulkUpdateByLocation, getComplaintsByLocation } = require("../controller/complaintController");
const { protect, role } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

router.post("/createcomplaint", protect, upload.single('photo'), createComplaint);
router.get("/getcomplaints", protect,getAllComplaints);
router.get("/my", protect, getMyComplaints);
router.put("/getupdatestatus/:id",protect,updateComplaintStatus);
router.get("/check-escalations", protect,checkEscalations);
router.get("/analytics",protect,getComplaintAnalytics);
router.get("/track/:id",protect,trackComplaint);
router.get("/:id", protect, getComplaintById);

// Admin-only routes
router.put("/:id", protect, updateComplaint);
router.delete("/:id", protect, deleteComplaint);

// Bulk operations
router.post("/bulk-update", protect, bulkUpdateByLocation);
router.get("/by-location", protect, getComplaintsByLocation);

module.exports = router;
