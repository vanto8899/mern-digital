import { apiGetCouponById, apiGetProductNoLimit, apiUpdateCouponToUser } from 'apis'
import { Button } from 'components'
import OrderItem from 'components/Products/OrderItem'
import withBaseComponent from 'hocs/withBaseComponent'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { createSearchParams } from 'react-router-dom'
import Swal from 'sweetalert2'
import { formatMoney } from 'utils/helpers'
import path from 'utils/path'
import StepProgressBar from 'react-step-progress'
import 'react-step-progress/dist/index.css'
import { getCurrent } from 'store/users/asyncActions'
import { showCart } from 'store/app/appSlice'
import { FaCartArrowDown } from 'react-icons/fa6'
import moment from 'moment'

const DetailCart = ({ location, navigate, dispatch }) => {
    const { currentCart, current } = useSelector(state => state.user)
    const [productsStock, setProductsStock] = useState({})
    const [coupon, setCoupon] = useState({ discount: 0, isExpired: false, message: "" });
    const [couponId, setCouponId] = useState('');
    const [currentStep, setCurrentStep] = useState(1) // State để lưu trữ bước hiện tại

    // Check and go to payment
    const handleSubmit = () => {
        if (!current?.address) return Swal.fire({
            icon: 'info',
            title: 'Almost!',
            text: 'Please update your address before checkout order!',
            showCancelButton: true,
            showConfirmButton: true,
            confirmButtonText: 'Go update',
            cancelButtonText: 'Cancel'
        }).then((rs) => {
            if (rs.isConfirmed === true) navigate({
                pathname: `/${path.MEMBER}/${path.PERSONAL}`,
                search: createSearchParams({ redirect: location.pathname }).toString()
            })
        })
        else {
            //window.open(`/${path.CHECKOUT}`, "_blank")
            navigate(`/${path.CHECKOUT}`, "_blank")
        }
        setCouponId('') // clear coupon code input
    }

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
        dispatch(getCurrent())
    }, []);

    // Get coupon and update coupon to user
    const handleGetBtnGetCoupon = () => {
        if (couponId) {
            handleGetCouponById(couponId, current?._id);
        } else
            setCoupon({ discount: 0, isExpired: false, message: "" });
    };

    // update coupon to user
    const handleUpdateCouponToUser = async (uid, couponId) => {
        const response = await apiUpdateCouponToUser(uid, couponId)
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
    const cartTotalPrice = currentCart?.reduce((sum, el) => sum + Number(el?.price) * el.quantity, 0) || 0;
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

    // title progress bar
    const stepTitles = ['Ordering', 'Payment', 'Shipping', 'Completed'];

    return (
        <div className="w-full relative px-4 md:mr-0">
            <header className='p-4 border-b border-gray-300 flex justify-between items-center'>
                <span className='text-3xl font-semibold '>Your Ordering</span>
                <div
                    onClick={() => dispatch(showCart())}
                    className='flex items-center justify-center gap-2 px-6 mr-1 border-r cursor-pointer'
                >
                    <FaCartArrowDown color='green' size={32} />
                    <span className='text-sm text-green-700'>{`${current?.cart?.length} item(s)`}</span>
                </div>
            </header>
            <div className='w-full px-4 md:flex md:flex-col md:items-center'>
                <div className='flex max-h-[400px] flex-col border my-4 md:w-full md:max-h-[500px] overflow-x-auto'>
                    <div className='w-main md:w-full'>
                        <div className='w-full bg-main font-bold py-3 grid grid-cols-10 sticky top-0'>
                            <span className='col-span-6 w-full text-left p-2 text-white'>Products</span>
                            <span className='col-span-1 w-full text-center p-2 text-white'>Quantity</span>
                            <span className='col-span-3 w-full text-center p-2 text-white'>Price</span>
                        </div>
                        <div className='overflow-y-auto max-h-[300px]'>
                            {currentCart?.map(el => (
                                <OrderItem
                                    key={el._id}
                                    dfQuantity={el.quantity}
                                    color={el.color}
                                    title={el.title}
                                    thumbnail={el.thumbnail}
                                    price={el.price}
                                    pid={el.product?._id}
                                    stock={productsStock[el.product?._id] || 0}
                                />
                            ))}
                        </div>
                    </div>
                </div>
                <div className='flex flex-col md:flex-row md:justify-between my-4 md:w-full gap-8 overflow-auto'>
                    <div className='md:w-[60%] border border-gray-300'>
                        <div className='w-full flex flex-col p-4 rounded'>
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
                        {/* Input coupon id here to find discount */}
                        <div className='w-full md:w-[50%] flex flex-col p-4 gap-4 rounded mt-4'>
                            <span className='font-bold mb-2'>Coupon:</span>
                            <input
                                type='text'
                                placeholder='Enter coupon code'
                                className='p-2 border border-gray-300 rounded'
                                value={couponId}
                                onChange={(event) => setCouponId(event.target.value)}
                            />
                            <Button className='mt-2' handleOnclick={handleGetBtnGetCoupon}>Redeem</Button>
                        </div>
                    </div>
                    <div className='md:w-[40%] flex flex-col md:items-start gap-4 border border-gray-300'>
                        <span className='flex items-center gap-16 text-sm p-4'>
                            <span className='font-bold text-xl text-green-700 md:text-xl'>Discount :</span>
                            <span className='text-blue-700 font-semibold text-xl md:text-xl'>
                                {coupon && coupon.discount ? `${coupon.discount} %` : "No coupon"}
                            </span>
                        </span>
                        <span className='flex items-center gap-16 text-sm p-4'>
                            <span className='font-bold text-xl text-green-700 md:text-xl'>Shipping Fee :</span>
                            <span className='text-blue-700 font-semibold text-xl md:text-xl'>
                                {shippingFee > 0 ? `${formatMoney(shippingFee)} VND` : "No shipping fee"}
                            </span>
                        </span>
                        <span className='flex items-center gap-16 text-sm p-4'>
                            <span className='font-bold text-x md:text-2xl'>SUBTOTAL :</span>
                            <span className='text-main font-bold text-xl md:text-2xl'>
                                {formatMoney(subtotal) + " VND"}
                            </span>
                        </span>
                        <span className='text-center text-gray-400 italic text-xs md:text-sm p-4'>
                            Shipping, taxes, and discounts calculated at checkout.
                        </span>
                        <span className='flex justify-end md:w-[70%] p-4'>
                            <Button fw handleOnclick={handleSubmit}>Checkout</Button>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default withBaseComponent(DetailCart);
