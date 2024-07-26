import withBaseComponent from 'hocs/withBaseComponent'
import React, { memo } from 'react'
import { formatMoney, renderStarFromNumber } from 'utils/helpers'

const ProductCard = ({ price, totalRatings, title, image, pid, navigate, category }) => {
    return (
        <div onClick={(e) => navigate(`/${category?.toLowerCase()}/${pid}/${title}`)}
            className='w-full cursor-pointer flex-auto px-[10px] mb-[20px] md:w-1/3'>
            <div className='flex w-full border'>
                <img src={image} alt='image' className='w-[160px] object-contain p-4 md:w-[120px]' />
                <div className='flex gap-1 mt-[15px] items-start w-full flex-col text-xs'>
                    <span className='line-clamp-1 capitalize text-lg md:text-sm'>{title?.toLowerCase()}</span>
                    <span className='flex h-4'>{renderStarFromNumber(totalRatings, 14)?.map((el, index) => (
                        <span key={index}>{el}</span>
                    ))}</span>
                    <span className='text-lg md:text-sm'>{`${formatMoney(price)}`} VND</span>
                </div>
            </div>
        </div>
    )
}

export default withBaseComponent(memo(ProductCard))