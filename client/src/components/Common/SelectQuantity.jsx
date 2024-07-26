import clsx from 'clsx';
import React, { memo } from 'react';

const SelectQuantity = ({ quantity, handleQuantity, handleChangeQuantity, containerWidth, disabled }) => {
    return (
        <div className={clsx('flex items-center bg-gray-300', containerWidth && 'custom-width')} style={containerWidth ? { width: containerWidth } : {}}>
            <span
                onClick={() => handleChangeQuantity('minus')}
                className={clsx('py-3 px-4 border-r border-black cursor-pointer w-[30%] text-center', { 'cursor-not-allowed': quantity <= 1 })}
                style={{ pointerEvents: quantity <= 1 ? 'none' : 'auto' }}
            >
                -
            </span>
            <input
                type="text"
                className='py-3 px-4 outline-none w-[40%] text-center border-none bg-gray-200'
                value={quantity}
                onChange={(e) => handleQuantity(e.target.value)}
            />
            <span
                onClick={() => !disabled && handleChangeQuantity('plus')}
                className={clsx('py-3 px-4 border-l border-black cursor-pointer w-[30%] text-center', { 'cursor-not-allowed': disabled })}
                style={{ pointerEvents: disabled ? 'none' : 'auto' }}
            >
                +
            </span>
        </div>
    );
}

export default memo(SelectQuantity);
