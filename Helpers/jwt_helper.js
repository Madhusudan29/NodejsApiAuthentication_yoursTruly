const jwt = require("jsonwebtoken");
const createErrors = require("http-errors");
const client = require("./init_redis");

module.exports = {
  signAccessToken: (data) => {
    return new Promise((resolve, reject) => {
      jwt.sign(
        {},
        process.env.ACCESS_TOKEN_SECRET,
        {
          expiresIn: "20s",
          issuer: "madhusudanthabde.com",
          audience: data,
        },
        (err, token) => {
          if (err) {
            console.log(err.message);
            // reject(err);
            return reject(createErrors.InternalServerError());
          }
          resolve(token);
        }
      );
    });
  },
  signRefreshToken: (data) => {
    return new Promise((resolve, reject) => {
      jwt.sign(
        {},
        process.env.REFRESH_TOKEN_SECRET,
        {
          expiresIn: "1h",
          issuer: "madhusudanthabde.com",
          audience: data,
        },
        (err, token) => {
          if (err) {
            console.log(err.message);
            // reject(err);
            return reject(createErrors.InternalServerError());
          }
          client.set(data, token, "EX", 60 * 60, (err, reply) => {
            if (err) {
              console.log(err);
              reject(createErrors.InternalServerError());
              return;
            }
            resolve(token);
          });
        }
      );
    });
  },
  verifyAccesToken: (req, res, next) => {
    if (!req.headers["authorization"]) return next(createErrors.Unauthorized());
    const authHeader = req.headers["authorization"];
    const bearerToken = authHeader.split(" ");
    const token = bearerToken[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
      if (err) {
        //   if (err.name === "JsonWebTokenError") {
        //     return next(createErrors.Unauthorized());
        //   } else {
        //     return next(createErrors.Unauthorized(err.message));
        //    }
        const message =
          err.name === "JsonWebTokenError" ? "Unauthorized" : err.message;
        return next(createErrors.Unauthorized(message));
      }
      req.payload = payload;
      next();
    });
  },
  verifyRefreshToken: (refreshToken) => {
    return new Promise((resolve, reject) => {
      jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, payload) => {
          if (err) return reject(createErrors.Unauthorized());
          const userId = payload.aud;
          client.get(userId, (err, result) => {
            if (err) {
              console.log(err);
              reject(createErrors.InternalServerError());
              return;
            }
            if (refreshToken === result) return resolve(userId);
            reject(createErrors.Unauthorized());
          });
        }
      );
    });
  },
  //   req.headers["authorization"]
};
