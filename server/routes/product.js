const router = require("express").Router();
const controller = require("../controllers/product");
const { verifyAccessToken, isAdmin } = require("../middlewares/verifyToken");
const uploader = require("../config/cloudinary.config");

// Api product
router.post(
  "/",
  [verifyAccessToken, isAdmin],
  uploader.fields([
    { name: "images", maxCount: 6 },
    { name: "thumb", maxCount: 1 },
  ]),
  controller.createProduct
);
router.get("/", controller.getAllProducts);
router.get("/all", controller.getAllProductNoLimit);
router.put("/ratings", verifyAccessToken, controller.ratingProduct);
router.get("/:pid", controller.getProduct);
router.get("/orders/:pid", verifyAccessToken, controller.getProductInOrder);
router.put(
  "/uploadimage/:pid",
  [verifyAccessToken, isAdmin],
  uploader.array("images", 6),
  controller.uploadImagesProduct
);

router.put(
  "/varriant/:pid",
  [verifyAccessToken, isAdmin],
  uploader.fields([
    { name: "images", maxCount: 6 },
    { name: "thumb", maxCount: 1 },
  ]),
  controller.addVarriant
);

router.put(
  "/:pid",
  [verifyAccessToken, isAdmin],
  uploader.fields([
    { name: "images", maxCount: 6 },
    { name: "thumb", maxCount: 1 },
  ]),
  controller.updateProduct
);

router.delete("/:pid", [verifyAccessToken, isAdmin], controller.deleteProduct);

module.exports = router;
