import { apiRemoveCart } from 'apis'
import { Button } from 'components'
import withBaseComponent from 'hocs/withBaseComponent'
import { enqueueSnackbar } from 'notistack'
import React from 'react'
import { ImBin } from 'react-icons/im'
import { IoMdClose } from 'react-icons/io'
import { useSelector } from 'react-redux'
import { showCart } from 'store/app/appSlice'
import { getCurrent } from 'store/users/asyncActions'
import { formatMoney } from 'utils/helpers'
import path from 'utils/path'

const Cart = ({ dispatch, navigate }) => {
    const { currentCart } = useSelector(state => state.user)
    // check and remove product in cart
    const removeCart = async (pid, color) => {
        try {
            const response = await apiRemoveCart(pid, color)
            if (response.success) {
                enqueueSnackbar(response.message, { variant: 'success' });
                dispatch(getCurrent());
            }
            else enqueueSnackbar(response.message, { variant: 'error' });
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || "Error deleting!";
            enqueueSnackbar(errorMessage, { variant: 'error' });
        }
    }
    return (
        <div onClick={(e) => e.stopPropagation()} className='w-[450px] h-screen grid grid-rows-10 bg-gray-700 text-white p-6'>
            <header className='border-b font-semibold text-3xl flex justify-between items-center row-span-1 h-full'>
                <span>Your Cart</span>
                <span onClick={() => dispatch(showCart())} className='cursor-pointer p-1' ><IoMdClose size={28} /></span>
            </header>
            <section className='row-span-7 flex gap-3 flex-col h-full max-h-full overflow-y-auto py-3'>
                {currentCart?.length === 0 &&
                    <span className='text-lg italic text-main'>Your cart is empty now!</span>}
                {currentCart && currentCart?.map(el => (
                    <div key={el._id} className='flex justify-between items-center'>
                        <div className='flex gap-2'>
                            <img src={el.thumbnail} alt="thumb" className='w-20 h-20 object-cover' />
                            <div className='flex flex-col gap-1'>
                                <span className='text-sm font-semibold text-green-500'>{el.title}</span>
                                <span className='text-xs'>{el.color}</span>
                                <span className='text-xs text-yellow-500'>{`Quantity: ${el.quantity}`}</span>
                                <span className='text-sm'>{formatMoney(el.price) + " VND"}</span>
                            </div>
                        </div>
                        <span className='w-8 h-8 rounded-full
                         hover:bg-red-500 cursor-pointer flex items-center justify-center'
                            onClick={() => removeCart(el.product?._id, el.color)}
                        >
                            <ImBin size={16} />
                        </span>
                    </div>
                ))}
            </section>
            <div className='row-span-2 h-full flex flex-col justify-between'>
                <div className='flex items-center justify-between pt-4 border-t'>
                    <span>SUBTOTAL:</span>
                    <span>{formatMoney(currentCart?.reduce((sum, el) => sum + Number(el.price) * el.quantity, 0)) + " VND"}</span>
                </div>
                <span className='text-center text-gray-400 italic text-sm'>Shipping, taxes, and discounts calculated at checkout.</span>
                <Button
                    style='rounded-none w-full bg-main py-3 hover:bg-red-700'
                    handleOnclick={() => {
                        dispatch(showCart())
                        navigate(`/${path.MEMBER}/${path.MY_CART}`)
                    }}
                >
                    SHOPPING CART
                </Button>
            </div>
        </div>
    )
}

export default withBaseComponent(Cart) 