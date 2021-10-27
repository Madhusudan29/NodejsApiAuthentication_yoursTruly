const express = require("express");
const morgan = require("morgan");
const createErrors = require("http-errors");
require("dotenv").config();
const app = express();
const Port = process.env.PORT || 3200;
require("./Helpers/init_mongodb");

const AuthRoute = require("./Routes/Auth.route");
const { verifyAccesToken } = require("./Helpers/jwt_helper");

app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use("/auth", AuthRoute);

app.get("/", verifyAccesToken, async (req, res, next) => {
  res.send("Hello from NodejsApiAuthentication");
});

app.use(async (req, res, next) => {
  // We can write it manually but we are using package
  //   const error = new Error("Not Found");
  //   error.status = 404;
  //   next(error);
  next(createErrors.NotFound("Route Not Found"));
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send({
    error: {
      status: err.status || 500,
      message: err.message,
    },
  });
});
app.listen(Port, () => console.log(`Serving http://localhost:${Port}`));
