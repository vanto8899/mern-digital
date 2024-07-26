import React, { memo } from 'react';
import { NavLink } from 'react-router-dom';
import { createSlug } from 'utils/helpers';
import { useSelector } from 'react-redux';
import iconMapping from 'utils/iconMapping';

const Sidebar = ({ setIsSidebarOpen }) => {
    const { categories } = useSelector(state => state.app);
    return (
        <div className='flex flex-col border relative'>
            {categories?.map(el => {
                const IconComponent = iconMapping[el.title]; // Get the corresponding icon
                return (
                    <NavLink
                        to={createSlug(el.title)}
                        key={createSlug(el.title)} // Add key here
                        className={({ isActive }) => isActive ?
                            'bg-main text-white px-5 pt-[15px] pb-[14px] text-[18px] flex items-center' :
                            'px-5 pt-[15px] pb-[14px] text-sm flex items-center hover:text-main'}
                        onClick={() => setIsSidebarOpen(false)} // Close sidebar on link click
                    >
                        {IconComponent && <IconComponent className='mr-2 text-[18px]' />}
                        {el.title}
                    </NavLink>
                );
            })}
        </div>
    );
};

export default memo(Sidebar);
