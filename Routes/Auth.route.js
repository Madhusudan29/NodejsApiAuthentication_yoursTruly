const express = require("express");
const Router = express.Router();
const createErrors = require("http-errors");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require("../Helpers/jwt_helper");
const { authSchema } = require("../Helpers/validationSchema");
const User = require("../Models/User.Module");
const client = require("../Helpers/init_redis");

Router.post("/register", async (req, res, next) => {
  try {
    // const { email, password } = req.body;
    // if (!email || !password) throw createErrors.BadRequest();
    const result = await authSchema.validateAsync(req.body);
    // console.log(result);
    const oldUser = await User.findOne({ email: result.email });
    if (oldUser)
      throw createErrors.Conflict(
        `${result.email} has already been registered.`
      );
    const newUser = new User(result);
    const savedUser = await newUser.save();
    const accessToken = await signAccessToken(savedUser.id);
    const refreshToken = await signRefreshToken(savedUser.id);
    res.send({ user: savedUser, accessToken, refreshToken });
  } catch (error) {
    if (error.isJoi) error.status = 422;
    console.log(error);
    next(error);
  }
});

Router.post("/login", async (req, res, next) => {
  try {
    const validate = await authSchema.validateAsync(req.body);
    const foundUser = await User.findOne({ email: validate.email });
    if (!foundUser)
      throw createErrors.NotFound(
        `User with ${validate.email} has yet not been registerd`
      );
    const isMatchPassword = await foundUser.isValidPassword(validate.password);
    if (!isMatchPassword)
      throw createErrors.NotFound(`Username/ Password InValid`);
    const accessToken = await signAccessToken(foundUser.id);
    const refreshToken = await signRefreshToken(foundUser.id);
    res.send({ user: foundUser, accessToken, refreshToken });
  } catch (error) {
    if (error.isJoi)
      return next(createErrors.BadRequest("Invalid Username/ Password"));
    next(error);
  }
});

Router.post("/refresh-token", async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken)
      throw createErrors.BadRequest("Refresh Token Not Provided");
    const userId = await verifyRefreshToken(refreshToken);
    const accessToken = await signAccessToken(userId);
    const refreshToken2 = await signRefreshToken(userId);
    res.send({ accessToken, refreshToken: refreshToken2 });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

Router.delete("/logout", async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw createErrors.BadRequest();
    const userId = await verifyRefreshToken(refreshToken);
    client.del(userId, (err, val) => {
      if (err) {
        console.log(err.message);
        throw createErrors.InternalServerError();
      }
      res.sendStatus(204);
    });
  } catch (error) {
    next(error);
  }
});

//
module.exports = Router;
