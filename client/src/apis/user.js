import axios from "../axios";

export const apiRegister = (data) =>
  axios({
    url: "/user/register",
    method: "POST",
    data,
    withCredentials: true,
  });

export const apiFinalRegister = (token) =>
  axios({
    url: "/user/completeregister/" + token,
    method: "PUT",
  });

export const apiLogin = (data) =>
  axios({
    url: "/user/login",
    method: "POST",
    data,
  });

export const apiForgotPassword = (data) =>
  axios({
    url: "/user/forgotpassword",
    method: "POST",
    data,
  });

export const apiResetPassword = (data) =>
  axios({
    url: "/user/resetpassword",
    method: "PUT",
    data,
  });

export const apiGetCurrent = () =>
  axios({
    url: "/user/current",
    method: "GET",
  });

export const apiGetAllUser = (params) =>
  axios({
    url: "/user/",
    method: "GET",
    params,
  });

export const apiGetUserById = (uid) =>
  axios({
    url: "/user/" + uid,
    method: "GET",
  });
export const apiGetUserByEmailOrMobile = (emailOrMobile) =>
  axios({
    url: "/user/emailmobile/" + emailOrMobile,
    method: "GET",
  });

export const apiUpdateUser = (data, uid) =>
  axios({
    url: "/user/" + uid,
    method: "PUT",
    data,
  });

export const apiUpdateUserByAdmin = (data, uid) =>
  axios({
    url: "/user/" + uid,
    method: "PUT",
    data,
  });

export const apiDeleteUser = (uid) =>
  axios({
    url: "/user/" + uid,
    method: "DELETE",
  });

export const apiUpdateCurrent = (data) =>
  axios({
    url: "/user/current",
    method: "PUT",
    data,
  });

export const apiUpdateCouponToUser = (uid, couponId) =>
  axios({
    url: "/user/coupon/" + uid,
    method: "PUT",
    data: { couponId },
  });

export const apiUpdateCart = (data) =>
  axios({
    url: "/user/cart",
    method: "PUT",
    data,
  });

export const apiUpdateCartByUserId = (uid, data) =>
  axios({
    url: "/user/cart/" + uid,
    method: "PUT",
    data,
  });

export const apiRemoveCart = (pid, color) =>
  axios({
    url: `/user/remove-cart/${pid}/${color}`,
    method: "DELETE",
  });

export const apiUpdateWishlist = (pid) =>
  axios({
    url: `/user/wishlist/` + pid,
    method: "PUT",
  });

export const apiRemoveWishlistById = (userId, pid) =>
  axios({
    url: `/user/wishlist/` + userId + "/" + pid,
    method: "DELETE",
  });
export const apiRemoveProductInCartByUserId = (userId, pid, color) =>
  axios({
    url: `/user/remove-cart/${userId}/${pid}/${color}`,
    method: "DELETE",
  });
