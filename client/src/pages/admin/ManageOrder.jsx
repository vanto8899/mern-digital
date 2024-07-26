import React, { useEffect, useState } from 'react';
import { InputForm, Pagination } from 'components';
import OrderInformationDetail from 'components/Modals/OrderInformationDetail'
import OrderDetailView from 'components/Modals/OrderDetailView'
import withBaseComponent from 'hocs/withBaseComponent';
import moment from 'moment';
import Swal from 'sweetalert2';
import { apiDeleteOrders, apiGetOrders } from 'apis';
import { createSearchParams, useSearchParams } from 'react-router-dom';
import useDebounce from 'hooks/useDebounce';
import { formatMoneyVND, formatPriceVND } from 'utils/helpers';
import { FaEdit } from 'react-icons/fa';
import { MdOutlineAutoDelete } from 'react-icons/md';
import { GoEye, GoEyeClosed } from 'react-icons/go';
import { IoClose } from 'react-icons/io5';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';

const ManageOrder = ({ navigate, location }) => {
    const {
        register,
        formState: { errors },
        watch,
    } = useForm();
    const [params] = useSearchParams();
    const [orders, setOrders] = useState(null);
    const [counts, setCounts] = useState(0);
    const [update, setUpdate] = useState(false);
    const [orderViewDetail, setOrderViewDetail] = useState(false);
    const [orderId, setOrderId] = useState(null);
    const [orderById, setOrdeByrId] = useState(null);
    const [isOrderViewing, setIsOrderViewing] = useState(false);
    const [isOrderInfoViewing, setIsOrderInfoViewing] = useState(false);
    const [isOrderInfoId, setIsOrderInfoId] = useState(null);
    const [formClosed, setFormClosed] = useState(false); // State to track form closure
    const [isClosing, setIsClosing] = useState(false); // State for closing animation

    const render = () => {
        setUpdate(!update);
    };
    // get all orders
    const fetchOrders = async (params) => {
        try {
            const response = await apiGetOrders({
                ...params,
                limit: process.env.REACT_APP_PRODUCT_LIMIT,
                sort: "-createdAt"
            });
            if (response.success) {
                setCounts(response.counts);
                setOrders(response.orders);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
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
    }, [params, update]);

    // Delete order 
    const handleDeleteOrder = (oid) => {
        Swal.fire({
            title: 'Order Deleting...',
            text: 'Do you want to remove this Order?',
            icon: 'warning',
            showCancelButton: true,
        }).then(async (rs) => {
            if (rs.isConfirmed) {
                const response = await apiDeleteOrders(oid);
                if (response.success) {
                    render();
                    toast.success(response.message);
                } else {
                    toast.error(response.message);
                }
            }
        });
    };

    // State open update info form
    const handleUpdateOrderinfo = async (oid) => {
        setIsOrderInfoId(oid);
        setIsOrderInfoViewing(true);
    };

    // State open product list in order
    const handleViewProductList = async (oid, orderBy) => {
        setOrderId(oid);
        setOrdeByrId(orderBy)
        setOrderViewDetail(true);
        setIsOrderViewing(!isOrderViewing);
    };

    const handleCloseOrderInfoDetail = () => {
        setFormClosed(true); // Trigger form closed state change
        setIsClosing(true);
        setTimeout(() => {
            setIsClosing(false);
            setIsOrderInfoViewing(false);
        }, 500); // Adjust timeout duration to match CSS animation
    };

    const handleCloseOrderDetailView = () => {
        setFormClosed(true); // Trigger form closed state change
        setIsOrderViewing(!isOrderViewing);
        setIsClosing(true);
        setTimeout(() => {
            setIsClosing(false);
            setOrderViewDetail(false);
        }, 500); // Adjust timeout duration to match CSS animation
    };

    useEffect(() => {
        if (formClosed) {
            fetchOrders(params); // Fetch orders after closing form
            setFormClosed(false); // Reset form closed state
        }
    }, [formClosed, params]);

    // set # per page
    const currentPage = parseInt(params.get('page')) || 1;
    const limit = parseInt(process.env.REACT_APP_PRODUCT_LIMIT);
    const itemIndex = (currentPage - 1) * limit;

    return (
        <>
            <div className="w-full relative">
                <header className="text-3xl font-semibold p-4 bg-gray-100 border-b border-gray-500 text-main">
                    History all Orders
                </header>
                <div className="flex flex-col w-full mb-4 gap-4 md:flex-row md:items-center md:justify-end md:mb-0 md:px-4">
                    <form className="md:w-[60%] p-4 grid grid-cols-1 md:p-0 md:grid-cols-3 gap-4">
                        <div>
                            <InputForm
                                id="orderCode"
                                register={register}
                                errors={errors}
                                fullWidth
                                placeholder="Search ordeCode..."
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
                <div className="w-full px-4 overflow-x-auto md:overflow-visible">
                    <div className="overflow-x-auto max-h-[400px] md:max-h-[520px] md:w-full">
                        <table className="table-auto text-left w-full my-2">
                            <thead className="font-bold bg-red-500 text-[14px] text-white sticky top-0 z-30">
                                <tr className="border border-gray-50">
                                    <th className="text-center py-2 min-w-[40px] border">No.</th>
                                    <th className="text-center py-2 min-w-[175px] border">Order Code</th>
                                    <th className="text-center py-2 min-w-[200px] border">Order Email</th>
                                    <th className="text-center py-2 min-w-[100px] border">Order Name</th>
                                    <th className="text-center py-2 min-w-[100px] border">Order Phone</th>
                                    <th className="text-center py-2 min-w-[200px] border">Shipping Address</th>
                                    <th className="text-center py-2 min-w-[200px] border">Order Messages</th>
                                    {/*  <th className="text-center py-2 min-w-[130px] border">Total</th> */}
                                    <th className="text-center py-2 min-w-[75px] border">Order Status</th>
                                    <th className="text-center py-2 min-w-[80px] border">Payment Status</th>
                                    <th className="text-center py-2 min-w-[97px] border">Updated At</th>
                                    <th className="text-center py-2 min-w-[150px] border">Order Product List</th>
                                    <th className="text-center py-2 min-w-[80px] border">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders?.map((el, idx) => (
                                    <tr key={el._id} className="border-b">
                                        <td className="text-center py-2 border border-gray-50">{idx + 1 + itemIndex}</td>
                                        <td className="text-center py-2 text-no-wrap border border-gray-50">{el.orderCode}</td>
                                        <td className="text-center py-2 text-no-wrap border border-gray-50">{el.email}</td>
                                        <td className="text-center py-2 text-no-wrap border border-gray-50">{el.name}</td>
                                        <td className="text-center py-2 text-no-wrap border border-gray-50">{el.mobile}</td>
                                        <td className="text-center py-2 border">{el.address}</td>
                                        {/* <td className="text-center py-2 text-no-wrap border">
                                            {`${formatMoneyVND(formatPriceVND(el.total) * 23500)} VND`}
                                        </td> */}
                                        <td className="text-center py-2 border">{el.message}</td>
                                        <td className="text-center py-2 text-no-wrap border border-gray-50">{el.status}</td>
                                        <td className="text-center py-2 text-no-wrap border border-gray-50">{el.paymentStatus}</td>
                                        <td className="text-center py-2 text-no-wrap border border-gray-50">
                                            {moment(el.updatedAt)?.format('DD/MM/YYYY')}
                                        </td>
                                        <td className="text-center py-2 text-no-wrap border border-gray-50">
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
                                        <td className="text-center py-2 text-no-wrap border border-gray-50">
                                            <div className="flex items-center justify-center gap-4">
                                                <span
                                                    className="text-blue-700 cursor-pointer 
                            transition-transform transform hover:scale-125 hover:text-blue-500"
                                                    onClick={() => handleUpdateOrderinfo(el._id)}
                                                    title="Update info"
                                                >
                                                    <FaEdit size={20} />
                                                </span>
                                                <span
                                                    className="text-orange-700 cursor-pointer 
                            transition-transform transform hover:scale-125 hover:text-orange-500"
                                                    onClick={() => handleDeleteOrder(el._id)}
                                                    title="Delete order"
                                                >
                                                    <MdOutlineAutoDelete size={20} />
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>

                        </table>
                    </div>
                </div>
                <div className="md:w-full flex justify-end my-8 px-4 overflow-x-auto">
                    <Pagination totalCount={counts} />
                </div>
            </div>
            {/*  modal */}
            {orderViewDetail && (
                <div className="absolute min-h-screen top-0 left-0 right-0 bottom-0 bg-overlay z-50 flex flex-col justify-center items-center">
                    <div className={`relative bg-white w-full md:ml-10 md:w-[65%] md:h-auto rounded-md overflow-auto 
                        ${isClosing ? 'animate-side-right-close' : 'animate-side-right'}`}>
                        <OrderDetailView orderId={orderId} orderBy={orderById} />
                        <span
                            className="absolute top-3 right-3 p-3 text-gray-700 hover:rounded-full hover:text-main cursor-pointer"
                            onClick={handleCloseOrderDetailView}
                        >
                            <IoClose size={24} />
                        </span>
                    </div>
                </div>
            )}
            {isOrderInfoViewing && (
                <div className="absolute min-h-screen top-0 left-0 right-0 bottom-0 bg-overlay z-50 flex flex-col justify-center items-center">
                    <div className={`relative bg-white w-full md:ml-10 md:w-[40%] md:h-auto rounded-md
                        ${isClosing ? 'animate-side-right-close' : 'animate-slide-top-lg'}`}>
                        <OrderInformationDetail orderId={isOrderInfoId} />
                        <span
                            className="absolute top-3 right-3 p-3 text-gray-700 hover:rounded-full hover:text-main cursor-pointer"
                            onClick={handleCloseOrderInfoDetail}
                        >
                            <IoClose size={24} />
                        </span>
                    </div>
                </div>
            )}
        </>
    );
};

export default withBaseComponent(ManageOrder);
