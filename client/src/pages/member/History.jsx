import { apiGetUserOrders } from "apis";
import { InputForm, Pagination } from "components";
import OrderDetailViewUser from 'components/Modals/OrderDetailViewUser'
import withBaseComponent from "hocs/withBaseComponent";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { createSearchParams, useSearchParams } from "react-router-dom";
import useDebounce from "hooks/useDebounce";
import { GoEye, GoEyeClosed } from "react-icons/go";
import { IoClose } from "react-icons/io5";

const History = ({ navigate, location }) => {
  const {
    register,
    formState: { errors },
    watch,
  } = useForm();
  const [params] = useSearchParams();
  const [orders, setOrders] = useState(null);
  const [counts, setCounts] = useState(0);
  const [orderViewDetail, setOrderViewDetail] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [orderById, setOrdeByrId] = useState(null);
  const [isOrderViewing, setIsOrderViewing] = useState(false);
  const [isClosing, setIsClosing] = useState(false); // State for closing animation
  const orderCode = watch("orderCode");
  const status = watch("status");

  const fetchOrders = async (params) => {
    try {
      const response = await apiGetUserOrders({
        ...params,
        limit: process.env.REACT_APP_PRODUCT_LIMIT,
      });
      //console.log("order", response.orders)
      if (response.success) {
        setCounts(response.counts);
        setOrders(response.orders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const queryDebounce = useDebounce(watch('orderCode'), 800);
  const createdAtFromDebounce = useDebounce(watch('createdAtFrom'), 800);
  const createdAtToDebounce = useDebounce(watch('createdAtTo'), 800);

  // filter orders
  useEffect(() => {
    const searchParams = {};
    if (queryDebounce) {
      searchParams.orderCode = queryDebounce;
    }
    if (createdAtFromDebounce) {
      searchParams.createdAtFrom = moment(createdAtFromDebounce).format('YYYY-MM-DD');
    }
    if (createdAtToDebounce) {
      searchParams.createdAtTo = moment(createdAtToDebounce).format('YYYY-MM-DD');
    }
    navigate({
      pathname: location.pathname,
      search: createSearchParams(searchParams).toString(),
    });
  }, [queryDebounce, createdAtFromDebounce, createdAtToDebounce, navigate, location.pathname]);

  useEffect(() => {
    const pr = Object.fromEntries([...params]);
    fetchOrders(pr);
  }, [params]);

  // State open product list in order
  const handleViewProductList = async (oid, orderBy) => {
    setOrderId(oid);
    setOrdeByrId(orderBy)
    setOrderViewDetail(true);
    setIsOrderViewing(!isOrderViewing);
  };

  const handleCloseOrderDetailView = () => {
    setIsOrderViewing(!isOrderViewing);
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setOrderViewDetail(false);
    }, 500); // Adjust timeout duration to match CSS animation
  };

  //No of pagination
  const currentPage = parseInt(params.get("page")) || 1; // Default to page 1 if not defined
  const limit = parseInt(process.env.REACT_APP_PRODUCT_LIMIT);
  const itemIndex = (currentPage - 1) * limit;

  return (
    <>
      <div className="w-full relative px-4">
        <header className="text-3xl font-semibold py-4 px-2 border-b border-gray-300">
          History Ordering
        </header>
        <div className="flex flex-col w-full mb-4 gap-4 md:flex-row md:items-center md:justify-end md:mb-0 md:px-4">
          <form className="md:w-[60%] grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <InputForm
                id="orderCode"
                register={register}
                errors={errors}
                fullWidth
                placeholder="Search order by order code,..."
              />
            </div>
            <div>
              <InputForm
                id="createdAtFrom"
                register={register}
                errors={errors}
                type="date"
                fullWidth
                placeholder="From date"
              />
            </div>
            <div>
              <InputForm
                id="createdAtTo"
                register={register}
                errors={errors}
                type="date"
                fullWidth
                placeholder="To date"
              />
            </div>
          </form>
        </div>
        <div className="overflow-x-auto md:w-full">
          <table className="table-auto w-full overflow-x-auto">
            <thead>
              <tr className="border border-gray-400 bg-red-500 text-white">
                <th className="text-center py-2 min-w-[40px] border">No.</th>
                <th className="text-center py-2 min-w-[175px] border">Order Code</th>
                <th className="text-center py-2 min-w-[225px] border">User Email</th>
                <th className="text-center py-2 min-w-[75px] border">Order Status</th>
                <th className="text-center py-2 min-w-[80px] border">Payment Status</th>
                <th className="text-center py-2 min-w-[97px] border">Updated At</th>
                <th className="text-center py-2 min-w-[150px] border">Order Product List</th>
              </tr>
            </thead>
            <tbody>
              {orders?.map((el, idx) => (
                <tr key={el._id} className="border-b border-gray-400">
                  <td className="text-center py-2 text-no-wrap border">{idx + 1 + itemIndex}</td>
                  <td className="text-center py-2 text-no-wrap border">{el.orderCode}</td>
                  <td className="text-center py-2 text-no-wrap border">{el.email}</td>
                  <td className="text-center py-2 text-no-wrap border">{el.status}</td>
                  <td className="text-center py-2 text-no-wrap border">{el.paymentStatus}</td>
                  <td className="text-center py-2 text-no-wrap border">
                    {moment(el.updatedAt)?.format('DD/MM/YYYY')}
                  </td>
                  <td className="text-center py-2 text-no-wrap border">
                    <span
                      className="flex justify-center items-center gap-2 cursor-pointer"
                      onClick={() => handleViewProductList(el._id, el.orderBy)}
                    >
                      <span className="text-green-700 font-semibold">
                        {isOrderViewing ? 'Hide Detail' : 'View Detail'}
                      </span>
                      {isOrderViewing ? <GoEye size={24} color='green' /> : <GoEyeClosed size={24} color='green' />}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="md:w-full flex justify-end my-8 px-4 overflow-x-auto">
          <Pagination totalCount={counts} />
        </div>
      </div>
      {
        orderViewDetail && (
          <div className="absolute min-h-screen top-0 left-0 right-0 bottom-0 bg-overlay z-50 flex flex-col justify-center items-center">
            <div className={`relative bg-white w-full md:ml-10 md:w-[65%] md:h-auto rounded-md overflow-auto 
              ${isClosing ? 'animate-side-right-close' : 'animate-side-right'}`}>
              <OrderDetailViewUser orderId={orderId} orderBy={orderById} />
              <span
                className="absolute top-3 right-3 p-3 text-gray-700 hover:rounded-full hover:text-main cursor-pointer"
                onClick={handleCloseOrderDetailView}
              >
                <IoClose size={24} />
              </span>
            </div>
          </div>
        )
      }
    </>
  );
};

export default withBaseComponent(History);
