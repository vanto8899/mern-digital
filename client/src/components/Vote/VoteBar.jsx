import React, { memo, useEffect, useRef } from 'react'
import icons from 'utils/icons'

const { AiFillStar } = icons

const VoteBar = ({ number, ratingCount, ratingTotal }) => {

    const percentRef = useRef()
    useEffect(() => {
        const percent = Math.round(ratingCount * 100 / ratingTotal) || 0
        percentRef.current.style.cssText = `right: ${100 - percent}%`
    }, [ratingCount, ratingTotal])
    return (
        <div className='flex items-center gap-2 text-sm text-gray-500'>
            <div className='w-[10%] flex items-center justify-center gap-1 text-sm'>
                <span>{number}</span>
                <AiFillStar color='orange' size={18} />
            </div>
            <div className='w-[75%]'>
                <div className='w-full h-[8px] relative bg-gray-300 rounded-l-full rounded-r-full'>
                    <div ref={percentRef} className='absolute inset-0 bg-red-500 rounded-l-full rounded-r-full'></div>
                </div>
            </div>
            <div className='w-[25%] md:w-[10%] flex justify-end text-xs text-400'>{`${ratingCount || 0} reviewers`}</div>
        </div>
    )
}

export default memo(VoteBar)