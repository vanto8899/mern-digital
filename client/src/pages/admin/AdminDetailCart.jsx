import { apiGetCouponById, apiGetProductNoLimit, apiGetUserById, apiUpdateCouponToUser } from 'apis'
import { Button } from 'components'
import OrderItemAdmin from 'components/Products/OrderItemAdmin'
import withBaseComponent from 'hocs/withBaseComponent'
import React, { useEffect, useState } from 'react'
import { formatMoney } from 'utils/helpers'
import StepProgressBar from 'react-step-progress'
import 'react-step-progress/dist/index.css'
import { IoClose } from 'react-icons/io5'
import { AdminCheckout } from '.'
import moment from 'moment'
import Swal from 'sweetalert2'

const AdminDetailCart = ({ userId, triggerFetchOrder }) => {
    const [productsStock, setProductsStock] = useState({})
    const [userCurrentCart, setUserCurrentCart] = useState([]);
    const [isShowCheckout, setIsShowCheckout] = useState(false)
    const [triggerFetch, setTriggerFetch] = useState(false); // State trigger
    const [onRemoveProduct, setOnRemoveProduct] = useState(false); // State trigger
    const [currentStep, setCurrentStep] = useState(1) // State để lưu trữ bước hiện tại
    const [isClosing, setIsClosing] = useState(false); // State for closing animation
    const [coupon, setCoupon] = useState({ discount: 0, isExpired: false, message: "" });
    const [couponId, setCouponId] = useState('');

    // Go to checkout
    const handleSubmit = () => {
        setIsShowCheckout(true)
        setCouponId('') // clear coupon code input
    }

    // Get user by id to get current cart
    const fetchUserCurrentCart = async () => {
        try {
            const response = await apiGetUserById(userId);
            if (response.success && response.res.cart) {
                setUserCurrentCart(response.res.cart);
            } else {
                console.error("Failed to fetch wishlist or wishlist is empty");
            }
        } catch (error) {
            console.error("Error fetching wishlist: ", error);
        }
    };

    useEffect(() => {
        if (userId) {
            fetchUserCurrentCart();
        }
    }, [userId, triggerFetch, triggerFetchOrder, onRemoveProduct, isClosing]);

    // get all product to find stock of product
    const fetchProducts = async () => {
        const response = await apiGetProductNoLimit();
        if (response.success) {
            const stock = response.products.reduce((acc, product) => {
                acc[product._id] = product.quantity;
                return acc;
            }, {});
            setProductsStock(stock);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // close checkout window
    const handleAdminCheckoutClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsClosing(false);
            setIsShowCheckout(false);
            setCoupon({})
        }, 800); // Adjust timeout duration to match CSS animation
    };

    // Get coupon and update coupon to user
    const handleGetBtnGetCoupon = () => {
        if (couponId) {
            handleGetCouponById(couponId, userId)
        } else
            setCoupon({ discount: 0, isExpired: false, message: "" });
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

    // get coupon by id
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
                // Trigger a state update to fetch user cart again if needed
                setTriggerFetch(!triggerFetch);
            }
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: response.message || 'An error occurred while fetching the coupon',
            });
        }
    };

    /* Shipping fee: Shipping fee: 1% if total <5 000 000 VND, 
    0.5% if total < 10 000 000 VND, and no shiping fee if total > 10.000.00VND */
    const cartTotalPrice = userCurrentCart?.reduce((sum, el) => sum + Number(el?.price) * el.quantity, 0) || 0;
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

    const stepTitles = ['Ordering', 'Payment', 'Shipping', 'Completed'];

    return (
        <div className="w-full relative mr-24 md:mr-0">
            <header className='text-[28px] text-main font-semibold p-4 border border-gray-400'>
                DETAIL USER ORDER
            </header>
            {isShowCheckout && (
                <div className="absolute min-h-screen top-0 left-0 right-0 bottom-0 bg-overlay z-50 flex flex-col justify-center items-center">
                    <div className={`w-full md:w-[66%] bg-gray-50 absolute top-1 left-1 ${isClosing ? 'animate-side-left-close' : 'animate-slide-top-lg'}`}>
                        <AdminCheckout userId={userId} />
                        <span
                            className="absolute top-3 right-4 p-3 text-gray-700 hover:rounded-full hover:text-main cursor-pointer"
                            onClick={handleAdminCheckoutClose}
                        >
                            <IoClose size={24} />
                        </span>
                    </div>
                </div>
            )}
            <div className='w-full md:flex md:flex-col md:items-center'>
                <div className='flex max-h-[400px] flex-col border border-gray-400 my-8 
                md:w-full md:max-h-[500px] overflow-x-auto'>
                    <div className='w-main md:w-full'>
                        <div className='w-full font-bold border border-gray-400 py-2 grid grid-cols-10 sticky top-0'>
                            <span className='col-span-6 w-full text-left p-2'>Products</span>
                            <span className='col-span-1 w-full text-center p-2'>Quantity</span>
                            <span className='col-span-3 w-full text-center p-2'>Price</span>
                        </div>
                        {userCurrentCart?.length === 0 && (
                            <span className='text-lg italic text-main p-4'>The cart is empty now!</span>
                        )}
                        <div className='overflow-y-auto max-h-[200px]'>
                            {userCurrentCart?.map(el => (
                                <OrderItemAdmin
                                    key={el._id}
                                    dfQuantity={el.quantity}
                                    color={el.color}
                                    title={el.title}
                                    thumbnail={el.thumbnail}
                                    price={el.price}
                                    pid={el.product?._id}
                                    stock={productsStock[el.product?._id] || 0}
                                    userId={userId}
                                    triggerFetch={() => setTriggerFetch(!triggerFetch)} // Pass the callback
                                    onRemoveProduct={() => setOnRemoveProduct(!onRemoveProduct)} // Pass the callback
                                />
                            ))}
                        </div>
                    </div>
                </div>
                <div className='flex flex-col md:flex-row md:justify-between md:w-full gap-8 overflow-auto'>
                    <div className='md:w-[60%] border border-gray-400'>
                        <div className='w-full flex flex-col p-4 rounded mt-4'>
                            <span className='font-bold mb-2'>Ordering progress:</span>
                            <StepProgressBar
                                startingStep={currentStep}
                                steps={stepTitles.map((title, index) => ({
                                    label: title,
                                    name: title.toLowerCase(),
                                }))}
                                activeColor='#f0bb31'
                                circleFontColor='transparent'
                                buttonWrapperClass="hide-buttons"
                                labelClass="label-xs"
                            />
                        </div>
                        <div className='w-full md:w-[50%] flex flex-col p-4 gap-4 rounded my-6'>
                            <span className='font-bold mb-2'>Coupon:</span>
                            <input
                                type='text'
                                placeholder='Enter coupon code'
                                className='p-2 border border-gray-300 rounded'
                                value={couponId}
                                onChange={(event) => setCouponId(event.target.value)}
                            />
                            <Button fw className='mt-2' handleOnclick={handleGetBtnGetCoupon}>Redeem</Button>
                        </div>
                    </div>
                    <div className='md:w-[40%] flex flex-col md:items-start gap-4 border border-gray-400 overflow-auto'>
                        <span className='flex items-center gap-16 text-sm p-4'>
                            <span className='font-bold text-xl text-green-700 md:text-xl'>Discount:</span>
                            <span className='text-green-700 font-bold text-xl md:text-xl'>
                                {coupon && coupon.discount ? `${coupon.discount} %` : "No coupon"}
                            </span>
                        </span>
                        <span className='flex items-center gap-16 text-sm p-4'>
                            <span className='font-bold text-xl text-green-700 md:text-xl'>Shipping Free:</span>
                            <span className='text-green-700 font-bold text-xl md:text-xl'>
                                {shippingFee > 0 ? `${formatMoney(shippingFee)} VND` : "No shipping fee"}
                            </span>
                        </span>
                        <span className='flex items-center gap-16 text-sm p-4'>
                            <span className='font-bold text-x md:text-2xl'>SUBTOTAL:</span>
                            <span className='text-main font-bold text-xl md:text-2xl'>
                                {formatMoney(subtotal) + " VND"}
                            </span>
                        </span>
                        <span className='text-center text-gray-400 italic text-xs md:text-sm p-4'>
                            Shipping, taxes, and discounts calculated at checkout.
                        </span>
                        <span className='flex justify-end md:w-full p-4'>
                            <Button fw handleOnclick={handleSubmit}>Checkout</Button>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default withBaseComponent(AdminDetailCart);
