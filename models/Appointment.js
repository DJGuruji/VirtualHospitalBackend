const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // User who booked
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Doctor ID
  patientName: { type: String, default: null }, // For "Book for Others"
  patientEmail: { type: String, default: null },
  patientMobile: { type: String, default: null },
  date: { type: String, required: true }, // Appointment date (YYYY-MM-DD)
  timeSlot: { type: String, required: true }, // Time Slot (e.g., "10:00 AM - 11:00 AM")
  status: { type: String, enum: ["pending", "confirmed", "cancelled","rejected"], default: "pending" },
});

const Appointment = mongoose.model("Appointment", appointmentSchema);

module.exports = Appointment;
