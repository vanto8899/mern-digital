import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import path from 'utils/path';
import { useSelector } from 'react-redux';
import { MemberSidebar } from 'components';
import { BsReverseLayoutTextSidebarReverse, BsXSquareFill } from 'react-icons/bs';

const MemberLayout = () => {
    const { isLoggedIn, current } = useSelector(state => state.user);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [selectedTab, setSelectedTab] = useState('dashboard'); // Default selected tab

    // Role-based access control: Assuming 'member' role
    if (!isLoggedIn || !current) {
        return <Navigate to={`/${path.LOGIN}`} replace={true} />;
    }

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const closeSidebar = () => {
        setSidebarOpen(false);
    };

    const handleTabClick = (tab) => {
        setSelectedTab(tab);
        // Additional logic if needed
    };

    return (
        <div className='flex w-full min-h-screen relative text-gray-800 md:bg-gray-100'>
            {/* Sidebar */}
            <div className={`w-[250px] flex-none fixed top-0 bottom-0 z-50 ${sidebarOpen ? '' : 'hidden md:block'}`}>
                <MemberSidebar selectedTab={selectedTab} onTabClick={handleTabClick} />
            </div>

            {/* Overlay when sidebar is open on small screens */}
            <div className='md:hidden'>
                {sidebarOpen && (
                    <div className='fixed top-0 left-0 right-0 bottom-0 bg-black opacity-70 z-40'
                        onClick={closeSidebar}></div>
                )}
            </div>

            {/* Toggle Button */}
            <div className='md:hidden'>
                <button
                    className='text-gray-500 focus:outline-none absolute top-4 right-5 z-50'
                    onClick={toggleSidebar}
                    aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
                >
                    {sidebarOpen ? <BsXSquareFill color='white' size={32} /> : <BsReverseLayoutTextSidebarReverse size={32} />}
                </button>
            </div>

            {/* Content Area */}
            <div className='w-[280px]'></div>
            <div className='w-full md:flex-auto'>
                <Outlet />
            </div>
        </div>
    );
};

export default MemberLayout;
