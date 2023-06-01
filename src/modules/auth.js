const express = require("express");
const router = express.Router();
const v1 = express.Router();

const { Database } = require("../apps/knex");
const {
  tables,

  user_roles,
  isLocal,

  OTP_EXPIRED,
} = require("../config");

const random = require("../helpers/random");
const encryption = require("../utils/encryption");
const jwt = require("../utils/jsonwebtoken");

const token_validation = require("../middlewares/token_validation");

// =======================================================================
// =======================================================================
// =======================================================================

v1.post("/register", async (req, res) => {
  /**
    #swagger.tags = ['Auth']
  */

  const { name, username, phone_number, password } = req.body;

  if (!(name && username && phone_number && password)) {
    return res.status(400).json({
      message: "body is'n complete!",
    });
  }

  if (String(password).length < 8) {
    return res.status(400).json({
      message: "password must be length up to 8 character!",
    });
  }

  try {
    const isPhoneExist = await Database(tables.users)
      .select("is_verify", "is_block", "otp_count", "otp_start_date")
      .where("username", username)
      .first();
    if (isPhoneExist) {
      if (isPhoneExist.is_verify) {
        return res.status(400).json({
          message: "phone number is already register!",
        });
      }
      if (isPhoneExist.is_block) {
        return res.status(400).json({
          message: "Sorry, your phone number is blocked!",
        });
      }
      const now = new Date();
      const expired_token = new Date(isPhoneExist.otp_start_date);
      expired_token.setMinutes(expired_token.getMinutes() + OTP_EXPIRED);
      if (now.getTime() < expired_token.getTime()) {
        if (isPhoneExist.otp_count >= 3) {
          return res.status(400).json({
            message: "waiting expired OTP!",
          });
        }
        return res.status(400).json({
          message: "token already can use!",
        });
      }
    }

    const otp_secret = random.Text(19);
    const otp_code = random.OTP(6);

    const otp_management = {
      otp_secret,
      otp_code,
      otp_count: 0,
      otp_start_date: new Date(),
    };
    if (isPhoneExist) {
      // update
      await Database(tables.users)
        .where("username", username)
        .update({
          name,
          phone_number,
          password: encryption.encode(password),

          ...otp_management,
        });
    } else {
      // insert
      await Database(tables.users).insert({
        name,
        username,
        phone_number,
        password: encryption.encode(password),

        ...otp_management,
      });
    }

    return res.json({
      message: "Please validate your OTP code!",
      otp_secret,
    });
  } catch (error) {
    console.log({ error });
    return res.status(500).json({
      message: "Internal Server Error!",
    });
  }
});

v1.post("/login", async (req, res) => {
  /**
    #swagger.tags = ['Auth']
  */

  const { username, password } = req.body;
  const isMobile = String(req.headers["user-agent"])
    .toLowerCase()
    .includes("dart");

  if (!(username && password)) {
    return res.status(400).json({
      message: "body is'n complete!",
    });
  }

  if (String(password).length < 8) {
    return res.status(400).json({
      message: "password must be length up to 8 character!",
    });
  }

  try {
    const isLogin = await Database(tables.users)
      .select(
        "phone_number",
        "role",
        "is_block",
        "otp_count",
        "otp_start_date",
        "activity_at"
      )
      .where("username", username)
      .where("password", encryption.encode(password))
      .first();
    if (!isLogin) {
      return res.status(400).json({
        message: "username or password is wrong!",
      });
    }
    if (isLogin.is_block) {
      return res.status(400).json({
        message: "Sorry, your phone number is blocked!",
      });
    }
    if (isLogin.activity_at) {
      const now = new Date();
      const expired_login = new Date(isLogin.activity_at);
      if (now.getTime() < expired_login.getTime()) {
        return res.status(400).json({
          message: "Sorry, the account is already signed in on another device!",
        });
      }
    }
    if (!isLocal) {
      if (isMobile) {
        // mobile
        if (![user_roles.basic].includes(isLogin.role)) {
          return res.status(400).json({
            message: "Sorry, login only basic user!",
          });
        }
      } else {
        //web
        if (
          ![
            user_roles.superadmin,
            user_roles.admin,
            user_roles.approval,
          ].includes(isLogin.role)
        ) {
          return res.status(400).json({
            message: "Sorry, login only admin & approval user!",
          });
        }
      }
    }
    const now = new Date();
    const expired_token = new Date(isLogin.otp_start_date);
    expired_token.setMinutes(expired_token.getMinutes() + OTP_EXPIRED);
    if (now.getTime() < expired_token.getTime()) {
      return res.status(400).json({
        message: "waiting expired OTP!",
      });
    }

    const otp_secret = random.Text(19);
    const otp_code = random.OTP(6);

    // update
    await Database(tables.users).where("username", username).update({
      otp_secret,
      otp_code,
      otp_count: 0,
      otp_start_date: new Date(),
    });

    return res.json({
      message: "Please validate your OTP code!",
      otp_secret,
    });
  } catch (error) {
    console.log({ error });
    return res.status(500).json({
      message: "Internal Server Error!",
    });
  }
});

