const doctorAuth = (req, res, next) => {
    if (req.user.role !== "doctor" || req.user.doctorInfo.status !== "active") {
      return res.status(403).json({ message: "Access denied. You are not a verified doctor." });
    }
    next();
  };
  
  
  module.exports = doctorAuth;
  