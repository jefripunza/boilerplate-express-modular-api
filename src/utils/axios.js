const https = require("https");
const axios = require("axios");

const axiosInstance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
  }),
});
axiosInstance.defaults.headers["Content-type"] = "application/json";
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) =>
    Promise.reject(
      (error.response && error.response.data) || "Something went wrong!"
    )
);

module.exports = axiosInstance;
