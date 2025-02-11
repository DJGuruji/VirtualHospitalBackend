
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const dbURI = process.env.NODE_ENV === 'production' 
      ? process.env.MONGO_CLUSTER_URI 
      : process.env.MONGO_LOCAL_URI;  

    await mongoose.connect(dbURI);
    console.log(`MongoDB Connected: ${process.env.NODE_ENV === 'production' ? 'Cluster' : 'Localhost'}`);
  } catch (err) {
    console.error('MongoDB Connection Error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;

