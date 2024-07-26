import { apiGetCouponById, apiGetOrderById, apiGetProducts, apiUpdateCouponToUser, apiUpdateOrderById } from 'apis';
import { OrderItemUser } from 'components';
import withBaseComponent from 'hocs/withBaseComponent';
import React, { useEffect, useState } from 'react';
import { formatMoney } from 'utils/helpers';

const OrderDetailViewUser = ({ orderId, orderBy }) => {
    const [orders, setOrders] = useState([]);
    const [couponId, setCouponId] = useState("")
    const [coupon, setCoupon] = useState("")
    const [quantities, setQuantities] = useState({});

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

    // Fetch order by ID change every time
    useEffect(() => {
        fetchOrderDetailView();
    }, [orderId]);

    // Get coupon by ID
    const handleGetCouponById = async (cid) => {
        if (!cid) return; // Add check to only call if cid is valid
        try {
            const response = await apiGetCouponById(cid);
            if (response.success) {
                setCoupon(response.coupon);
            } else {
                console.error("Failed to fetch coupon details");
            }
        } catch (error) {
            console.error("Error fetching coupon details: ", error);
        }
    };

    useEffect(() => {
        if (couponId) { // Only call if couponId is not empty
            handleGetCouponById(couponId);
        }
    }, [couponId]);

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
                        <OrderItemUser
                            key={el._id}
                            dfQuantity={quantities[el._id]}
                            color={el.color}
                            title={el.title}
                            thumbnail={el.thumbnail}
                            price={el.price}
                            pid={el.product}
                            orderId={orderId}
                        />
                    ))}
                </div>
                {/* coupon code and summary area */}
                <div className='flex flex-col items-center justify-center md:flex-row md:justify-end md:w-full'>
                    <div className='min-w-[400px] flex flex-col my-2 gap-4 md:items-start overflow-x-auto'>
                        <div className='flex items-center justify-between w-full p-4 text-sm'>
                            <span className='font-bold text-green-700 text-xl md:text-xl'>Coupon Code :</span>
                            <span className='text-blue-700 font-semibold text-[15px] md:text-xl'>
                                {coupon ? `${couponId}` : "No coupon"}
                            </span>
                        </div>
                        <div className='flex items-center justify-between w-full p-4 text-sm'>
                            <span className='font-bold text-green-700 text-xl md:text-xl'>Discount :</span>
                            <span className='text-blue-700 font-bold text-xl md:text-xl'>
                                {coupon ? `${coupon.discount} % in total` : "No coupon"}
                            </span>
                        </div>
                        <div className='flex items-center justify-between w-full p-4 text-sm'>
                            <span className='font-bold text-green-700 text-xl md:text-xl'>Shipping Fee :</span>
                            <span className='text-blue-700 font-bold text-xl md:text-xl'>
                                {shippingFee > 0 ? `${formatMoney(shippingFee)} VND` : "No shipping fee"}
                            </span>
                        </div>
                        <div className='flex items-center justify-between w-full p-4 text-sm'>
                            <span className='font-bold text-main text-xl md:text-2xl'>SUBTOTAL :</span>
                            <span className='text-main font-bold text-xl md:text-2xl'>
                                {formatMoney(subtotal) + " VND"}
                            </span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default withBaseComponent(OrderDetailViewUser);
