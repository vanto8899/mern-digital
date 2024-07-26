import React, { memo } from 'react';

const Button = ({ children, handleOnclick, style, fw, type = 'button', disabled = false }) => {
    return (
        <button
            type={type}
            className={style ? style : `px-4 py-3 rounded-md text-white bg-main font-semibold my-2 
                ${fw ? 'w-full' : 'w-fit'} 
                ${disabled ? '!bg-gray-400 cursor-not-allowed' : 'hover:bg-red-700'}`}
            onClick={() => { !disabled && handleOnclick && handleOnclick() }}
            disabled={disabled}
        >
            {children}
        </button>
    );
};

export default memo(Button);
