const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware"); // ✅ correct
const { getProfile, updateProfile } = require("../controllers/userController"); // ✅ correct

// GET user profile
router.get("/profile", protect, getProfile);

// PUT user profile update
router.put("/profile", protect, updateProfile);

module.exports = router;
