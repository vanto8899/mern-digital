const router = require("express").Router();
const controller = require("../controllers/blogCategory");
const { verifyAccessToken, isAdmin } = require("../middlewares/verifyToken");

router.post("/", [verifyAccessToken, isAdmin], controller.createBlogCategory);
router.get("/", controller.getBlogCategories);
router.put(
  "/:bcid",
  [verifyAccessToken, isAdmin],
  controller.updateBlogCategory
);
router.delete(
  "/:bcid",
  [verifyAccessToken, isAdmin],
  controller.deleteBlogCategory
);

module.exports = router;
