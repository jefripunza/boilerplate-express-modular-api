const express = require("express");
const router = express.Router();
const app = express.Router();
const v1 = express.Router();

const path = require("path");
const { user_dir } = require("../paths");

const { Database } = require("../apps/knex");
const {
  tables,

  allow_file_extension_image,
  max_upload_image,
} = require("../config");
const { newNameUpload } = require("../helpers/convert");
const encryption = require("../utils/encryption");

const token_validation = require("../middlewares/token_validation");
const only_admin = require("../middlewares/only_admin");
const only_basic = require("../middlewares/only_basic");

// =======================================================================
// =======================================================================
// =======================================================================
// -> Users

app.get("/init", token_validation, async (req, res) => {
  /**
    #swagger.tags = ['User']
    #swagger.security = [{ "Bearer": [] }]
    #swagger.summary = '(*)'
   */

  const id_user = req.user.id;

  const result = await Database(tables.users)
    .select(
      "users.name",
      "users.img_avatar",
      "users.phone_number",
      "users.role",

      "user_sellers.shop_name",
      "user_sellers.shop_img",
      "user_sellers.description AS shop_description",
      "user_sellers.created_at AS shop_join_at"
    )
    .leftJoin(tables.user_sellers, "user_sellers.id_user", "users.id")
    .where("users.id", id_user)
    .first();

  // jika belum join seller jangan tampilkan key
  if (!result.shop_name) {
    delete result.shop_name;
    delete result.shop_img;
    delete result.shop_description;
    delete result.shop_join_at;
  }

  return res.json({
    ...result,
  });
});

app.put("/", token_validation, only_basic, async (req, res) => {
  /**
    #swagger.tags = ['User']
    #swagger.security = [{ "Bearer": [] }]
    #swagger.summary = '(Basic)'
   */

  const id_user = req.user.id;
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({
      message: "body is'n complete!",
    });
  }

  await Database(tables.users).where("id", id_user).update({
    name,
  });

  return res.json({
    message: "success edit user!",
  });
});

app.patch("/update-image", token_validation, only_basic, async (req, res) => {
  /*
    #swagger.tags = ['User']
    #swagger.security = [{ "Bearer": [] }]
    #swagger.summary = '(Basic)'

    #swagger.consumes = ['multipart/form-data']  
    #swagger.parameters['image'] = {
        in: 'formData',
        type: 'file',
        required: 'true',
        description: 'Upload Image...',
    }
  */

  const id_user = req.user.id;
  if (!req.files || !req.files.image) {
    return res.status(400).json({
      message: "No image were uploaded.",
    });
  }

  const image = req.files.image;
  if (
    allow_file_extension_image.includes(
      String(path.extname(image.name)).toLowerCase()
    )
  ) {
    return res.status(400).json({
      message: "file image only.",
    });
  }
  if (image.size > max_upload_image * 1024 * 1024) {
    return res.status(400).json({
      message: `File size is too large. ${max_upload_image}MB maximum.`,
    });
  }

  const new_name = "user_basic_" + newNameUpload(image.name);

  image.mv(path.join(user_dir, new_name), async (error) => {
    if (error) {
      return res.status(500).json({
        message: "failed upload file...",
      });
    }

    await Database(tables.users).where("id", id_user).update({
      img_avatar: new_name,
    });

    return res.json({
      filename: new_name,
    });
  });
});

app.put("/shop", token_validation, async (req, res) => {
  /**
    #swagger.tags = ['User']
    #swagger.security = [{ "Bearer": [] }]
    #swagger.summary = '(Seller)'
   */

  const id_user = req.user.id;
  const {
    // seller
    shop_name,
    shop_description,
  } = req.body;

  if (!(shop_name && shop_description)) {
    return res.status(400).json({
      message: "body is'n complete!",
    });
  }

  await Database(tables.user_sellers)
    .innerJoin(tables.users, "users.id", "user_sellers.id_user")
    .where("users.id", id_user)
    .update({
      shop_name,
      shop_description,
    });

  return res.json({
    message: "success edit seller!",
  });
});

