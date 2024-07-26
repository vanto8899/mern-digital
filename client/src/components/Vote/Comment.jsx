import React, { memo } from 'react'
import avatar from 'assests/avatar.jpeg'
import moment from 'moment';
import { renderStarFromNumber } from 'utils/helpers'
import { useSelector } from 'react-redux';

const Comment = ({ image = avatar, name = 'Anonymous', updatedAt, comment, star }) => {
    const { current } = useSelector(state => state.user)
    //console.log(current)
    return (
        <div className='flex gap-4'>
            <div className='flex-none'>
                <img src={current?.avatar || image} alt="avatar" className='w-[40px] h-[40px] object-cover rounded-full' />
            </div>
            <div className='flex flex-col flex-auto'>
                <div className='w-full flex justify-between items-center'>
                    <h3 className='font-semibold'>{name}</h3>
                    <span className='text-sm italic'>
                        {moment(updatedAt)?.fromNow()}
                    </span>
                </div>
                <div className='w-full flex flex-col gap-2 pl-4 text-sm mt-4 border border-gray-300 py-2 bg-gray-100 rounded-md'>
                    <span>
                        <span>Evaluation:</span>
                        <span className='flex items-center gap-1'>
                            {renderStarFromNumber(star, 20)?.map((el, index) => (
                                <span key={index}>{el}</span>
                            ))}
                        </span>
                    </span>
                    <span className='flex gap-1'>
                        <span className='font-semibold'>Comment:</span>
                        <span className='flex items-center gap-1'>
                            {comment}
                        </span>
                    </span>
                </div>
            </div>
        </div>
    )
}

export default memo(Comment)