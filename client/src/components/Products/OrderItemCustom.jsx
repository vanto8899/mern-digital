import { SelectQuantity } from 'components';
import React, { useCallback, useEffect, useState } from 'react';
import { formatMoney } from 'utils/helpers';
import withBaseComponent from 'hocs/withBaseComponent';
import { apiGetProductNoLimit, apiremoveProductFromOrder } from 'apis';
import Swal from 'sweetalert2';
import { enqueueSnackbar } from 'notistack';
import { useSelector } from 'react-redux';
import { getOrderById } from 'store/orders/asyncActions';
import { ImBin } from 'react-icons/im';

const OrderItemCustom = ({ dispatch, color, dfQuantity = 1, price, title, thumbnail, pid, onQuantityChange, orderId, onRemoveProduct, updateStockTrigger, setUpdateStockTrigger }) => {
    const [quantity, setQuantity] = useState(() => dfQuantity);
    const [productsStock, setProductsStock] = useState({});
    const { order } = useSelector((state) => state.orders);

    useEffect(() => {
        dispatch(getOrderById(orderId));
    }, [dispatch, orderId]);

    // Fetch product details including stock quantity
    const fetchProducts = async () => {
        try {
            const response = await apiGetProductNoLimit();
            if (response.success) {
                const stock = response.products.reduce((acc, product) => {
                    acc[product._id] = product.quantity;
                    return acc;
                }, {});
                setProductsStock(stock);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };
    // Trigger update stock
    useEffect(() => {
        fetchProducts();
    }, [updateStockTrigger]);
    // Trigger update stock
    useEffect(() => {
        if (updateStockTrigger) {
            setUpdateStockTrigger(false); // Reset trigger sau khi cập nhật
        }
    }, [updateStockTrigger]);

    const handleQuantity = useCallback((number) => {
        if (number === '') {
            setQuantity('');
            return;
        }
        if (!Number(number) || Number(number) < 1) {
            return;
        }
        if (Number(number) > productsStock[pid]) {
            // Notify user about exceeding stock
            Swal.fire({
                icon: 'warning',
                title: 'Product is out of Stock!',
                text: `The available stock is ${productsStock[pid]}!`,
            });
            return;
        }
        setQuantity(number);
        onQuantityChange(number);  // Notify parent about quantity change
    }, [pid, productsStock, onQuantityChange, dispatch, color]);

    const handleChangeQuantity = useCallback((flag) => {
        let newQuantity = quantity;
        if (flag === 'minus' && quantity === 1) {
            // Optionally show a warning or prevent further decrease
            return;
        }
        if (flag === 'minus') newQuantity = +quantity - 1;
        if (flag === 'plus') {
            newQuantity = +quantity + 1;
            if (newQuantity > productsStock[pid]) {
                // Notify user about exceeding stock
                Swal.fire({
                    icon: 'warning',
                    title: 'Product is out of Stock!',
                    text: `The available stock is ${productsStock[pid]}!`,
                });
                return;
            }
        }
        setQuantity(newQuantity);
        onQuantityChange(newQuantity);  // Notify parent about quantity change
    }, [pid, quantity, productsStock, onQuantityChange, dispatch, color]);

    // Remove product in order
    const handleRemoveProduct = async () => {
        try {
            const response = await apiremoveProductFromOrder(orderId, pid);
            if (response.success) {
                enqueueSnackbar(response.message, { variant: 'success' });
                dispatch(getOrderById(orderId));
                if (onRemoveProduct) {
                    onRemoveProduct(); // Call the parent component's callback function
                }
            } else {
                enqueueSnackbar(response.message, { variant: 'error' });
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || "An error occurred";
            enqueueSnackbar(errorMessage, { variant: 'error' });
        }
    };

    return (
        <div className='w-main mx-auto border-b font-bold p-3 grid grid-cols-10'>
            <span className='col-span-5 w-full text-center'>
                <div className='flex items-center justify-start gap-2'>
                    <img src={thumbnail} alt="thumb" className='w-28 h-28 object-cover' />
                    <div className='flex flex-col justify-center items-start gap-1'>
                        <span className='text-sm font-semibold text-main'>{title}</span>
                        <span className='text-xs'>{color}</span>
                        <span className={`text-md mt-2 ${productsStock[pid] > 0 ? 'text-green-700' : 'text-main'}`}>
                            In Stock: {productsStock[pid]}
                        </span> {/* Display stock with conditional styling */}
                    </div>
                </div>
            </span>
            <span title='Remove product' className='col-span-1 w-full text-center'>
                <div
                    className="w-8 h-8 rounded-full cursor-pointer flex items-center justify-center border border-gray-300
                     hover:bg-red-500 hover:text-white"
                    onClick={handleRemoveProduct}
                >
                    <ImBin size={16} />
                </div>
            </span>
            <span className='col-span-1 w-full text-center'>
                <div className='flex justify-center items-center h-full'>
                    <SelectQuantity
                        quantity={quantity}
                        handleQuantity={handleQuantity}
                        handleChangeQuantity={handleChangeQuantity}
                    />
                </div>
            </span>
            <span className='col-span-3 w-full h-full flex items-center justify-center text-center'>
                <span className='text-lg'>{formatMoney(price * quantity) + " VND"}</span>
            </span>
        </div>
    );
};

export default withBaseComponent(OrderItemCustom);
