import React, { memo, useEffect, useState } from 'react'
import { apiGetProducts } from 'apis/product'
import { getnewProducts } from 'store/products/asyncActions'
import { useDispatch, useSelector } from 'react-redux'
import clsx from 'clsx'
import CustomSliderMobile from 'components/Common/CustomSliderMobile'

const tabs = [
    { id: 1, name: "BEST SELLER" },
    { id: 2, name: "NEW ARRIVALS" }
]

const BestSeller = () => {
    const [bestSeller, setBestSeller] = useState(null)
    const [activedTab, setActivedTab] = useState(1)
    const [products, setProducts] = useState(null)
    const dispatch = useDispatch();
    const { newProducts } = useSelector(state => state.products)
    /* const { isShowModal } = useSelector(state => state.app) */
    // console.log("new p", newProducts)

    const fetchProducts = async () => {
        const response = await apiGetProducts({ sort: "-sold" })
        // console.log({ response })
        if (response.success) {
            setBestSeller(response.products)
            setProducts(response.products)
        }
    }
    useEffect(() => {
        fetchProducts()
        dispatch(getnewProducts())
    }, [])

    useEffect(() => {
        if (activedTab === 1) setProducts(bestSeller)
        if (activedTab === 2) setProducts(newProducts)
    }, [activedTab])
    return (
        <div className='w-full border-t'>
            <div className='flex text-[20px] pb-4 flex-col border-b-4 border-main md:gap-4 md:flex-row'>
                {tabs.map(el => (
                    <span
                        key={el.id}
                        className={`font-semibold uppercase p-3 border-b md:border-r md:pr-5
                        cursor-pointer text-gray-400 ${activedTab === el.id ? 'text-gray-800' : ''}`}
                        onClick={() => setActivedTab(el.id)}
                    >{el.name}</span>
                ))}
            </div>
            <div className='mt-5'>
                <CustomSliderMobile products={products} activedTab={activedTab} detail={true} />
            </div>
            <div className="w-full mt-5 px-2 flex flex-col gap-1 md:flex-row md:gap-4">
                <img
                    src="https://digital-world-2.myshopify.com/cdn/shop/files/banner2-home2_2000x_crop_center.png?v=1613166657"
                    alt="banner-left"
                    className="w-full h-auto object-cover md:w-1/2 transition-transform duration-300 hover:scale-105"
                />
                <img
                    src="https://digital-world-2.myshopify.com/cdn/shop/files/banner1-home2_2000x_crop_center.png?v=1613166657"
                    alt="banner-right"
                    className="w-full h-auto mt-3 md:mt-0 object-cover md:w-1/2 transition-transform duration-300 hover:scale-105"
                />
            </div>
        </div>
    )
}

export default memo(BestSeller)