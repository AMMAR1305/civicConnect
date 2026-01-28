const express = require("express");
const router = express.Router();
const {createComplaint,getAllComplaints,updateComplaintStatus,checkEscalations, 
    getComplaintAnalytics,trackComplaint } = require("../controller/complaintController");
const { protect, role } = require("../middleware/authMiddleware");

router.post("/createcomplaint", protect, createComplaint);
router.get("/getcomplaints", protect,getAllComplaints);
router.put("/getupdatestatus/:id",protect,updateComplaintStatus);
router.get("/check-escalations", protect,checkEscalations);
router.get("/analytics",protect,getComplaintAnalytics);
router.get("/track/:id",protect,trackComplaint);

module.exports = router;
