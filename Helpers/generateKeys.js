const crypto = require("crypto");

const key1 = crypto.randomBytes(32).toString("base64url");
const key2 = crypto.randomBytes(32).toString("base64url");
console.table({ key1, key2 });
