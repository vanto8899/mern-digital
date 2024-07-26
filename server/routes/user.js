const router = require("express").Router();
const controller = require("../controllers/user");
const { verifyAccessToken, isAdmin } = require("../middlewares/verifyToken");
const uploader = require("../config/cloudinary.config");

// Api user
router.post("/register", controller.register);
router.post("/mock", controller.generateUsers);
router.put("/completeregister/:token", controller.completeRegister);
router.post("/login", controller.login);
router.get("/current", verifyAccessToken, controller.getCurrent);
router.post("/refreshtoken", controller.refreshAccessToken);
router.get("/logout", controller.logout);
router.post("/forgotpassword", controller.forgotPassword);
router.put("/resetpassword", controller.resetPassword);
router.get("/", [verifyAccessToken, isAdmin], controller.getAllUsers);
router.put(
  "/current",
  [verifyAccessToken],
  uploader.single("avatar"),
  controller.updateUser
);
router.put("/address", [verifyAccessToken], controller.updateUserAddress);
router.put("/cart", [verifyAccessToken], controller.updateUserCart);
router.get("/:uid", [verifyAccessToken], controller.getUserById);
router.get(
  "/emailmobile/:emailOrMobile",
  [verifyAccessToken],
  controller.getUserByEmailOrMobile
);
router.put(
  "/cart/:uid",
  [verifyAccessToken],
  controller.updateUserCartByUserId
);
router.put("/:uid", [verifyAccessToken, isAdmin], controller.updateUserByAdmin);
router.put("/wishlist/:pid", [verifyAccessToken], controller.updateWishlist);
router.put("/coupon/:uid", [verifyAccessToken], controller.updateCouponToUser);
router.delete(
  "/wishlist/:userId/:pid",
  [verifyAccessToken, isAdmin],
  controller.removeWishlistById
);
router.delete("/:uid", [verifyAccessToken, isAdmin], controller.deleteUser);
router.delete(
  "/remove-cart/:pid/:color",
  [verifyAccessToken],
  controller.removeProductInCart
);
router.delete(
  "/remove-cart/:uid/:pid/:color",
  [verifyAccessToken, isAdmin],
  controller.removeProductInCartByUserId
);

module.exports = router;
