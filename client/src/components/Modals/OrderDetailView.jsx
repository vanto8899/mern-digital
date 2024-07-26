import { apiGetCouponById, apiGetOrderById, apiGetProducts, apiUpdateCouponToUser, apiUpdateOrderById } from 'apis';
import { Button } from 'components';
import OrderItemCustom from 'components/Products/OrderItemCustom'
import AddProduct from 'components/Products/AddProduct'
import withBaseComponent from 'hocs/withBaseComponent';
import moment from 'moment';
import { enqueueSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react';
import { IoMdArrowDropdown, IoMdArrowDropup } from 'react-icons/io';
import { LuArrowUpDown } from "react-icons/lu";
import Swal from 'sweetalert2';
import { formatMoney } from 'utils/helpers';

const OrderDetailView = ({ orderId, orderBy }) => {
    const [orders, setOrders] = useState([]);
    const [couponId, setCouponId] = useState("")
    const [coupon, setCoupon] = useState("")
    const [isShowAddProduct, setIsShowAddProduct] = useState(false);
    const [quantities, setQuantities] = useState({});
    const [productsStock, setProductsStock] = useState({});
    const [updateProductTrigger, setUpdateProductTrigger] = useState(false);// trigger update product items in table
    const [updateStockTrigger, setUpdateStockTrigger] = useState(false); // trigger update stock of each product

    // Fetch order by ID
    const fetchOrderDetailView = async () => {
        try {
            const response = await apiGetOrderById(orderId);
            if (response.success && response.order?.products) {
                const initialQuantities = response.order?.products.reduce((acc, product) => {
                    acc[product._id] = product.quantity;
                    return acc;
                }, {});
                setOrders(response.order?.products);
                setCouponId(response.order.coupon || ""); // Ensure couponId is set or empty
                setQuantities(initialQuantities);
            } else {
                console.error("Failed to fetch order details or order is empty");
            }
        } catch (error) {
            console.error("Error fetching order details: ", error);
        }
    };
    //console.log("order infor", coupon)
    // Handle quantity change
    const handleQuantityChange = (id, quantity) => {
        setQuantities(prev => ({
            ...prev,
            [id]: quantity
        }));
    };

    // Handle update order submission
    const handleSubmit = () => {
        Swal.fire({
            icon: 'info',
            title: 'Confirm Update',
            text: 'Do you want to update order!',
            showCancelButton: true,
            showConfirmButton: true,
            confirmButtonText: 'Update',
            cancelButtonText: 'Cancel'
        }).then(async (rs) => {
            if (rs.isConfirmed) {
                try {
                    const updatedOrders = orders.map(order => ({
                        ...order,
                        quantity: quantities[order._id]
                    }));
                    const subTotal = updatedOrders.reduce((sum, order) => sum + Number(order.price) * quantities[order._id], 0);
                    const total = Math.round(subTotal / 23500); // convert VND to USD display
                    const response = await apiUpdateOrderById(orderBy, orderId, {
                        products: updatedOrders,
                        total,
                        couponId: couponId
                    });

                    if (response.success) {
                        enqueueSnackbar(response.message, { variant: 'success' });
                        fetchOrderDetailView();  // Fetch order details again
                        setUpdateStockTrigger(true); // Trigger stock update
                    } else {
                        enqueueSnackbar(response.message, { variant: 'error' });
                    }
                } catch (error) {
                    console.error("Error updating order: ", error);
                    enqueueSnackbar('Error updating order!', { variant: 'error' });
                }
            }
        });
    };

    // Handle update and render product in order
    const handleUpdateProductOrder = async () => {
        // Using the updated quantities from state directly
        // console.log("Updated quantities: ", quantities);
        await fetchOrderDetailView();
        enqueueSnackbar('Product list updated!', { variant: 'success' });
        setUpdateProductTrigger(prev => !prev); // Toggle the trigger
    };

    // Handle product removal
    const handleProductRemoval = async () => {
        await fetchOrderDetailView();
    };

    // Fetch all products to find stock of product
    const fetchProducts = async (params = {}) => {
        try {
            const response = await apiGetProducts({ ...params });
            if (response.success) {
                const stock = response.products.reduce((acc, product) => {
                    acc[product._id] = product.quantity;
                    return acc;
                }, {});
                setProductsStock(stock);
            }
        } catch (error) {
            console.error("Error fetching products: ", error);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);
    // reset trigger
    useEffect(() => {
        if (updateStockTrigger) {
            fetchProducts();
            setUpdateStockTrigger(false); // Reset trigger
        }
    }, [updateStockTrigger]);

    // Fetch order by ID change every time
    useEffect(() => {
        fetchOrderDetailView();
    }, [orderId]);

    useEffect(() => {
        if (couponId) { // Only call if couponId is not empty
            handleGetCouponById(couponId);
        }
    }, []);

    // Get coupon and update coupon to user
    const handleGetBtnGetCoupon = () => {
        if (!couponId) {
            enqueueSnackbar('No Coupon input!', { variant: 'warning' });
            return;
        }
        handleGetCouponById(couponId, orderBy);
    };

    // get coupon by id and validate
    const handleGetCouponById = async (cid, userId) => {
        const response = await apiGetCouponById(cid);
        if (response.success) {
            const coupon = response.coupon;
            const isExpired = moment(coupon.expiry).isBefore(moment());
            if (isExpired) {
                setCoupon({ discount: 0, isExpired: true, message: "Coupon expired" });
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Coupon expired!',
                });
            } else {
                setCoupon({ discount: coupon.discount, isExpired: false, message: "" });
                await handleUpdateCouponToUser(userId, couponId)
            }
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: response.message || 'An error occurred while fetching the coupon',
            });
        }
    };

    // update coupon to user
    const handleUpdateCouponToUser = async (userId, couponId) => {
        try {
            const response = await apiUpdateCouponToUser(userId, couponId);
            return response;
        } catch (error) {
            console.error("Error updating coupon to user: ", error);
            return { success: false, message: 'An error occurred while updating the coupon' };
        }
    };

    /* Shipping fee: Shipping fee: 1% if total <5 000 000 VND, 
    0.5% if total < 10 000 000 VND, and no shiping fee if total > 10.000.00VND */
    const cartTotalPrice = orders?.reduce((sum, order) => sum + Number(order.price) * quantities[order._id], 0) || 0;
    let shippingFee;
    if (cartTotalPrice < 5000000) {
        shippingFee = cartTotalPrice * 0.01;
    } else if (cartTotalPrice < 10000000) {
        shippingFee = cartTotalPrice * 0.005;
    } else {
        shippingFee = 0;
    }
    // Total price if shipping, coupon
    const discount = coupon ? (cartTotalPrice * coupon.discount) / 100 : 0;
    const subtotal = cartTotalPrice + shippingFee - discount;

    return (
        <div className="w-full relative px-4">
            <header className='text-3xl font-semibold py-4 border-b border-gray-300'>
                Product order list
            </header>
            <div className='w-full md:flex md:flex-col md:items-center'>
                <div className='flex flex-col border my-2 max-h-[400px] md:w-full overflow-auto'>
                    <div className='w-main bg-main mx-auto font-bold py-3 grid grid-cols-10'>
                        <span className='col-span-6 w-full text-left p-2 text-white'>Products</span>
                        <span className='col-span-1 w-full text-center p-2 text-white'>Quantity</span>
                        <span className='col-span-3 w-full text-center p-2 text-white'>Price</span>
                    </div>
                    {orders.map(el => (
                        <OrderItemCustom
                            key={el._id}
                            dfQuantity={quantities[el._id]}
                            onQuantityChange={(quantity) => handleQuantityChange(el._id, quantity)}
                            color={el.color}
                            title={el.title}
                            thumbnail={el.thumbnail}
                            price={el.price}
                            pid={el.product}
                            orderId={orderId}
                            onRemoveProduct={handleProductRemoval} // Pass the callback function render after remove product
                            updateStockTrigger={updateStockTrigger}
                            setUpdateStockTrigger={setUpdateStockTrigger} // Pass the state and setter
                        />
                    ))}
                </div>
                {/* coupon code area */}
                <div className='w-full md:w-[80%] flex flex-col items-center p-4 border rounded 
                                md:justify-end md:flex-row md:gap-24'>
                    <div className='w-full md:w-[80%] flex items-center gap-2'>
                        <span className='font-bold mb-2'>Coupon:</span>
                        <input
                            type='text'
                            placeholder='Enter coupon code'
                            className='w-[80%] p-2 border border-gray-300 rounded'
                            value={couponId}
                            onChange={(event) => setCouponId(event.target.value)}
                        />
                    </div>
                    <div className='w-[58%] md:w-[20%]'><Button fw className='mt-2' handleOnclick={handleGetBtnGetCoupon}>Redeem</Button></div>
                </div>
                <div className='flex flex-col items-center justify-center border md:flex-row md:justify-between md:w-full'>
                    <div className='flex flex-col mb-2 items-center md:p-2 md:border-r-2 md:items-start md:w-[60%] overflow-x-auto md:overflow-visible'>
                        <div className='flex items-center justify-center gap-2 md:justify-between w-full'>
                            <span
                                className='flex items-center justify-center gap-1 p-3 rounded-md text-white bg-main font-semibold my-2 hover:bg-red-700'
                                onClick={() => setIsShowAddProduct(!isShowAddProduct)}
                            >
                                <button>{isShowAddProduct ? 'Hide Products...' : 'Show Products...'}</button>
                                {isShowAddProduct ? <IoMdArrowDropup color='white' size={24} /> : <IoMdArrowDropdown color='white' size={24} />}
                            </span>
                            <span className='flex items-center justify-center gap-1 p-3 rounded-md text-white bg-main font-semibold my-2 hover:bg-red-700'
                                onClick={() => handleUpdateProductOrder()}>
                                <button>Update Products...</button>
                                <LuArrowUpDown color='white' size={24} />
                            </span>
                        </div>
                        {isShowAddProduct && (
                            <div className='w-full mt-2 min-h-[300px] max-h-[400px] p-2 border overflow-auto animate-slide-top-lg'>
                                <AddProduct orderId={orderId} userId={orderBy} updateProductTrigger={updateProductTrigger} />
                            </div>
                        )}
                    </div>
                    <div className='flex flex-col my-2 md:w-[40%] md:items-start gap-4 overflow-x-auto md:overflow-visible'>
                        <span className='flex items-center gap-16 text-sm p-4'>
                            <span className='font-bold text-xl text-green-700 md:text-xl'>Discount:</span>
                            <span className='text-green-700 font-bold text-xl md:text-xl'>
                                {coupon ? `${coupon.discount} % in total` : "No coupon"}
                            </span>
                        </span>
                        <span className='flex items-center gap-16 text-sm p-4'>
                            <span className='font-bold text-xl text-green-700 md:text-xl'>Shipping Free:</span>
                            <span className='text-green-700 font-bold text-xl md:text-xl'>
                                {shippingFee > 0 ? `${formatMoney(shippingFee)} VND` : "No shipping fee"}
                            </span>
                        </span>
                        <span className='flex items-center gap-16 text-sm p-4'>
                            <span className='font-bold text-xl md:text-2xl'>SUBTOTAL:</span>
                            <span className='text-main font-bold text-xl md:text-2xl'>
                                {formatMoney(subtotal) + " VND"}
                            </span>
                        </span>
                        <span className='text-center text-gray-400 italic text-xs md:text-sm p-4'>
                            Shipping, taxes, and discounts calculated at checkout.
                        </span>
                        <span className='flex justify-end md:w-[80%] p-4'>
                            <Button fw handleOnclick={handleSubmit}>Update Order</Button>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default withBaseComponent(OrderDetailView);