v1.post("/token-validate/:mode", async (req, res) => {
  /**
    #swagger.tags = ['Auth']
  */

  const isMobile = String(req.headers["user-agent"])
    .toLowerCase()
    .includes("dart");

  const { otp_secret, otp_code } = req.body;
  let { mode } = req.params;

  mode = mode.toLowerCase();
  if (!["register", "login"].includes(mode.toLowerCase())) {
    return res.status(400).json({
      message: "only register or login!",
    });
  }

  if (!(otp_secret && otp_code)) {
    return res.status(400).json({
      message: "body is'n complete!",
    });
  }

  try {
    const isExist = await Database(tables.users)
      .select(
        "id",
        "username",
        "role",
        "otp_code",
        "otp_count",
        "otp_start_date"
      )
      .where("otp_secret", otp_secret)
      .first();
    if (!isExist) {
      return res.status(400).json({
        message: "otp_secret not found!",
      });
    }
    if (isExist.otp_count >= 3) {
      return res.status(400).json({
        message: "please send new OTP!",
      });
    }
    await Database(tables.users)
      .where("otp_secret", otp_secret)
      .update({
        otp_count: isExist.otp_count + 1, // increase...
      });
    const now = new Date();
    const expired_token = new Date(isExist.otp_start_date);
    expired_token.setMinutes(expired_token.getMinutes() + OTP_EXPIRED);
    if (now.getTime() >= expired_token.getTime()) {
      return res.status(400).json({
        message: "OTP is expired!",
      });
    }
    if (isExist.otp_code != otp_code) {
      return res.status(400).json({
        message: "OTP not match!",
      });
    }

    // reset
    const changes = {
      otp_secret: null,
      otp_code: null,
      otp_count: 0,
      otp_start_date: null,

      is_verify: true,
    };
    if (mode == "login") {
      const expired_login = new Date();
      expired_login.setDate(expired_login.getDate() + 7);
      changes.activity_at = expired_login;
    }
    await Database(tables.users)
      .where("otp_secret", otp_secret)
      .update(changes);

    // create token
    const token = jwt.createToken({
      id: isExist.id,
      role: isExist.role,
    });

    res.cookie("token", token, {
      httpOnly: true,
    });
    return res.json({
      message: `success ${mode}!`,
      token,
      username: isExist.username,
      role: isExist.role,
    });
  } catch (error) {
    console.log({ error });
    return res.status(500).json({
      message: "Internal Server Error!",
    });
  }
});

v1.delete("/logout", token_validation, async (req, res) => {
  /**
    #swagger.tags = ['Auth']
    #swagger.security = [{ "Bearer": [] }]
    #swagger.summary = '(*)'
  */

  const id_user = req.user.id;

  await Database(tables.users).where("id", id_user).update({
    activity_at: null,
  });
  res.clearCookie("token");
  return res.json({
    message: "success logout!",
  });
});

router.use("/api/auth/v1", v1);
module.exports = router;
