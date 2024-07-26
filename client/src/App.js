import React, { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  LoginPage,
  HomePage,
  PublicPage,
  FAQPage,
  ServicePage,
  ProductPage,
  DetailProductPage,
  BlogPage,
  CompleteRegister,
  ResetPassword,
  CategoryProductPage,
} from "pages/public";
import { Modal } from "components";
import Cart from "components/Products/Cart";
import path from "utils/path";
import { getCategories } from "store/app/asyncActions";
import { useDispatch, useSelector } from "react-redux";
import {
  AddNewUser,
  AdminLayout,
  CreateCounpon,
  CreateProducts,
  DashboardCustom,
  ManageCoupons,
  ManageOrder,
  ManageProducts,
  ManageUser,
} from "pages/admin";
import {
  MemberLayout,
  Personal,
  History,
  Wishlist,
  Checkout,
  DetailCart,
} from "pages/member";
import { showCart } from "store/app/appSlice";
import CreateOrder from "pages/admin/CreateOrder";
function App() {
  const dispatch = useDispatch();
  const { isShowModal, modalChildren, isShowCart } = useSelector(
    (state) => state.app
  );

  useEffect(() => {
    dispatch(getCategories());
  }, []);

  return (
    <div className="font-main h-screen relative">
      {isShowCart && (
        <div
          onClick={() => dispatch(showCart())}
          className="absolute inset-0 bg-overlay z-50 flex justify-end"
        >
          <Cart />
        </div>
      )}
      {isShowModal && <Modal>{modalChildren}</Modal>}
      <Routes>
        <Route path={path.CHECKOUT} element={<Checkout />} />
        <Route path={path.PUBLIC} element={<PublicPage />}>
          <Route path={path.HOME} element={<HomePage />} />
          <Route path={path.BLOGS} element={<BlogPage />} />
          <Route
            path={path.DETAIL_PRODUCT__CATEGORY__PID__TITLE}
            element={<DetailProductPage />}
          />
          <Route path={path.FAQ} element={<FAQPage />} />
          <Route path={path.OUR_SERVICES} element={<ServicePage />} />
          <Route path={path.PRODUCTS} element={<ProductPage />} />
          <Route path={path.CATE_PRODUCTS} element={<CategoryProductPage />} />
          <Route path={path.RESET_PASSWORD} element={<ResetPassword />} />
          <Route path={path.ALL} element={<HomePage />} />
        </Route>
        <Route path={path.ADMIN} element={<AdminLayout />}>
          {/* <Route path={path.DASHBOARD} element={<Dashboard />} /> */}
          <Route path={path.DASHBOARD} element={<DashboardCustom />} />
          <Route path={path.MANAGE_ORDER} element={<ManageOrder />} />
          <Route path={path.CREATE_ORDER} element={<CreateOrder />} />
          <Route path={path.MANAGE_PRODUCTS} element={<ManageProducts />} />
          <Route path={path.CREATE_PRODUCTS} element={<CreateProducts />} />
          <Route path={path.MANAGE_USER} element={<ManageUser />} />
          <Route path={path.ADD_NEW_USER} element={<AddNewUser />} />
          <Route path={path.MANAGE_COUPON} element={<ManageCoupons />} />
          <Route path={path.CREATE_COUPON} element={<CreateCounpon />} />
        </Route>
        <Route path={path.MEMBER} element={<MemberLayout />}>
          <Route path={path.PERSONAL} element={<Personal />} />
          <Route path={path.MY_CART} element={<DetailCart />} />
          <Route path={path.WISHLIST} element={<Wishlist />} />
          <Route path={path.HISTORY} element={<History />} />
        </Route>
        <Route path={path.COMPLETE_REGISTER} element={<CompleteRegister />} />
        <Route path={path.LOGIN} element={<LoginPage />} />
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      {/* Same as */}
      <ToastContainer />
    </div>
  );
}

export default App;
