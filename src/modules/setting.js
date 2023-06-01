const express = require("express");
const router = express.Router();
const app = express.Router();
const v1 = express.Router();

const { Database } = require("../apps/knex");
const { tables } = require("../config");

const token_validation = require("../middlewares/token_validation");
const only_admin = require("../middlewares/only_admin");

// =======================================================================
// =======================================================================
// =======================================================================

app.get("/list", token_validation, only_admin, async (req, res) => {
  /**
    #swagger.tags = ['Setting']
    #swagger.summary = '(Admin)'
  */

  try {
    const data = await Database(tables.settings);

    return res.json({
      data,
    });
  } catch (error) {
    console.log({ error });
    return res.status(500).json({
      message: "Internal Server Error!",
    });
  }
});

app.post("/new", token_validation, only_admin, async (req, res) => {
  /**
    #swagger.tags = ['Setting']
    #swagger.summary = '(Admin)'
  */

  const { key, value } = req.body;

  try {
    const isKeyExist = await Database(tables.settings)
      .where("key", key)
      .first();
    if (isKeyExist) {
      return res.status(400).json({
        message: "key is exist!",
      });
    }

    await Database(tables.settings).insert({
      key,
      value,
    });

    return res.json({
      message: "success add setting!",
    });
  } catch (error) {
    console.log({ error });
    return res.status(500).json({
      message: "Internal Server Error!",
    });
  }
});
app.put("/", token_validation, only_admin, async (req, res) => {
  /**
    #swagger.tags = ['Setting']
    #swagger.summary = '(Admin)'
  */

  const { key, value } = req.body;

  try {
    const isKeyExist = await Database(tables.settings)
      .where("key", key)
      .first();
    if (!isKeyExist) {
      return res.status(400).json({
        message: "key is not found!",
      });
    }

    await Database(tables.settings).where("key", key).update({
      value,
    });

    return res.json({
      message: "success edit setting!",
    });
  } catch (error) {
    console.log({ error });
    return res.status(500).json({
      message: "Internal Server Error!",
    });
  }
});

router.use("/api/setting", app);
router.use("/api/setting/v1", v1);
module.exports = router;
