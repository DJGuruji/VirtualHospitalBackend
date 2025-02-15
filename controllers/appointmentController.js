const express = require("express");
const multer = require("multer");
const User = require("../models/User");
const path = require("path");
const Appointment = require("../models/Appointment");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");

const timeSlots = [
    "09:00 AM - 10:00 AM",
    "11:00 AM - 12:00 AM",
    "02:00 PM - 03:00 PM",
    "04:00 PM - 05:00 PM",
    "07:00 PM - 08:00 PM",
  ];




  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER, 
      pass: process.env.EMAIL_PASS, 
    },
  });


  const sendEmail = (to, subject, text) => {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to,
      subject,
      text,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error("Error sending email:", err);
      } else {
        console.log("Email sent:", info.response);
      }
    });
  };


const bookAppointment = async (req, res) => {
  try {
    const {
      doctorId,
      date,
      timeSlot,
      patientName,
      patientEmail,
      patientMobile,
    } = req.body;
    const doctor = await User.findById(doctorId);

    if (!doctor || doctor.role !== "doctor") {
      return res.status(404).json({ message: "Doctor not found" });
    }

    if (!timeSlots.includes(timeSlot)) {
      return res.status(400).json({ message: "Invalid time slot" });
    }

    const existingAppointments = await Appointment.countDocuments({
      doctor: doctorId,
      date,
      timeSlot,
    });
    if (existingAppointments >= 4) {
      return res
        .status(400)
        .json({
          message: "This slot is fully booked. Please select another time.",
        });
    }

    const appointment = await Appointment.create({
      user: req.user._id,
      doctor: doctorId,
      patientName: patientName || req.user.name,
      patientEmail: patientEmail || req.user.email,
      patientMobile: patientMobile || req.user.mobile,
      date,
      timeSlot,
    });
  
 // Send email to the user with appointment details and current status ("pending")
 const recipientEmail = appointment.patientEmail;
 const emailSubject = "Appointment Booked Successfully";
 const emailText = `Dear ${appointment.patientName || req.user.name},

Your appointment with Dr. ${doctor.name} has been booked for ${appointment.date} at ${appointment.timeSlot}.
Current Status: ${appointment.status} (pending).

We will notify you once your appointment is confirmed.

Thank you.`;
 sendEmail(recipientEmail, emailSubject, emailText);



    res
      .status(201)
      .json({ message: "Appointment booked successfully", appointment });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};



const getAppointmentAtADoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const appointments = await Appointment.find({ doctor: doctorId }).populate(
      "user",
      "name email"
    );
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const getAppointmentOfUser = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      user: req.user._id,
    }).populate("doctor", "name specialization");
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};


const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({})
      .populate("doctor", "name specialization")
      .populate("user", "name email");
    res.status(200).json({ appointments });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the appointment by ID
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }


    const recipientEmail = appointment.patientEmail;
    const emailSubject = "Appointment Cancelled";
    const emailText = `Dear ${appointment.patientName},
    
Your appointment scheduled on ${appointment.date} at ${appointment.timeSlot} has been cancelled.

If you have any questions, please contact us.

Thank you.`;



    await Appointment.findByIdAndDelete(id);

    res.status(200).json({ message: "Appointment deleted successfully" });
  } catch (error) {
    console.error("Error deleting appointment:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};





// Update Appointment Status Controller
const updateAppointmentStatus = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ["pending", "confirmed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    // Find and update appointment
    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { status },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Send email notifying about the status change
    const recipientEmail = appointment.patientEmail;
    const emailSubject = "Appointment Status Updated";
    const emailText = `Dear ${appointment.patientName},
    
The status of your appointment scheduled on ${appointment.date} at ${appointment.timeSlot} has been updated to "${appointment.status}".

Thank you.`;
    sendEmail(recipientEmail, emailSubject, emailText);

    res.status(200).json({
      message: "Appointment status updated",
      appointment,
    });
  } catch (error) {
    console.error("Error updating appointment status:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  bookAppointment,
  getAppointmentAtADoctor,
  getAppointmentOfUser,
  getAllAppointments,
  deleteAppointment,
  updateAppointmentStatus,
};
