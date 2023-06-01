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

app.get("/list", async (req, res) => {
  /**
    #swagger.tags = ['Block']
    #swagger.summary = '(SuperAdmin)'
  */

  try {
    const data = await Database(tables.blocks);
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

app.post("/new", async (req, res) => {
  /**
    #swagger.tags = ['Block']
    #swagger.summary = '(SuperAdmin)'
  */

  const { identity, ip_address } = req.body;
  if (!(identity, ip_address)) {
    return res.status(400).json({
      message: "body is'n complete!",
    });
  }

  try {
    const isIdentityExist = await Database(tables.blocks)
      .where("identity", identity)
      .first();
    if (isIdentityExist) {
      return res.status(400).json({
        message: "identity is exist!",
      });
    }

    const isIpAddressExist = await Database(tables.blocks)
      .where("ip_address", ip_address)
      .first();
    if (isIpAddressExist) {
      return res.status(400).json({
        message: "ip_address is exist!",
      });
    }

    await Database(tables.blocks).insert({
      identity,
      ip_address,
    });

    return res.json({
      message: "success add block",
    });
  } catch (error) {
    console.log({ error });
    return res.status(500).json({
      message: "Internal Server Error!",
    });
  }
});

app.delete("/:id_block", async (req, res) => {
  /**
    #swagger.tags = ['Block']
    #swagger.summary = '(SuperAdmin)'
  */

  const { id_block } = req.params;

  try {
    const isBlockExist = await Database(tables.blocks)
      .where("id", id_block)
      .first();
    if (isBlockExist) {
      return res.status(400).json({
        message: "block id is not found!",
      });
    }

    await Database(tables.blocks).where("id", id_block).delete();

    return res.json({
      message: "success un-block block",
    });
  } catch (error) {
    console.log({ error });
    return res.status(500).json({
      message: "Internal Server Error!",
    });
  }
});

router.use("/api/block", app);
router.use("/api/block/v1", v1);
module.exports = router;
