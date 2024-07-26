import { apiGetUserById, apiRemoveProductInCartByUserId } from 'apis'
import withBaseComponent from 'hocs/withBaseComponent'
import { enqueueSnackbar } from 'notistack'
import React, { useEffect, useState } from 'react'
import { ImBin } from 'react-icons/im'
import { formatMoney } from 'utils/helpers'

const CartView = ({ userId }) => {
    const [cartView, setCartView] = useState([]);

    const fetchCartView = async () => {
        try {
            const response = await apiGetUserById(userId);
            if (response.success && response.res.cart) {
                setCartView(response.res.cart);
            } else {
                console.error("Failed to fetch wishlist or wishlist is empty");
            }
        } catch (error) {
            console.error("Error fetching wishlist: ", error);
        }
    };
    // function remove product in cart
    const removeCart = async (userId, pid, color) => {
        const response = await apiRemoveProductInCartByUserId(userId, pid, color)
        if (response.success) {
            enqueueSnackbar(response.message, { variant: 'success' });
            fetchCartView();
        }
        else enqueueSnackbar(response.message, { variant: 'error' });
    }

    useEffect(() => {
        if (userId) {
            fetchCartView();
        }
    }, [userId]);

    return (
        <div onClick={(e) => e.stopPropagation()} className='w-full md:min-h-0 rounded-lg'>
            <header className='border-b bg-main p-6 font-semibold text-white text-3xl flex justify-between items-center py-4'>
                <span>Current User's Cart</span>
            </header>
            <section className='flex flex-col gap-3 max-h-96 overflow-y-auto p-3'>
                {cartView?.length === 0 && (
                    <span className='text-lg italic text-main'>The cart is empty now!</span>
                )}
                {cartView && cartView.map(el => (
                    <div key={el._id} className='flex justify-between items-center py-2 border-b'>
                        <div className='flex gap-2'>
                            <img src={el.thumbnail} alt="thumb" className='w-20 h-20 object-cover' />
                            <div className='flex flex-col gap-1'>
                                <span className='text-sm font-semibold text-green-500'>{el.title}</span>
                                <span className='text-xs text-gray-600'>{el.color}</span>
                                <span className='text-xs text-yellow-500'>{`Quantity: ${el.quantity}`}</span>
                                <span className='text-sm'>{formatMoney(el.price) + " VND"}</span>
                            </div>
                        </div>
                        <span className='w-8 h-8 rounded-full hover:bg-red-500 cursor-pointer flex items-center justify-center'
                            onClick={() => removeCart(userId, el.product?._id, el.color)}
                        >
                            <ImBin size={16} />
                        </span>
                    </div>
                ))}
            </section>
            <div className='flex flex-col justify-between p-3 border-t'>
                <div className='flex items-center justify-between p-4 font-semibold'>
                    <span>SUBTOTAL:</span>
                    <span>{formatMoney(cartView?.reduce((sum, el) => sum + Number(el.price) * el.quantity, 0)) + " VND"}</span>
                </div>
            </div>
        </div>
    )
}

export default withBaseComponent(CartView)
