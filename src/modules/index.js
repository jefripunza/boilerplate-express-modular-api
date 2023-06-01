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

app.get("/", token_validation, only_admin, async (req, res) => {
  /**
    #swagger.tags = ['Index']
    #swagger.summary = '(*)'
  */

  try {
    return res.json({});
  } catch (error) {
    console.log({ error });
    return res.status(500).json({
      message: "Internal Server Error!",
    });
  }
});

router.use("/", app);
router.use("/v1", v1);
module.exports = router;
