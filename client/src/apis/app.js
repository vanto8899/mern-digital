import axios from "../axios";

export const apiGetCategories = async () =>
  axios({
    url: "/productcategory/",
    method: "GET",
  });

// coupon
export const apiCreateNewCoupon = async (data) =>
  axios({
    url: "/coupon/",
    method: "POST",
    data,
  });

export const apiGetCoupons = async (params) =>
  axios({
    url: "/coupon/",
    method: "GET",
    params,
  });

export const apiGetCouponById = async (cid) =>
  axios({
    url: "/coupon/coupon-user/",
    method: "POST",
    data: { cid },
  });

export const apiUpdateCouponById = async (data, cid) =>
  axios({
    url: "/coupon/" + cid,
    method: "PUT",
    data,
  });
export const apiDeleteCouponById = async (cid) =>
  axios({
    url: "/coupon/" + cid,
    method: "DELETE",
  });
