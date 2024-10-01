const mongodb = require("mongoose");

const connectToMongo = () => {
  console.log(process.env.MONGO_URL);
  mongodb
    .connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("Connected to MongoDB Atlas");
    })
    .catch((error) => {
      console.error("Error connecting to MongoDB Atlas:", error);
    });
};

module.exports = connectToMongo;
