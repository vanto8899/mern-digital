import clsx from 'clsx'
import React, { memo } from 'react'

const Select = ({ label, options = [], register, errors, id, validate, style, fullWidth, defaultValue }) => {
    return (
        <div className={clsx('flex flex-col gap-2', style)}>
            {label && <label htmlFor={id} className='font-medium'>{label}</label>}
            <select
                className={clsx('form-select max-h-[42px]', fullWidth && 'w-full', style)}
                id={id}
                {...register(id, validate)}
                defaultValue={defaultValue}
            >
                <option value="">--CHOOSE--</option>
                {options?.map(el => (
                    <option key={el.code} value={el.code}>{el.value}</option>
                ))}
            </select>
            {errors[id] && <small className='text-xs text-red-500'>{errors[id]?.message}</small>}
        </div>
    )
}

export default memo(Select)