const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });

    if (connection) {
      console.log('Connected to DB!');
    }
  } catch (err) {
    console.error(`MongoDB Connection error: ${err.message}`);

    //Exit the process with failure
    process.exit(1);
  }
};

module.exports = connectDB;