app.patch(
  "/shop/update-image",
  token_validation,

  async (req, res) => {
    /*
      #swagger.tags = ['User']
      #swagger.security = [{ "Bearer": [] }]
      #swagger.summary = '(Seller)'

      #swagger.consumes = ['multipart/form-data']  
      #swagger.parameters['image'] = {
          in: 'formData',
          type: 'file',
          required: 'true',
          description: 'Upload Image...',
      }
    */

    const id_user = req.user.id;
    if (!req.files || !req.files.image) {
      return res.status(400).json({
        message: "No image were uploaded.",
      });
    }

    const image = req.files.image;
    if (
      allow_file_extension_image.includes(
        String(path.extname(image.name)).toLowerCase()
      )
    ) {
      return res.status(400).json({
        message: "file image only.",
      });
    }
    if (image.size > max_upload_image * 1024 * 1024) {
      return res.status(400).json({
        message: `File size is too large. ${max_upload_image}MB maximum.`,
      });
    }

    const new_name = "user_seller_" + newNameUpload(image.name);

    image.mv(path.join(user_dir, new_name), async (error) => {
      if (error) {
        return res.status(500).json({
          message: "failed upload file...",
        });
      }

      await Database(tables.user_sellers)
        .innerJoin(tables.users, "users.id", "user_sellers.id_user")
        .where("users.id", id_user)
        .update({
          shop_logo: new_name,
        });

      return res.json({
        filename: new_name,
      });
    });
  }
);

v1.put("/change-password", token_validation, async (req, res) => {
  /**
    #swagger.tags = ['User']
    #swagger.security = [{ "Bearer": [] }]
    #swagger.summary = '(*)'
   */

  const id_user = req.user.id;
  const { password, re_password } = req.body;

  if (!(password && re_password)) {
    return res.status(400).json({
      message: "body is'n complete!",
    });
  }

  if (password != re_password) {
    return res.status(400).json({
      message: "password not match!",
    });
  }

  try {
    await Database(tables.users)
      .where("id_user", id_user)
      .update({
        password: encryption.encode(password),
      });

    return res.json({
      message: "success change password user!",
    });
  } catch (error) {
    console.log({ error });
    return res.status(500).json({
      message: "Internal Server Error!",
    });
  }
});

// =======================================================================
// =======================================================================
// =======================================================================
// -> User Address

v1.get("/address", token_validation, async (req, res) => {
  /**
    #swagger.tags = ['User Address']
    #swagger.security = [{ "Bearer": [] }]
    #swagger.summary = '(Basic, Seller)'
   */

  const id_user = req.user.id;

  const data = await Database(tables.user_address)
    .where("id_user", id_user)
    .orderBy("is_use", "asc");

  try {
    return res.json({ data });
  } catch (error) {
    console.log({ error });
    return res.status(500).json({
      message: "Internal Server Error!",
    });
  }
});

v1.post("/address", token_validation, async (req, res) => {
  /**
    #swagger.tags = ['User Address']
    #swagger.security = [{ "Bearer": [] }]
    #swagger.summary = '(Basic, Seller)'
   */

  const id_user = req.user.id;
  const { subdistrict_code, detail, is_use } = req.body;

  try {
    const isSubdistrictExist = await Database(tables.user_address)
      .where("id_user", id_user)
      .where("subdistrict_code", subdistrict_code)
      .first();
    if (isSubdistrictExist) {
      return res.status(400).json({
        message: "subdistrict_code is exist!",
      });
    }

    await Database(tables.user_address).insert({
      subdistrict_code,
      detail,
      is_use,
    });

    return res.json({
      message: "success add address user!",
    });
  } catch (error) {
    console.log({ error });
    return res.status(500).json({
      message: "Internal Server Error!",
    });
  }
});

v1.put("/address/:id_user_address", token_validation, async (req, res) => {
  /**
    #swagger.tags = ['User Address']
    #swagger.security = [{ "Bearer": [] }]
    #swagger.summary = '(Basic, Seller)'
   */

  const id_user = req.user.id;
  const { id_user_address } = req.params;
  const { subdistrict_code, detail } = req.body;

  try {
    const isAddressExist = await Database(tables.user_address)
      .where("id_user", id_user)
      .where("id", id_user_address)
      .first();
    if (!isAddressExist) {
      return res.status(400).json({
        message: "address id is'n found!",
      });
    }

    if (subdistrict_code) {
      const isSubdistrictExist = await Database(tables.user_address)
        .where("id_user", id_user)
        .where("subdistrict_code", subdistrict_code)
        .first();
      if (isSubdistrictExist) {
        return res.status(400).json({
          message: "subdistrict_code is exist!",
        });
      }
    }

    await Database(tables.user_address)
      .where("id_user", id_user)
      .where("id", id_user_address)
      .update({
        subdistrict_code,
        detail,
      });

    return res.json({
      message: "success edit address user!",
    });
  } catch (error) {
    console.log({ error });
    return res.status(500).json({
      message: "Internal Server Error!",
    });
  }
});

