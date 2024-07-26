import React, { useEffect, useState } from 'react';
import { formatMoney } from 'utils/helpers';
import withBaseComponent from 'hocs/withBaseComponent';
import { apiGetProductById } from 'apis';

const OrderItemUser = ({ dispatch, color, dfQuantity = 1, price, title, thumbnail, navigate, pid }) => {
    const [quantity, setQuantity] = useState(() => dfQuantity);
    const [productData, setProductData] = useState([])

    // get all product to find stock of product
    const fetchProducts = async () => {
        const response = await apiGetProductById(pid);
        if (response.success) {
            setProductData(response.productData)
        }
    };
    useEffect(() => {
        fetchProducts()
    }, [dispatch])
    return (
        <div onClick={() => navigate(`/${productData?.category?.toLowerCase()}/${productData?._id}/${productData?.title}`)}
            className='cursor-pointer'>
            <div className='w-main mx-auto border-b font-bold p-3 grid grid-cols-10'>
                <span className='col-span-6 w-full text-center'>
                    <div className='flex items-center justify-start gap-2'>
                        <img src={thumbnail} alt="thumb" className='w-28 h-28 object-cover' />
                        <div className='flex flex-col justify-center items-start gap-1'>
                            <span className='text-sm font-semibold text-main'>{title}</span>
                            <span className='text-xs'>{color}</span>
                        </div>
                    </div>
                </span>
                <span className='col-span-1 w-full text-center'>
                    <div className='flex justify-center items-center h-full'>
                        {quantity}
                    </div>
                </span>
                <span className='col-span-3 w-full h-full flex items-center justify-center text-center'>
                    <span className='text-lg'>{formatMoney(price * quantity) + " VND"}</span>
                </span>
            </div>
        </div>
    );
};

export default withBaseComponent(OrderItemUser);
