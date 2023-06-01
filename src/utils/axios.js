const https = require("https");
const axios = require("axios");

module.exports = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
  }),
});
