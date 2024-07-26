import React, { memo } from 'react';
import clsx from 'clsx';

const InputField = ({ value, setValue, nameKey, type, invalidFields, setInvalidFields, style, fullWidth, placeholder, isHideLabel }) => {

    return (
        <div className={clsx('relative gap-1 mb-2 flex flex-col', fullWidth && 'w-full')}>
            {!isHideLabel && value?.trim() !== '' && (
                <label htmlFor={nameKey} className='text-[10px] absolute top-0 left-[8px] block bg-white px-1 animate-slide-top-sm'>
                    {nameKey?.slice(0, 1).toUpperCase() + nameKey?.slice(1)}
                </label>
            )}

            <input
                type={type || "text"}
                className={clsx('px-4 py-2 outline-none rounded-sm border border-gray-200 w-full mt-2 placeholder:text-sm placeholder:italic', style)}
                placeholder={placeholder || nameKey?.slice(0, 1).toUpperCase() + nameKey?.slice(1)}
                value={value}
                onChange={e => setValue(prev => ({ ...prev, [nameKey]: e.target.value }))}
                onFocus={() => setInvalidFields && setInvalidFields([])}
            />
            {invalidFields?.some(el => el.name === nameKey) && (
                <small className='text-main text-xs italic absolute bottom-[-16px]'>
                    {invalidFields.find(el => el.name === nameKey)?.message}
                </small>
            )}
        </div>
    );
};

export default memo(InputField);
