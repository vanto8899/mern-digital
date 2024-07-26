import React, { memo, useEffect, useState } from 'react';
import { useSnackbar } from 'notistack';
import { useDispatch, useSelector } from 'react-redux';
import { formatMoney, renderStarFromNumber } from 'utils/helpers';
import labelNew from 'assests/new.png';
import labelTrending from 'assests/trending.png';
import withBaseComponent from 'hocs/withBaseComponent';
import clsx from 'clsx';
import { apiAddProductToOrder, apiGetAllOrdersNoLimit } from 'apis';
import { BsCartPlusFill, BsFillCartCheckFill } from 'react-icons/bs';
import { getOrderById } from 'store/orders/asyncActions';

const ProductCustom = ({ productData, isNew, normal, navigate, pid, orderId, className, updateProductTrigger }) => {
    const { current } = useSelector(state => state.user);
    const { enqueueSnackbar } = useSnackbar();
    const [isProductAdded, setIsProductAdded] = useState(false);
    const dispatch = useDispatch();
    const { order } = useSelector((state) => state.orders);

    useEffect(() => {
        dispatch(getOrderById(orderId));
    }, [dispatch, orderId]);
    // added, return icon
    useEffect(() => {
        setIsProductAdded(false);
    }, [updateProductTrigger]);

    // Add product into order
    const handleAddProductToOrder = async () => {
        const existingOrder = order; // Assuming 'order' is fetched and stored correctly
        if (existingOrder) {
            const productInOrder = existingOrder.products.some(product => product.product === productData._id);
            if (productInOrder) {
                enqueueSnackbar('This product is already in the order!', { variant: 'info' });
                return;
            }
            if (isProductAdded) {
                enqueueSnackbar('This product is already added!', { variant: 'info' });
                return;
            }
        }

        const data = {
            product: productData._id,
            quantity: 1, // Assuming default quantity is 1, adjust as needed
            color: productData.color,
            price: productData.price,
            thumbnail: productData.thumb,
            title: productData.title,
        };

        try {
            const response = await apiAddProductToOrder(orderId, data);
            if (response.success) {
                enqueueSnackbar('This product added!', { variant: 'success' });
                setIsProductAdded(true);
                dispatch(getOrderById(orderId));
            } else {
                console.error("Failed to add product");
                enqueueSnackbar('Failed to add product', { variant: 'error' });
                setIsProductAdded(false);
            }
        } catch (error) {
            console.error("Error adding product: ", error);
            enqueueSnackbar('Error adding product', { variant: 'error' });
        }
    };

    return (
        <div className={clsx('w-full max-w-sm text-base px-2 md:px-2 lg:px-4', className)}>
            <div>
                <div className="border flex flex-col items-center rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <div className="w-full relative">
                        <div className="flex justify-center items-center bg-white rounded-lg overflow-hidden w-full h-[274px] cursor-pointer">
                            <img
                                src={productData?.thumb || 'https://png.pngtree.com/template/20220419/ourmid/pngtree-photo-coming-soon-abstract-admin-banner-image_1262901.jpg'}
                                alt={productData?.title || 'Product Image'}
                                className="max-w-full max-h-full object-cover"
                            />
                            {/* Show "Sold Out" overlay if quantity is 0 */}
                            {productData?.quantity === 0 && (
                                <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
                                    <span className="text-white text-2xl">Sold Out</span>
                                </div>
                            )}
                        </div>
                        {!normal && (
                            <img
                                src={isNew ? labelNew : labelTrending}
                                alt={isNew ? 'New' : 'Trending'}
                                className="absolute w-[100px] h-[32px] top-0 right-0 object-cover"
                            />
                        )}
                    </div>
                    <div className='flex items-center justify-between w-full px-4'>
                        <div className="flex flex-col gap-2 py-4">
                            <div className="flex items-center gap-1">
                                {renderStarFromNumber(productData?.totalRatings)?.map((star, index) => (
                                    <span key={index}>{star}</span>
                                ))}
                            </div>
                            <h3 className="line-clamp-1 font-semibold text-lg">{productData?.title}</h3>
                            <span className="text-lg font-bold text-red-600">{`${formatMoney(productData?.price)} VND`}</span>
                        </div>
                        <span
                            className={clsx("text-gray-700 hover:text-main", { "pointer-events-none opacity-50": productData?.quantity === 0 })}
                            onClick={productData?.quantity > 0 ? handleAddProductToOrder : undefined}
                        >
                            {isProductAdded ? (
                                <BsFillCartCheckFill size={32} color="green" />
                            ) : (
                                <BsCartPlusFill size={32} />
                            )}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default withBaseComponent(memo(ProductCustom));
