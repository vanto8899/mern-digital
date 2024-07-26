import React from 'react'
import Select from 'react-select'
import clsx from 'clsx'
const CustomSelect = ({ label, placeholder, onChange, options = [], value, className, wrapClassName }) => {
    const customStyles = {
        control: (provided) => ({
            ...provided,
            minHeight: '42px',
            height: 'auto',
        }),
    };
    return (
        <div className={clsx(wrapClassName)}>
            {label && <h3 className='font-medium'>{label}</h3>}
            <Select
                placeholder={placeholder}
                isClearable
                options={options}
                value={value}
                isSearchable
                onChange={val => onChange(val)}
                formatOptionLabel={(option) => (
                    <div className='flex text-black items-center gap-2'>
                        <span>{option.label}</span>
                    </div>
                )}
                className={className}
                styles={customStyles}
            />
        </div>
    )
}

export default CustomSelect