const router = require("express").Router();
const controller = require("../controllers/order");
const { verifyAccessToken, isAdmin } = require("../middlewares/verifyToken");

router.post("/", [verifyAccessToken], controller.createOrder);
router.post("/payment-zalopay", [verifyAccessToken], controller.paymentZalopay);
router.post("/callback-zalopay", controller.paymentZalopayCallback);
router.post(
  "/zalopay/:uid",
  [verifyAccessToken],
  controller.createZalopayOrder
);
router.post(
  "/order-status/:app_trans_id",
  controller.paymentZalopayOrderStatus
);
router.post(
  "/:uid",
  [verifyAccessToken, isAdmin],
  controller.createOrderByUserId
);
router.get("/admin", [verifyAccessToken, isAdmin], controller.getAllOrders);
router.get("/", [verifyAccessToken], controller.getUserOrder);
router.get("/all", [verifyAccessToken, isAdmin], controller.getAllOrderNoLmit);
router.get("/:oid", [verifyAccessToken], controller.getOrderById);
router.put(
  "/info/:oid",
  [verifyAccessToken, isAdmin],
  controller.updateOrderInformation
);
router.put(
  "/update/:uid/:oid",
  [verifyAccessToken, isAdmin],
  controller.updateOrderById
);

router.put(
  "/add/:oid",
  [verifyAccessToken, isAdmin],
  controller.addProductToOrder
);

router.delete(
  "/delete/:oid",
  [verifyAccessToken, isAdmin],
  controller.deleteOrder
);

// Route để xóa sản phẩm khỏi đơn hàng
router.delete(
  "/delete/:oid/:pid",
  [verifyAccessToken, isAdmin],
  controller.removeProductFromOrder
);

module.exports = router;
