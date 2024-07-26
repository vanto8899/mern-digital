const router = require("express").Router();
const controller = require("../controllers/coupon");
const { checkCidParam } = require("../middlewares/CheckParam");
const { verifyAccessToken, isAdmin } = require("../middlewares/verifyToken");

router.post("/", [verifyAccessToken, isAdmin], controller.createNewCoupon);
router.get("/", controller.getCoupons);
router.post(
  "/coupon-user",
  verifyAccessToken,
  checkCidParam,
  controller.getCouponById
);
router.put("/:cid", [verifyAccessToken, isAdmin], controller.updateCoupon);
router.delete("/:cid", [verifyAccessToken, isAdmin], controller.deleteCoupon);

module.exports = router;
