import React, { useEffect, useState } from 'react';
import payment01 from 'assests/payment02.png';
import { formatMoney } from 'utils/helpers';
import { AdminPaypal, Congrat, LoadingCategoryComponent } from 'components';
import withBaseComponent from 'hocs/withBaseComponent';
import StepProgressBar from 'react-step-progress';
import 'react-step-progress/dist/index.css';
import { apiCreateOrderByUserId, apiCreateZalopayOrder, apiGetCouponById, apiGetUserById, apiGetZalopayOrderStatus } from 'apis';
import paypalIcon from '../../assests/paypal02.png'
import zalopayIcon from '../../assests/zalo-pay-logo-png-2.png'
import shipmanIcon from '../../assests/delivery-man.png'
import Swal from 'sweetalert2';
import { useDispatch } from 'react-redux';

const Checkout = ({ userId }) => {
    const [userCurrentCart, setUserCurrentCart] = useState([]);
    const [userCurrent, setUserCurrent] = useState(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const [currentStep, setCurrentStep] = useState(2); // State to store the current step
    const [coupon, setCoupon] = useState("")
    const [selectedPayment, setSelectedPayment] = useState('');
    const [isPaypalShow, setIsPaypalShow] = useState(false);
    const [isZalopayShow, setIsZalopayShow] = useState(false);
    const [isCashShow, setIsCashShow] = useState(false);
    const [orderData, setOrderData] = useState({});
    const [loading, setLoading] = useState(false)
    const [transID, setTransID] = useState(null)
    const [isPolling, setIsPolling] = useState(true);

    const COMPLETED_STEP_INDEX = 3;

    // Get user by id to get current cart
    const fetchUserCurrentCart = async () => {
        try {
            const response = await apiGetUserById(userId);
            if (response.success && response.res.cart) {
                setUserCurrentCart(response.res.cart);
                setUserCurrent(response.res);
            } else {
                console.error("Failed to fetch cart or cart is empty");
            }
        } catch (error) {
            console.error("Error fetching cart: ", error);
        }
    };

    useEffect(() => {
        fetchUserCurrentCart();
    }, [userId]);

    // get coupon by id
    const fetchCouponById = async (cid) => {
        const response = await apiGetCouponById(cid);
        if (response.success) {
            console.log(response.coupon)
            setCoupon(response.coupon)
        }
    };

    useEffect(() => {
        if (userCurrent && userCurrent?.coupon) {
            fetchCouponById(userCurrent.coupon);
        }
    }, [userCurrent]);

    useEffect(() => {
        if (isSuccess) {
            fetchUserCurrentCart();
            setCurrentStep(COMPLETED_STEP_INDEX);
        }
    }, [isSuccess]);

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

    // Get full address from user information
    const fullAddress = `${userCurrent?.address || ''}, ${userCurrent?.ward || ''}, ${userCurrent?.district || ''}, ${userCurrent?.city || ''}`;
    const textMessage = `${userCurrent?.message || "Don hang se giao den nhanh nhat co the"}`;
    const couponId = userCurrent?.coupon

    // Handle payment method change
    const handlePaymentChange = (event) => {
        const paymentMethod = event.target.value;
        setSelectedPayment(paymentMethod);
        setIsCashShow(paymentMethod === 'Cash');
        setIsPaypalShow(paymentMethod === 'Paypal');
        setIsZalopayShow(paymentMethod === 'Zalopay');
    };

    useEffect(() => {
        setOrderData({
            products: userCurrentCart,
            total: subtotal,
            address: fullAddress,
            message: textMessage,
            couponId: couponId,
        });
    }, [userCurrent, userCurrentCart]);

    // Create order by cash (COD)
    const handleSaveOrder = async () => {
        try {
            const response = await apiCreateOrderByUserId(userId, { ...orderData, status: "Succeed", paymentStatus: "Pending" });
            if (response.success) {
                setLoading(true) // Start loading
                setIsSuccess(true);
                setTimeout(() => {
                    Swal.fire("Congratulations!", "Your order was created!", "success")
                }, 500);
            } else {
                Swal.fire("Error", response.error || "An error occurred while creating your order", "error");
            }
        } catch (error) {
            Swal.fire("Error", error.response?.data?.error || error.message || "Please try again.", "error");
            setLoading(false);
        }
    };

    /* Create order by ZaloPay */
    const handleOrderAndZaloPayment = async () => {
        try {
            const orderData = {
                products: userCurrentCart,
                total: subtotal,
                address: fullAddress,
                message: textMessage,
                couponId: couponId,
            };
            const response = await apiCreateZalopayOrder(userId, orderData);
            if (response.success) {
                const { paymentResponse } = response;
                setTransID(paymentResponse?.app_trans_id);
                setIsPolling(true);

                if (paymentResponse && paymentResponse.order_url) {
                    window.open(paymentResponse.order_url, "_blank");
                } else {
                    console.error('Invalid payment response:', paymentResponse);
                }
            } else {
                Swal.fire("Error", response.error || "An error occurred while creating your order");
            }

        } catch (error) {
            Swal.fire("Error", error.response?.data?.error || error.message || "Please try again.", "error");
        }
    };
    /* tracking order status */
    useEffect(() => {
        //console.log('Polling useEffect triggered with transID:', transID, 'and isPolling:', isPolling);
        const checkStatus = async () => {
            await checkOrderStatus();
        };

        if (isPolling && transID) {
            //console.log('Starting polling...');
            const intervalId = setInterval(async () => {
                if (isPolling) {
                    //console.log('Polling active, calling checkStatus...');
                    await checkStatus();
                } else {
                    console.log('Polling stopped, skipping checkStatus call...');
                }
            }, 5000); // Kiểm tra mỗi 5 giây

            return () => {
                //console.log("Clearing interval with ID:", intervalId);
                clearInterval(intervalId);
            };
        }
    }, [transID, isPolling]);

    useEffect(() => {
        console.log('isPolling state changed:', isPolling);
        if (!isPolling) {
            console.log("Polling stopped.");
        }
    }, [isPolling]);

    /* Get payment status */
    const checkOrderStatus = async () => {
        try {
            const response = await apiGetZalopayOrderStatus(transID);
            //console.log('API Response:', response); // Log toàn bộ phản hồi
            if (response.return_code === 1 || response.return_code === '1') {
                //console.log("Setting isSuccess to true and stopping polling");
                setIsSuccess(true);
                setIsPolling(false); // Dừng polling
                setTimeout(() => {
                    Swal.fire("Congratulations!", "Your order was created!", "success")
                }, 500);

            }
            if (response.return_code === 2 || response.return_code === '2') {
                //console.log("Setting isSuccess to true and stopping polling");
                setIsPolling(false); // Dừng polling
                fetchUserCurrentCart();
                setCurrentStep(COMPLETED_STEP_INDEX);
                setTimeout(() => {
                    Swal.fire({
                        title: "Oops!",
                        text: "Payment unsuccessful!",
                        icon: "info"
                    })
                }, 500);
            }
            else {
                console.log("Error: Invalid return code");
            }
        } catch (error) {
            console.error('Error checking order status:', error);
        }
    };

    // Titles for step progress 
    const stepTitles = ['Ordering', 'Payment', 'Shipping', 'Completed'];

    return (
        <div className='p-4 max-h-screen overflow-y-auto gap-6 bg-sky-50 z-30'>
            {isSuccess && <Congrat />}
            {/* Main content */}
            {loading ? (
                <LoadingCategoryComponent />
            ) : (
                <div className='w-full flex flex-col gap-2'>
                    <h2 className='text-3xl font-bold text-main text-center md:text-left'>Checkout Your Order</h2>
                    <span className='w-full flex justify-center items-center p-4'>
                        <img src={payment01} alt="payment" className='h-[30%] w-[30%] object-cover' />
                    </span>
                    {/* Product details table */}
                    <div className='w-full max-w-full max-h-[200px] overflow-auto'>
                        <table className='w-full table-auto'>
                            <thead className='sticky top-0 bg-blue-800'>
                                <tr>
                                    <th className='p-3 text-white'>Products</th>
                                    <th className='text-center p-3 text-white'>Quantity</th>
                                    <th className='text-right p-3 text-white'>Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {userCurrentCart.map(el => (
                                    <tr key={el._id} className='border'>
                                        <td className='p-2'>{el.title}</td>
                                        <td className='text-center p-2'>{el.quantity}</td>
                                        <td className='text-right p-2 font-semibold'>{formatMoney(el.price) + ' VND'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className='w-full flex flex-col rounded mt-2 p-4 border'>
                        <span className='font-bold text-lg text-blue-800'>Ordering progress:</span>
                        <StepProgressBar
                            startingStep={currentStep}
                            steps={stepTitles.map(title => ({
                                label: title,
                                name: title.toLowerCase(),
                            }))}
                            activeColor='#f0bb31'
                            circleFontColor='transparent'
                            buttonWrapperClass="hide-buttons"
                            labelClass="label-xs"
                        />
                    </div>
                    {/* Order and payment information */}
                    <div className='flex flex-col gap-2'>
                        {/* Subtotal and Address */}
                        <div className='flex flex-col gap-2 p-4 border'>
                            <div className='flex items-center gap-2'>
                                <span className='font-bold text-lg text-blue-800'>Discount :</span>
                                <span className='text-main font-bold text-lg'>
                                    {coupon ? `${coupon.discount} % in total` : "No coupon"}
                                </span>
                            </div>
                            <div className='flex items-center gap-2'>
                                <span className='font-bold text-lg text-blue-800'>Shipping fee :</span>
                                <span className='text-main font-bold text-lg'>
                                    {shippingFee > 0 ? `${formatMoney(shippingFee)} VND` : "No shipping fee"}
                                </span>
                            </div>
                            <div className='flex items-center gap-2'>
                                <span className='font-bold text-lg text-blue-800'>Subtotal :</span>
                                <span className='text-main font-bold text-lg'>
                                    {formatMoney(subtotal) + " VND"}
                                </span>
                            </div>
                            <div className='flex items-center gap-2'>
                                <span className='font-bold text-lg text-blue-800 text-nowrap'>Shipping Address :</span>
                                <span className='text-sm italic'>
                                    {fullAddress}
                                </span>
                            </div>
                            <div className='flex items-center gap-2'>
                                <span className='font-bold text-lg text-blue-800'>Notes:</span>
                                <textarea
                                    className="w-full p-2 bg-sky-100 border border-gray-300 rounded-lg placeholder:italic placeholder:text-sm"
                                    rows="4"
                                    placeholder="Enter your message here..."
                                    value={userCurrent?.message}
                                    disabled
                                ></textarea>
                            </div>
                        </div>
                        {/* Payment methods */}
                        <div className='flex flex-col gap-2 p-4 border'>
                            <header className='font-bold text-lg text-blue-800'>Payment Methods:</header>
                            <div className='w-full flex flex-col mx-auto my-4'>
                                <label className='flex items-center gap-2 border p-4'>
                                    <input
                                        type='radio'
                                        name='payment'
                                        value='Cash'
                                        checked={selectedPayment === 'Cash'}
                                        onChange={handlePaymentChange}
                                        className='form-radio'
                                    />
                                    <span className='w-full flex items-center justify-start gap-4'>
                                        <img src={shipmanIcon} alt="icon" className='w-12 h-12 object-contain' />
                                        <span className='flex flex-col'>
                                            <span className='font-semibold'>Cash on delivery (COD)</span>
                                            <span className='text-sm'>Customers pay cash to delivery staff
                                                when the product is delivered to the shipping address.</span>
                                        </span>
                                    </span>
                                </label>
                                <label className='flex items-center gap-2 border p-4'>
                                    <input
                                        type='radio'
                                        name='payment'
                                        value='Paypal'
                                        checked={selectedPayment === 'Paypal'}
                                        onChange={handlePaymentChange}
                                        className='form-radio'
                                    />
                                    <span className='w-full flex items-center justify-start gap-4'>
                                        <img src={paypalIcon} alt="icon" className='w-12 h-12 object-contain' />
                                        <span className='flex flex-col'>
                                            <span className='font-semibold'>Payment by PayPal</span>
                                            <span className='text-sm'>Use the balance in your PayPal wallet to make payments.
                                                You will be redirected to the PayPal system to proceed with the payment.</span>
                                        </span>
                                    </span>
                                </label>
                                <label className='flex items-center gap-2 mt-2 border p-4'>
                                    <input
                                        type='radio'
                                        name='payment'
                                        value='Zalopay'
                                        checked={selectedPayment === 'Zalopay'}
                                        onChange={handlePaymentChange}
                                        className='form-radio'
                                    />
                                    <span className='w-full flex items-center justify-start gap-4'>
                                        <img src={zalopayIcon} alt="icon" className='w-12 h-12 object-contain' />
                                        <span className='flex flex-col'>
                                            <span className='font-semibold'>Payment by ZaloPay</span>
                                            <span className='text-sm'>Use the balance in your ZaloPay wallet to make payments.
                                                You will be redirected to the ZaloPay system to proceed with the payment.</span>
                                        </span>
                                    </span>
                                </label>
                            </div>
                        </div>
                        {/* Cash button */}
                        {isCashShow &&
                            <div className='w-full flex justify-center items-center mt-4'>
                                <button
                                    className='w-full md:w-[50%] mt-4 p-3 bg-main text-white text-xl 
                            font-semibold rounded hover:bg-red-700'
                                    onClick={handleSaveOrder}
                                >
                                    Cash (COD)
                                </button>
                            </div>
                        }
                        {/* Zalopay button */}
                        {isZalopayShow &&
                            <div className='w-full flex justify-center items-center mt-4'>
                                <button
                                    className='w-full md:w-[50%] mt-4 p-3 bg-blue-500 text-white text-2xl 
                            font-semibold rounded hover:bg-blue-700'
                                    onClick={() => handleOrderAndZaloPayment()}
                                >
                                    ZaloPay
                                </button>
                            </div>
                        }
                        {/* Paypal button */}
                        {isPaypalShow &&
                            <div className='w-[90%] md:w-[50%] mx-auto mt-4'>
                                <AdminPaypal
                                    amount={Math.round(subtotal / 23500)} // use subtotal here
                                    payload={{
                                        products: userCurrentCart,
                                        total: subtotal, // use subtotal here,
                                        address: fullAddress,
                                        message: textMessage,
                                        couponId: couponId,
                                    }}
                                    setIsSuccess={setIsSuccess}
                                    userId={userId}
                                />
                            </div>
                        }
                    </div>
                </div>
            )}

        </div>
    );
};

export default withBaseComponent(Checkout);
