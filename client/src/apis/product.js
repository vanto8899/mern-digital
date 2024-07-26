import axios from "../axios";

export const apiGetProducts = (params) =>
  axios({
    url: "/product/",
    method: "GET",
    params,
  });
export const apiGetProductNoLimit = () =>
  axios({
    url: "/product/all",
    method: "GET",
  });

export const apiGetProductById = (pid) =>
  axios({
    url: "/product/" + pid,
    method: "GET",
  });
export const apiGetProductInOrder = (pid) =>
  axios({
    url: "/product/orders/" + pid,
    method: "GET",
  });

export const apiRatings = (data) =>
  axios({
    url: "/product/ratings",
    method: "PUT",
    data,
  });

export const apiCreateProduct = (data) =>
  axios({
    url: "/product/",
    method: "POST",
    data,
  });

export const apiUpdateProduct = (data, pid) =>
  axios({
    url: "/product/" + pid,
    method: "PUT",
    data,
  });

export const apiDeleteProduct = (pid) =>
  axios({
    url: "/product/" + pid,
    method: "DELETE",
  });

export const apiAddVarriant = (data, pid) =>
  axios({
    url: "/product/varriant/" + pid,
    method: "PUT",
    data,
  });

//order//

export const apiCreateOrder = (data) =>
  axios({
    url: "/order/",
    method: "POST",
    data,
  });

export const apiCreateZalopayOrder = (uid, data) =>
  axios({
    url: "/order/zalopay/" + uid,
    method: "POST",
    data,
  });

export const apiGetZalopayOrderStatus = (app_trans_id) =>
  axios({
    url: "/order/order-status/" + app_trans_id,
    method: "POST",
  });

export const apiCreateOrderByUserId = (uid, data) =>
  axios({
    url: "/order/" + uid,
    method: "POST",
    data,
  });

export const apiGetOrders = (params) =>
  axios({
    url: "/order/admin",
    method: "GET",
    params,
  });

export const apiGetUserOrders = (params) =>
  axios({
    url: "/order/",
    method: "GET",
    params,
  });

export const apiGetOrderById = (oid) =>
  axios({
    url: "/order/" + oid,
    method: "GET",
  });

export const apiUpdateOrderInfo = (oid, updatedPayload) =>
  axios({
    url: `/order/info/${oid}`,
    method: "PUT",
    data: updatedPayload,
  });

export const apiUpdateOrderById = (uid, oid, data) =>
  axios({
    url: `/order/update/${uid}/${oid}`,
    method: "PUT",
    data,
  });

export const apiDeleteOrders = (oid) =>
  axios({
    url: "/order/delete/" + oid,
    method: "DELETE",
  });

export const apiremoveProductFromOrder = (oid, pid) =>
  axios({
    url: `order/delete/${oid}/${pid}`,
    method: "DELETE",
  });

export const apiAddProductToOrder = (oid, data) =>
  axios({
    url: "/order/add/" + oid,
    method: "PUT",
    data,
  });
export const apiGetAllOrdersNoLimit = () =>
  axios({
    url: "/order/all",
    method: "GET",
  });
