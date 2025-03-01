const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRole");
const doctorAuth = require("../middleware/doctorAuth");
const {
  bookAppointment,
  getAppointmentAtADoctor,
  getAppointmentOfUser,
  getAllAppointments,
  deleteAppointment,
  updateAppointmentStatus,
  addRecord,
  getRecord,
} = require("../controllers/appointmentController");

router.post("/appointments/book/:id", protect, bookAppointment);
router.get("/doctor/:doctorId", protect, getAppointmentAtADoctor);
router.get("/my-appointments", protect, getAppointmentOfUser);
router.get("/all-appointments", protect, getAllAppointments);
router.delete("/appointment/:id", protect, deleteAppointment);
router.put("/appointments/:appointmentId", protect, updateAppointmentStatus);
router.post("/record",protect,addRecord);
router.get("/record/:appointmentId",protect,getRecord);


module.exports = router;