v1.patch(
  "/main-address/:id_user_address",
  token_validation,
  async (req, res) => {
    /**
      #swagger.tags = ['User Address']
      #swagger.security = [{ "Bearer": [] }]
      #swagger.summary = '(Basic, Seller)'
    */

    const id_user = req.user.id;
    const { id_user_address } = req.body;

    try {
      const isAddressExist = await Database(tables.user_address)
        .where("id_user", id_user)
        .where("id", id_user_address)
        .first();
      if (!isAddressExist) {
        return res.status(400).json({
          message: "address id is'n found!",
        });
      }

      // reset
      await Database(tables.user_address).where("id_user", id_user).update({
        is_use: false,
      });

      // focus
      await Database(tables.user_address)
        .where("id_user", id_user)
        .where("id", id_user_address)
        .update({
          is_use: true,
        });

      return res.json({
        message: "success change main address user!",
      });
    } catch (error) {
      console.log({ error });
      return res.status(500).json({
        message: "Internal Server Error!",
      });
    }
  }
);

v1.delete("/address/:id_user_address", token_validation, async (req, res) => {
  /**
    #swagger.tags = ['User Address']
    #swagger.security = [{ "Bearer": [] }]
    #swagger.summary = '(Basic, Seller)'
  */

  const id_user = req.user.id;
  const { id_user_address } = req.body;

  try {
    const isAddressExist = await Database(tables.user_address)
      .where("id_user", id_user)
      .where("id", id_user_address)
      .first();
    if (!isAddressExist) {
      return res.status(400).json({
        message: "address id is'n found!",
      });
    }

    await Database(tables.user_address)
      .where("id_user", id_user)
      .where("id", id_user_address)
      .delete();

    return res.json({
      message: "success delete address user!",
    });
  } catch (error) {
    console.log({ error });
    return res.status(500).json({
      message: "Internal Server Error!",
    });
  }
});

// =======================================================================
// =======================================================================
// =======================================================================
// -> User Sellers

v1.get("/list-seller", token_validation, only_admin, async (req, res) => {
  /**
    #swagger.tags = ['User Address']
    #swagger.security = [{ "Bearer": [] }]
    #swagger.summary = '(Admin)'
  */

  try {
    const data = await Database(tables.user_sellers).innerJoin(
      tables.users,
      "users.id",
      "user_sellers.id_user"
    );

    return res.json({ data });
  } catch (error) {
    console.log({ error });
    return res.status(500).json({
      message: "Internal Server Error!",
    });
  }
});

v1.patch(
  "/seller-approve/:id_seller",
  token_validation,
  only_admin,
  async (req, res) => {
    /**
      #swagger.tags = ['User Address']
      #swagger.security = [{ "Bearer": [] }]
      #swagger.summary = '(Admin)'
    */

    const { id_seller } = req.params;

    try {
      const isSellerExist = await Database(tables.user_sellers)
        .where("id", id_seller)
        .first();
      if (!isSellerExist) {
        return res.status(400).json({
          message: "seller id is'n found!",
        });
      }

      await Database(tables.user_sellers).where("id", id_seller).update({
        is_revision: false,
        is_verify: true,
      });

      return res.json({
        message: "success approve seller!",
      });
    } catch (error) {
      console.log({ error });
      return res.status(500).json({
        message: "Internal Server Error!",
      });
    }
  }
);

v1.delete(
  "/seller-reject/:id_seller",
  token_validation,
  only_admin,
  async (req, res) => {
    /**
      #swagger.tags = ['User Address']
      #swagger.security = [{ "Bearer": [] }]
      #swagger.summary = '(Admin)'
    */

    const { id_seller } = req.params;
    const { reason } = req.body;

    try {
      const isSellerExist = await Database(tables.user_sellers)
        .where("id", id_seller)
        .first();
      if (!isSellerExist) {
        return res.status(400).json({
          message: "seller id is'n found!",
        });
      }

      const revision_reason = isSellerExist.revision_reason;
      revision_reason.push(reason);

      await Database(tables.user_sellers).where("id", id_seller).update({
        is_revision: true,
        revision_reason,
      });

      return res.json({
        message: "success reject seller!",
      });
    } catch (error) {
      console.log({ error });
      return res.status(500).json({
        message: "Internal Server Error!",
      });
    }
  }
);

v1.delete(
  "/seller-block/:id_seller",
  token_validation,
  only_admin,
  async (req, res) => {
    /**
      #swagger.tags = ['User Address']
      #swagger.security = [{ "Bearer": [] }]
      #swagger.summary = '(Admin)'
    */

    const { id_seller } = req.params;
    const { reason } = req.body;

    try {
      const isSellerExist = await Database(tables.user_sellers)
        .where("id", id_seller)
        .first();
      if (!isSellerExist) {
        return res.status(400).json({
          message: "seller id is'n found!",
        });
      }

      await Database(tables.user_sellers).where("id", id_seller).update({
        is_block: true,
        block_reason: reason,
      });

      return res.json({
        message: "success blocked seller!",
      });
    } catch (error) {
      console.log({ error });
      return res.status(500).json({
        message: "Internal Server Error!",
      });
    }
  }
);

router.use("/api/user", app);
router.use("/api/user/v1", v1);
module.exports = router;
