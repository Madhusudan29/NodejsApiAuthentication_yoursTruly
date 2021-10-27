const redis = require("redis");
const client = redis.createClient();

client.on("connect", function () {
  console.error("RedisClient connected to redis");
});

client.on("ready", function () {
  console.log("RedisClient connected to redis and ready to use..");
});

client.on("error", function (error) {
  console.error(error.message);
});

client.on("end", function () {
  console.error("RedisClient disconnected from redis");
});

module.exports = client;
