const express = require('express');
const multer = require('multer');
const User = require('../models/User');
const path = require("path");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
const router = express.Router();


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  
  const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'doctors',
      resource_type: 'image',
    },
  });


  const upload = multer({
    storage: storage,
    limits: { fileSize: 5000000 },
    fileFilter: function (req, file, cb) {
      const filetypes = /jpeg|jpg|png/;
      const extname = filetypes.test(
        path.extname(file.originalname).toLowerCase()
      );
      const mimetype = filetypes.test(file.mimetype);
  
      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb("Error: Images only!");
      }
    },
  }).fields([
    { name: "certificate", maxCount: 1 }, 
    { name: "registrationCertificate", maxCount: 1 }, 
    { name: "additionalDegreeCertificate", maxCount: 5 }

  ]);

  


  const doctorRegistration = async (req, res) => {
    try {
   
        const {
          title,
          degree,
          additionalDegree, // Array of degrees
          specialization,
          registerNumber,
          consultingPlace,
          consultingCenter,
        } = req.body;
  
        if (!specialization || !registerNumber || !consultingPlace || !consultingCenter || !degree) {
          return res.status(400).json({ message: "All required fields must be filled" });
        }
  
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: "User not found" });
        if (user.role === "doctor") return res.status(400).json({ message: "Already a doctor" });
  
        // Check if the register number already exists
        const existingDoctor = await User.findOne({ "doctorInfo.registerNumber": registerNumber });
        if (existingDoctor) {
          return res.status(400).json({ message: "Register number already in use" });
        }
  
        // Process file uploads
        const certificatePath = req.files?.certificate?.[0]?.path || "";
        const registrationCertificatePath = req.files?.registrationCertificate?.[0]?.path || "";
        const additionalDegreeCertificates = req.files?.additionalDegreeCertificate
          ? req.files.additionalDegreeCertificate.map((file) => file.path)
          : [];
        
  
        user.doctorInfo = {
          title,
          degree,
          additionalDegree: Array.isArray(additionalDegree) ? additionalDegree : [additionalDegree],
          additionalDegreeCertificate: additionalDegreeCertificates,
          certificate: certificatePath,
          registrationCertificate: registrationCertificatePath,
          specialization,
          registerNumber,
          consultingCenter,
          consultingPlace,
          status: "pending",
        };
  
        // user.role = "doctor"; 
        await user.save();
  
        res.status(200).json({ message: "Doctor request submitted", doctorInfo: user.doctorInfo });
      
    } catch (error) {
      res.status(500).json({ message: "Server Error", error });
      console.log(error)
    }
  };
  
  
  



  const verifyDoctor = async (req, res) => {
    try {
      const { status } = req.body; 
      if (!['active', 'block', 'pending'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }
  
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ message: 'User not found' });
  
      user.doctorInfo.status = status;
  
      // Set role based on status
      user.role = status === 'active' ? 'doctor' : 'user';
  
      await user.save();
      res.status(200).json({ message: `Doctor status updated to ${status}` });
  
    } catch (error) {
      res.status(500).json({ message: 'Server Error', error });
    }
  };
  



  module.exports = {
    doctorRegistration,
    verifyDoctor,
    upload,
  };