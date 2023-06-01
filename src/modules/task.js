const express = require("express");
const router = express.Router();
const app = express.Router();

const {
  TZ,
  isDevelopment,
  isProduction,
  transaction_status,
} = require("../config");

const { filterDataByWeek } = require("../helpers/data");

const token_validation = require("../middlewares/token_validation");
const only_superman = require("../middlewares/only_superman");

const cron = require("node-cron");
/**
 * @type{cron.ScheduleOptions}
 */
const options = {
  scheduled: false,
  timezone: TZ,
};
/**
 * @param {string} cronExpression
 * @param {function} func
 * @returns
 */
const schedule = (cronExpression, func) =>
  cron.schedule(cronExpression, func, options);
const tasks = {};

const { Database } = require("../apps/knex");
const { tables } = require("../config");

// ==========================================================================
// ==========================================================================

tasks["test"] = {
  task: schedule("* * * * *", async () => {
    const now = new Date();
    console.log("running test task...", { now: now.toLocaleString() });
  }),
  status: isDevelopment || isProduction ? false : true,
};

// ==========================================================================
// ==========================================================================

Object.keys(tasks).forEach((key) => {
  if (tasks[key].status) {
    tasks[key].task.start();
    console.log(`✅ Task : ${key}`);
    return;
  }
  tasks[key].task.stop();
});

// ==========================================================================
// ==========================================================================
// ==========================================================================

app.get("/", token_validation, only_superman, async (req, res) => {
  /**
    #swagger.tags = ['Task']
    #swagger.summary = '(Super Admin)'
  */

  const list_task = Object.keys(tasks).map((key) => {
    return {
      key,
      status: tasks[key].status,
    };
  });
  return res.json({ task: list_task });
});

app.patch("/:key/start", token_validation, only_superman, async (req, res) => {
  /**
    #swagger.tags = ['Task']
    #swagger.summary = '(Super Admin)'
  */

  const { key } = req.params;
  if (!tasks[key]) {
    return res.json({ message: "task not found!" });
  }
  if (tasks[key].status) {
    return res.json({ message: "task already active!" });
  }

  tasks[key].task.start();
  tasks[key].status = true;

  return res.json({ message: "success start task!" });
});

app.patch("/:key/stop", token_validation, only_superman, async (req, res) => {
  /**
    #swagger.tags = ['Task']
    #swagger.summary = '(Super Admin)'
  */

  const { key } = req.params;
  if (!tasks[key]) {
    return res.json({ message: "task not found!" });
  }
  if (!tasks[key].status) {
    return res.json({ message: "task already inactive!" });
  }

  tasks[key].task.stop();
  tasks[key].status = false;

  return res.json({ message: "success stop task!" });
});

router.use("/api/task", app);
module.exports = router;
