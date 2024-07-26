import React, { memo, useState } from 'react';
import DOMPurify from 'dompurify';
import { useSnackbar } from 'notistack';
import Swal from 'sweetalert2';
import { createSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { formatMoney, renderStarFromNumber } from 'utils/helpers';
import icons from 'utils/icons';
import path from 'utils/path';
import labelNew from 'assests/new.png';
import labeTrending from 'assests/trending.png';
import { SelectOption } from 'components';
import { DetailProductPage } from 'pages/public';
import withBaseComponent from 'hocs/withBaseComponent';
import { apiUpdateCart, apiUpdateWishlist } from 'apis';
import { showModal } from 'store/app/appSlice';
import { getCurrent } from 'store/users/asyncActions';
import clsx from 'clsx';

const { AiFillEye, BsFillSuitHeartFill, FaCartPlus, BsCartCheckFill } = icons;

const Product = ({ productData, isNew, normal, detail, navigate, dispatch, location, pid, className }) => {
    const [isShopOption, setIsShopOption] = useState(false);
    const { current } = useSelector(state => state.user);
    const { enqueueSnackbar } = useSnackbar();

    // Handle click events for cart, wishlist, and quick view options
    const handleClickOptions = async (e, flag) => {
        e.stopPropagation();

        // Handle adding product to cart
        if (flag === "CART") {
            // Check if user is logged in
            if (!current) {
                return Swal.fire({
                    title: "Almost!...",
                    text: "Please login first!",
                    icon: "info",
                    cancelButtonText: "Not now!",
                    showCancelButton: true,
                    confirmButtonText: "Go login->"
                }).then((rs) => {
                    if (rs.isConfirmed) navigate({
                        pathname: `/${path.LOGIN}`,
                        search: createSearchParams({ redirect: location.pathname }).toString()
                    });
                });
            }
            // Check if product is already in cart
            const isAlreadyInCart = current?.cart?.some(el => el.product?._id === productData?._id);
            if (isAlreadyInCart) {
                enqueueSnackbar('Product is already in the cart!', { variant: 'info' });
                return;
            }
            // Update cart with product details
            const response = await apiUpdateCart({
                pid: productData?._id,
                color: productData?.color,
                price: productData?.price,
                thumbnail: productData?.thumb,
                title: productData?.title,
                quantity: 1
            });
            if (response.success) {
                enqueueSnackbar(response.message, { variant: 'success' });
                dispatch(getCurrent());
            } else {
                enqueueSnackbar(response.message, { variant: 'error' });
            }
        }

        // Handle adding product to wishlist
        if (flag === "WISHLIST") {
            // Check if user is logged in
            if (!current) {
                return Swal.fire({
                    title: "Almost!...",
                    text: "Please login first!",
                    icon: "info",
                    cancelButtonText: "Not now!",
                    showCancelButton: true,
                    confirmButtonText: "Go login->"
                }).then((rs) => {
                    if (rs.isConfirmed) navigate({
                        pathname: `/${path.LOGIN}`,
                        search: createSearchParams({ redirect: location.pathname }).toString()
                    });
                });
            }
            //
            const response = await apiUpdateWishlist(pid);
            if (response.success) {
                dispatch(getCurrent());
                enqueueSnackbar(response.message, { variant: 'success' });
            } else {
                enqueueSnackbar(response.message, { variant: 'error' });
            }
        }

        // Handle quick view of product
        if (flag === "QUICK_VIEW") {
            dispatch(showModal({
                isShowModal: true,
                modalChildren: <DetailProductPage data={{ pid: productData?._id, category: productData?.category }} isQuickView />
            }));
        }
    };

    return (
        <div className={clsx('w-full text-base px-[10px]', className)}>
            <div onClick={() => navigate(`/${productData?.category?.toLowerCase()}/${productData?._id}/${productData?.title}`)}
                className='cursor-pointer'>
                <div
                    className='w-full border flex-col items-center'
                    onMouseEnter={() => setIsShopOption(true)}
                    onMouseLeave={() => setIsShopOption(false)}
                >
                    <div className='w-full relative'>
                        {isShopOption &&
                            <div className='w-full h-auto absolute bottom-[-110px] p-3 left-0 right-0 bg-white opacity-1 flex flex-col justify-center gap-2 animate-slide-top'>
                                <div className='w-full py-3 flex items-center justify-between border-b-2'>
                                    <h2 className='font-semibold'>{productData?.title}</h2>
                                    <span className='line-clamp-1'>{`${formatMoney(productData?.price)}`} VND</span>
                                </div>
                                {!detail &&
                                    <div>
                                        <ul className='text-sm text-gray-500 list-square pl-4'>
                                            {productData?.description?.length > 1 && productData?.description?.map((el, i) => (
                                                <li key={i} className='leading-6'>{el}</li>
                                            ))}
                                            {productData?.description?.length === 1 &&
                                                <div className='text-sm line-clamp-[10] mb-8' dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(productData?.description[0]) }}></div>
                                            }
                                        </ul>
                                    </div>
                                }
                                <div className='flex items-center justify-center gap-2'>
                                    <span title='Quick view' onClick={(e) => handleClickOptions(e, 'QUICK_VIEW')}>
                                        <SelectOption icon={<AiFillEye size={22} />} />
                                    </span>
                                    {current?.cart?.some(el => el.product?._id === productData?._id)
                                        ? <span title='Added to cart' onClick={(e) => handleClickOptions(e, 'CART')}>
                                            <SelectOption icon={<BsCartCheckFill color='blue' size={22} />} />
                                        </span>
                                        : <span title='Add to cart' onClick={(e) => handleClickOptions(e, 'CART')}>
                                            <SelectOption icon={<FaCartPlus size={22} />} />
                                        </span>
                                    }
                                    <span title='Add to wishlist' onClick={(e) => handleClickOptions(e, 'WISHLIST')}>
                                        <SelectOption icon={<BsFillSuitHeartFill
                                            color={current?.wishlist?.some(i => i._id === pid) ? "green" : "black"}
                                            size={22} />} />
                                    </span>
                                </div>
                            </div>
                        }
                        <div className='w-full h-[274px] flex items-center justify-center'>
                            <img src={productData?.thumb ||
                                'https://png.pngtree.com/template/20220419/ourmid/pngtree-photo-coming-soon-abstract-admin-banner-image_1262901.jpg'}
                                alt='' className='max-w-full max-h-full object-cover'
                            />
                        </div>
                        {/* Show "Sold Out" overlay if quantity is 0 */}
                        {productData?.quantity === 0 && (
                            <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
                                <span className="text-white text-2xl">Sold Out</span>
                            </div>
                        )}
                        {!normal &&
                            <img src={isNew ? labelNew : labeTrending} alt='' className={`absolute w-[100px] h-[32px] top-[0px] right-[0px] object-cover'}`} />}
                    </div>
                    <div className='flex gap-1 p-3 mt-[15px] items-start w-full flex-col'>
                        <span className='flex h-4'>{renderStarFromNumber(productData.totalRatings)?.map((el, index) => (
                            <span key={index}>{el}</span>
                        ))}</span>
                        <span className='line-clamp-1'>{productData?.title}</span>
                        <span>{`${formatMoney(productData?.price)}`} VND</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default withBaseComponent(memo(Product));
