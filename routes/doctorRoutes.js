const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRole");
const doctorAuth = require("../middleware/doctorAuth");
const {
  doctorRegistration,
  verifyDoctor,
  upload ,
} = require("../controllers/doctorController");



router.post("/apply-doctor", upload,protect, doctorRegistration);
router.put('/verify-doctor/:id', protect, authorizeRoles('admin'), verifyDoctor);


module.exports = router;

