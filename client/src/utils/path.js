const path = {
  PUBLIC: "/",
  HOME: "",
  ALL: "*",
  LOGIN: "login-signin",
  PRODUCTS: "allproducts",
  BLOGS: "blogs",
  OUR_SERVICES: "services",
  FAQ: "faqs",
  CATE_PRODUCTS: ":category",
  DETAIL_PRODUCT__CATEGORY__PID__TITLE: ":category/:pid/:title",
  DETAIL_PRODUCT: "san-pham",
  COMPLETE_REGISTER: "completeregister/:status",
  RESET_PASSWORD: "reset-password/:token",
  CHECKOUT: "checkout",

  // Admin
  ADMIN: "admin",
  DASHBOARD: "dashboard",
  MANAGE_USER: "manage-user",
  MANAGE_PRODUCTS: "manage-products",
  MANAGE_ORDER: "manage-order",
  CREATE_PRODUCTS: "create-products",
  ADD_NEW_USER: "add-new-user",
  CREATE_ORDER: "create-order",
  CREATE_COUPON: "create-coupon",
  MANAGE_COUPON: "manage-coupon",

  // member
  MEMBER: "member",
  PERSONAL: "personal",
  MY_CART: "my-cart",
  HISTORY: "buy-history",
  WISHLIST: "wishlist",
};

export default path;
