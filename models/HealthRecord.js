const mongoose = require("mongoose");

const healthRecordSchema = new mongoose.Schema({
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", required: true },
  patientName: { type: String, required: true },
  doctorName: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  disease: [{ type: String }], 
  drugs: [{ type: String }], 
});

const HealthRecord = mongoose.model("HealthRecord", healthRecordSchema);
module.exports = HealthRecord;
