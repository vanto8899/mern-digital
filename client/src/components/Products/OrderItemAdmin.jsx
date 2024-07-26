import { SelectQuantity } from 'components';
import React, { useCallback, useEffect, useState } from 'react'
import { formatMoney } from 'utils/helpers';
import withBaseComponent from 'hocs/withBaseComponent';
import Swal from 'sweetalert2';
import { apiRemoveProductInCartByUserId, apiUpdateCartByUserId } from 'apis';
import { ImBin } from 'react-icons/im';
import { enqueueSnackbar } from 'notistack';

const OrderItemAdmin = ({ color, dfQuantity = 1, price, title, thumbnail, pid, stock, userId, triggerFetch, onRemoveProduct }) => {
    const [quantity, setQuantity] = useState(dfQuantity);

    const handleQuantity = useCallback((number) => {
        if (number === '') {
            setQuantity('');
            return;
        }
        if (!Number(number) || Number(number) < 1) {
            return;
        }
        if (Number(number) > stock) {
            Swal.fire({
                icon: 'warning',
                title: 'Product is out of Stock!',
                text: `The available stock is ${stock}!`,
            });
            return;
        }
        setQuantity(number);
    }, [stock]);

    const handleChangeQuantity = useCallback((flag) => {
        if (flag === 'minus' && quantity === 1) return;
        if (flag === 'minus') setQuantity(prev => +prev - 1);
        if (flag === 'plus' && quantity < stock) setQuantity(prev => +prev + 1);
        if (flag === 'plus' && quantity >= stock) {
            Swal.fire({
                icon: 'warning',
                title: 'Product is out of Stock!',
                text: `The available stock is ${stock}.`,
            });
        }
    }, [quantity, stock]);

    // Update when any quantity changing
    const updateCart = async () => {
        try {
            const response = await apiUpdateCartByUserId(userId, {
                pid,
                color,
                price,
                thumbnail,
                title,
                quantity
            });
            if (response.success) {
                console.log("Cart updated successfully:", response.message);
                triggerFetch(); // Trigger the parent fetch
            } else {
                console.error("Failed to update cart:", response.message);
            }
        } catch (error) {
            console.error("Error updating cart: ", error);
        }
    };
    // function remove product in cart
    const removeCart = async () => {
        try {
            const response = await apiRemoveProductInCartByUserId(userId, pid, color)
            if (response.success) {
                enqueueSnackbar(response.message, { variant: 'success' });
                if (onRemoveProduct) {
                    onRemoveProduct();  // Trigger Call the parent component's callback function
                }
            }
            else enqueueSnackbar(response.message, { variant: 'error' });
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || "Error deleting!";
            enqueueSnackbar(errorMessage, { variant: 'error' });
        }
    }

    useEffect(() => {
        updateCart();
    }, [quantity, pid, color]);

    return (
        <div className='w-main md:w-full mx-auto border-b font-bold p-3 grid grid-cols-10'>
            <span className='col-span-5 w-full text-center'>
                <div className='flex gap-2'>
                    <img src={thumbnail} alt="thumb" className='w-28 h-28 object-cover' />
                    <div className='flex flex-col gap-1'>
                        <span className='text-sm font-semibold text-main'>{title}</span>
                        <span className='text-xs'>{color}</span>
                    </div>
                </div>
            </span>
            <span title='Remove product' className='col-span-1 w-full text-center'>
                <div
                    className="w-8 h-8 rounded-full cursor-pointer flex items-center justify-center border border-gray-300
                     hover:bg-red-500 hover:text-white"
                    onClick={removeCart}
                >
                    <ImBin size={16} />
                </div>
            </span>
            <span className='col-span-1 w-full text-center'>
                <div className='flex flex-col justify-center items-center h-full'>
                    <SelectQuantity
                        quantity={quantity}
                        handleQuantity={handleQuantity}
                        handleChangeQuantity={handleChangeQuantity}
                    />
                    <span className={`text-sm mt-2 ${stock > 0 ? 'text-green-700' : 'text-main'}`}>
                        In Stock: {stock}
                    </span>
                </div>
            </span>
            <span className='col-span-3 w-full h-full flex items-center justify-center text-center'>
                <span className='text-lg'>{formatMoney(price * quantity) + " VND"}</span>
            </span>
        </div>
    );
}

export default withBaseComponent(OrderItemAdmin);
