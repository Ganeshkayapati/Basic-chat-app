const mongoose=require("mongoose");
const {DB_URL}=require("./server-config.js")



mongoose.connect(DB_URL)
  .then(() => {
    console.log('MongoDB connected');
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
  });


