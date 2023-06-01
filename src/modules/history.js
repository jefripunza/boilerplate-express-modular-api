const express = require("express");
const router = express.Router();
const app = express.Router();
const v1 = express.Router();

const { Database } = require("../apps/knex");
const { tables } = require("../config");

const token_validation = require("../middlewares/token_validation");
const only_superman = require("../middlewares/only_superman");

// =======================================================================
// =======================================================================
// =======================================================================

app.get("/list", token_validation, only_superman, async (req, res) => {
  /**
    #swagger.tags = ['History']
    #swagger.summary = '(SuperAdmin)'
  */

  try {
    const data = await Database(tables.histories)
      .select(
        "histories.id",
        "histories.notes",
        "users.name",
        "users.phone_number"
      )
      .innerJoin(tables.users, "users.id", "histories.id_user");

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

router.use("/api/history", app);
router.use("/api/history/v1", v1);
module.exports = router;
