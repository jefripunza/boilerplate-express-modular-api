const axios = require("../utils/axios");

const {
  REPORT_ERROR_URL,
  REPORT_BEARER_TOKEN,
  REPORT_GROUP_ID,

  NODE_ENV,
  isLocal,
} = require("../config");

/**
 * @param {string} message
 */
exports.sendErrorLog = async (message) => {
  return await axios({
    url: REPORT_ERROR_URL,
    method: "POST",
    headers: {
      Authorization: `Bearer ${REPORT_BEARER_TOKEN}`,
    },
    data: {
      group_id: REPORT_GROUP_ID,
      message,
    },
  }).then((result) => result.data);
};

const margin =
  "=========================================================\n=========================================================\n=========================================================";

exports.StartLogging = () => {
  if (!isLocal) {
    this.sendErrorLog(
      `${margin}\n\nServer is Running on ${NODE_ENV}!\n\n${margin}`
    );
  }
  process.on("uncaughtException", (error) => {
    console.error(error);
    if (!isLocal) this.sendErrorLog(`ENV: ${NODE_ENV}\n${error.stack}`);
  });
};
