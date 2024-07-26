import React from 'react';
import { Sidebar, Banner, BestSeller } from 'components';
import DealDaily from 'components/Products/DealDaily';
import FearureProducts from 'components/Products/FearureProducts'
import CustomSliderMobile from 'components/Common/CustomSliderMobile'
import { useSelector } from 'react-redux';
import icons from 'utils/icons'
import withBaseComponent from 'hocs/withBaseComponent';
import { createSearchParams } from 'react-router-dom';

const { IoIosArrowForward } = icons
const HomePage = ({ navigate }) => {
    const { newProducts } = useSelector(state => state.products)
    const { categories } = useSelector(state => state.app)
    //console.log(newProducts)

    return (
        <>
            {/* Layout for screens larger than or equal to 768px */}
            <div className='hidden md:flex w-main mt-6'>
                <div className='flex flex-col gap-5 w-[25%] flex-auto'>
                    <Sidebar />
                    <DealDaily />
                </div>
                <div className='flex flex-col gap-5 pl-5 w-[75%] flex-auto'>
                    <Banner />
                    <BestSeller />
                </div>
            </div>

            {/* Layout for screens smaller than 768px */}
            <div className='flex w-full flex-col items-center md:hidden mt-6'>
                <Banner />
            </div>
            <div className='flex w-full px-3 my-6 flex-col items-center md:hidden'>
                <DealDaily />
            </div>

            <div className='w-full px-3 flex flex-col gap-5 flex-auto md:px-0 md:hidden'>
                <BestSeller />
            </div>

            {/* Placeholder for content below */}
            <div className='my-6'>
                <FearureProducts />
            </div>
            {/* New Arrival */}
            <div className='md:block my-8 w-full p-3 md:p-0 md:w-main'>
                <h3 className='text-[20px] font-semibold py-[15px] border-b-4 border-main'>NEW ARRIVALS</h3>
                <div className='mt-4 mx-[-10px]'>
                    <CustomSliderMobile products={newProducts} />
                </div>
            </div>
            {/* Hot collection */}
            <div className='my-8 w-full p-3 md:p-0 md:w-main'>
                <h3 className='text-[20px] font-semibold py-[15px] border-b-4 border-main'>HOT COLLECTIONS</h3>
                <div className='flex flex-col gap-4 mt-4 md:flex-row md:flex-wrap'>
                    {categories?.filter(el => el.brand.length > 0)?.map(el => (
                        <div
                            key={el._id}
                            className='md:w-[396px] w-full'
                        >
                            <div className='border flex p-4 gap-4 min-h-[190px]'>
                                <img src={el?.image} alt="" className='flex-1 w-[150px] h-[280px] md:h-[130px] object-cover' />
                                <div className='md:flex-1 flex flex-col text-gray-700'>
                                    <h4 className='font-semibold uppercase'>{el.title}</h4>
                                    <ul>
                                        {el?.brand?.map(item => (
                                            <span key={item}
                                                className='flex gap-1 cursor-pointer hover:underline items-center text-gray-400'
                                                onClick={() => navigate({
                                                    pathname: `/${el.title}`,
                                                    search: createSearchParams({ brand: item }).toString()
                                                })}
                                            >
                                                <IoIosArrowForward size={14} />
                                                <li>{item}</li>
                                            </span>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className='my-8 w-full p-3 md:p-0 md:w-main'>
                <h3 className='text-[20px] font-semibold py-[15px] border-b-4 border-main md:w-full'>
                    BLOG POSTS
                </h3>
            </div>

        </>
    );
};

export default withBaseComponent(HomePage);
