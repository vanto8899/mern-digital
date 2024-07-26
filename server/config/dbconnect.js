const { default: mongoose } = require("mongoose");
mongoose.set("strictQuery", false);

const dbConnect = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    if (conn.connection.readyState === 1) {
      console.log("Database connected successfully");
    } else {
      console.log("Database connection failed");
    }
  } catch (error) {
    console.log("Database connection failed");
    throw new Error(error);
  }
};

module.exports = dbConnect;
