import React, { memo, useEffect, useState } from 'react'
import { ProductCard } from 'components'
import { apiGetProducts } from 'apis'

const FearureProducts = () => {
    const [products, setProducts] = useState(null)

    const fetchProducts = async () => {
        const response = await apiGetProducts({ limit: 9, sort: '-totalRatings' }) // 9 cai rating cao nhat
        // console.log(response)
        if (response?.success) {
            setProducts(response.products)
        }
    }

    useEffect(() => {
        fetchProducts();
    }, [])
    return (
        <div className='md:w-main w-full p-3'>
            <h3 className='text-[20px] font-semibold py-[15px] border-b-4 border-main'>FEATURED PRODUCTS</h3>
            <div className='flex w-full flex-wrap mt-[15px]'>
                {products?.map(el => (
                    <ProductCard
                        key={el._id}
                        pid={el._id}
                        image={el.thumb}
                        title={el.title}
                        totalRatings={el.totalRatings}
                        price={el.price}
                        category={el.category}
                    />
                ))}
            </div>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-4 md:grid-rows-2 md:p-3'>
                <img
                    src='https://digital-world-2.myshopify.com/cdn/shop/files/banner1-bottom-home2_b96bc752-67d4-45a5-ac32-49dc691b1958_600x.jpg?v=1613166661'
                    alt=''
                    className='w-full h-full object-cover md:col-span-2 md:row-span-2'
                />
                <img
                    src='https://digital-world-2.myshopify.com/cdn/shop/files/banner2-bottom-home2_400x.jpg?v=1613166661'
                    alt=''
                    className='w-full h-full object-cover md:col-span-1 md:row-span-1'
                />
                <img
                    src='https://digital-world-2.myshopify.com/cdn/shop/files/banner4-bottom-home2_92e12df0-500c-4897-882a-7d061bb417fd_400x.jpg?v=1613166661'
                    alt=''
                    className='w-full h-full object-cover md:col-span-1 md:row-span-2'
                />
                <img
                    src='https://digital-world-2.myshopify.com/cdn/shop/files/banner3-bottom-home2_400x.jpg?v=1613166661'
                    alt=''
                    className='w-full h-full object-cover md:col-span-1 md:row-span-1'
                />
            </div>
        </div>
    )
}

export default memo(FearureProducts)