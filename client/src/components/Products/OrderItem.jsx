import { SelectQuantity } from 'components';
import React, { useCallback, useEffect, useState } from 'react'
import { formatMoney } from 'utils/helpers';
import { updateCart } from 'store/users/userSlice'
import withBaseComponent from 'hocs/withBaseComponent';
import Swal from 'sweetalert2';
import { apiGetProductNoLimit } from 'apis';

const OrderItem = ({ dispatch, color, dfQuantity = 1, price, title, thumbnail, pid, stock }) => {
    const [quantity, setQuantity] = useState(() => dfQuantity);
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

    useEffect(() => {
        dispatch(updateCart({ pid, quantity, color }));
    }, [quantity, dispatch, pid, color]);

    return (
        <div className='w-main md:w-full mx-auto border-b font-bold p-3 grid grid-cols-10'>
            <span className='col-span-6 w-full text-center'>
                <div className='flex gap-2'>
                    <img src={thumbnail} alt="thumb" className='w-28 h-28 object-cover' />
                    <div className='flex flex-col gap-1'>
                        <span className='text-sm font-semibold text-main'>{title}</span>
                        <span className='text-xs'>{color}</span>
                    </div>
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
                    </span> {/* Display stock with conditional styling */}
                </div>
            </span>
            <span className='col-span-3 w-full h-full flex items-center justify-center text-center'>
                <span className='text-lg'>{formatMoney(price * quantity) + " VND"}</span>
            </span>
        </div>
    )
}

export default withBaseComponent(OrderItem);
