const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

const { register, login, updateProfile, changePassword, getCurrentUser, getAllOfficers, getAllCitizens } = require("../controller/authController");

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getCurrentUser);
router.get("/officers", protect, getAllOfficers);
router.get("/citizens", protect, getAllCitizens);
router.put("/update-profile", protect, updateProfile);
router.put("/change-password", protect, changePassword);

module.exports = router;
