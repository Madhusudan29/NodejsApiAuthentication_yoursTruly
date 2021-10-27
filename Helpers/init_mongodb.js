const mongoose = require("mongoose");

mongoose
  .connect("mongodb://localhost:27017/NodejsApiAuthentication")
  .then(() => console.log(`MongoDb Connected`))
  .catch((error) => console.log(`MongodbConnectionError`));

mongoose.connection.on("connected", () => {
  console.log("Mongoose connected to DataBase");
});
mongoose.connection.on("error", (error) => {
  console.log(error.message);
});
mongoose.connection.on("disconnected", () => {
  console.log("Mongoose connection is disconnected");
});
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  process.exit(0);
});
