import React, { memo, useState } from 'react';
import { navigation } from 'utils/contants';
import { NavLink } from 'react-router-dom';
import { FaBars } from 'react-icons/fa';
import { FaArrowDownShortWide } from 'react-icons/fa6';
import { Sidebar } from 'components';

const Navigation = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className='w-[95%] h-[48px] py-5 text-sm border-b flex items-center justify-between relative md:border-t md:w-main'>
            {/* NavLinks for larger screens */}
            <div className='hidden md:flex'>
                {navigation.map(el => (
                    <NavLink
                        to={el.path}
                        key={el.id}
                        className={({ isActive }) => isActive ? 'pr-12 hover:text-main text-main' : 'pr-12 hover:text-main'}
                    >
                        {el.value}
                    </NavLink>
                ))}
            </div>

            {/* Menu icon for smaller screens */}
            <div className='md:hidden flex justify-between w-full absolute top-[-20px] right-0'>
                <span className='p-2 border bg-blue-50'>
                    <FaArrowDownShortWide
                        size={35}
                        className='cursor-pointer'
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    />
                </span>
                <span className='p-2 border bg-red-50'>
                    <FaBars
                        size={35}
                        className='cursor-pointer'
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    />
                </span>
            </div>
            {/* Sidebar for smaller screens */}
            {isSidebarOpen && (
                <div className='absolute z-20 top-[40px] w-[50%] bg-gray-500 text-white shadow-lg animate-side-right'>
                    <Sidebar setIsSidebarOpen={setIsSidebarOpen} />
                </div>
            )}
            {/* Dropdown menu for smaller screens */}
            {isMenuOpen && (
                <div className='absolute z-10 top-[40px] !h-[400px] !w-[250px] right-0 bg-gray-500 text-white 
                shadow-lg mr-1 animate-slide-tr !rounded-md md:hidden'>
                    {navigation.map(el => (
                        <NavLink
                            to={el.path}
                            key={el.id}
                            className={({ isActive }) =>
                                isActive
                                    ? 'block px-6 py-5 text-[16px] text-main pr-12 hover:text-main'
                                    : 'block px-6 py-5 text-[16px] pr-12 hover:text-main'
                            }
                            onClick={() => setIsMenuOpen(false)}
                        >
                            {el.value}
                        </NavLink>
                    ))}
                </div>
            )}
        </div>
    );
};

export default memo(Navigation);
