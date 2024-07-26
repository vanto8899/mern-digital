import React, { Fragment, memo, useEffect, useState } from 'react'
import logo from 'assests/logo_digital.png'
import icons from 'utils/icons'
import { Link } from 'react-router-dom';
import path from 'utils/path';
import { FaShoppingCart } from 'react-icons/fa';
import { PiUserSwitchDuotone } from "react-icons/pi";
import { useSelector } from 'react-redux';
import { logout } from 'store/users/userSlice';
import withBaseComponent from 'hocs/withBaseComponent';
import { showCart } from 'store/app/appSlice';

const { MdPhoneInTalk, MdMarkEmailUnread, BsHandbagFill, FaCircleUser, FaHeart } = icons;

const Header = ({ dispatch, navigate }) => {
    const { current } = useSelector(state => state.user)
    const [cartItemCount, setCartItemCount] = useState(0);
    const [wishlistItemCount, setWishlistItemCount] = useState(0);
    // console.log("current", current)
    const [isShowOption, setIsShowOption] = useState(false)
    const [isShowOptionMd, setIsShowOptionMd] = useState(false)

    useEffect(() => {
        const handleClickoutOption = (e) => {
            const profile = document.getElementById('profile')
            if (!profile?.contains(e.target)) setIsShowOption(false)
        }
        document.addEventListener("click", handleClickoutOption)
        return () => {
            document.removeEventListener("click", handleClickoutOption)
        }
    }, [])

    useEffect(() => {
        const handleClickoutOptionMd = (e) => {
            const profile = document.getElementById('profile-md')
            if (!profile?.contains(e.target)) setIsShowOptionMd(false)
        }
        document.addEventListener("click", handleClickoutOptionMd)
        return () => {
            document.removeEventListener("click", handleClickoutOptionMd)
        }
    }, [])

    useEffect(() => {
        setCartItemCount(current?.cart?.length || 0);
        setWishlistItemCount(current?.wishlist?.length || 0)
    }, [current]);

    return (
        <div className='flex justify-around h-[110px] py-[35px] w-full md:w-main md:flex-row md:justify-between'>
            <Link to={`/${path.HOME}`} className='hidden ml-[30px] xs:flex w-[60%] justify-center items-center md:ml-0 md:w-[25%]'>
                <img src={logo} alt='logo' className='w-full h-auto md:w-[360px] md:h-[48px] md:object-contain' />
            </Link>

            <div className='hidden md:flex text-[13px]'>
                <div className='flex flex-col items-center px-6 border-r'>
                    <span className='flex gap-3 items-center cursor-pointer'>
                        <MdPhoneInTalk color='red' size={20} />
                        <span className='font-semibold'>(+1800) 000 8808</span>
                    </span>
                    <span>Mon-Sat 9:00AM - 8:00PM</span>
                </div>
                <div className='flex flex-col items-center px-6 border-r cursor-pointer'>
                    <span className='flex gap-3 items-center'>
                        <MdMarkEmailUnread color='red' size={20} />
                        <span className='font-semibold'>100488team@GMAIL.COM</span>
                    </span>
                    <span>Online Support 24/7</span>
                </div>
                {current &&
                    <Fragment>
                        <div
                            onClick={() => dispatch(showCart())}
                            className='flex items-center justify-center gap-2 px-6 border-r cursor-pointer'
                        >
                            <BsHandbagFill color={current?.cart?.length ? 'red' : 'gray'} size={22} />
                            <span>{`${current?.cart?.length} item(s)`}</span>
                        </div>
                        <div
                            onClick={() => navigate(`/${path.MEMBER}/${path.WISHLIST}`)}
                            className='flex items-center justify-center gap-2 px-6 border-r cursor-pointer'
                        >
                            <FaHeart color={current?.wishlist?.length ? 'red' : 'gray'} size={24} />
                            <span>{`${current?.wishlist?.length} item(s)`}</span>
                        </div>
                        <div
                            className='flex items-center justify-center px-6 gap-2 cursor-pointer relative'
                            onClick={(e) => setIsShowOption(prev => !prev)}
                            id='profile'
                        >
                            {current?.avatar ? (
                                <span className='w-10 h-10 rounded-full'>
                                    <img src={current.avatar} alt="avatar" className="w-full h-full rounded-full object-cover" />
                                </span>
                            ) : (
                                <FaCircleUser color='red' size={32} />
                            )}
                            <span>Profile</span>
                            {isShowOption && (
                                <div
                                    onClick={(e) => e.stopPropagation()}
                                    className='absolute flex flex-col left-0 bg-gray-100 min-w-[150px] py-2 border top-full z-10'
                                >
                                    <Link className='p-2 w-full hover:bg-red-100 cursor-pointer' to={`/${path.MEMBER}/${path.PERSONAL}`}>
                                        Personal
                                    </Link>
                                    {+current.role === 1988 && (
                                        <Link
                                            className='p-2 w-full hover:bg-red-100 cursor-pointer'
                                            to={`/${path.ADMIN}/${path.DASHBOARD}`}
                                        >
                                            Admin Workspace
                                        </Link>
                                    )}
                                    <span
                                        className='p-2 w-full hover:bg-red-100 cursor-pointer'
                                        onClick={() => dispatch(logout())}
                                    >
                                        Logout
                                    </span>
                                </div>
                            )}
                        </div>
                    </Fragment>
                }

            </div>

            {/* Layout for screens smaller than 768px */}
            <div className='flex w-full justify-center items-center gap-2 md:hidden'>
                {!current &&
                    <Link to={`/${path.LOGIN}`} className='rounded-full border-2 border-gray-200 p-3'>
                        <PiUserSwitchDuotone size={42} color='red' />
                    </Link>
                }
                <div className='relative rounded-full p-3 border-2 border-gray-200 cursor-pointer'
                    onClick={() => dispatch(showCart())}
                >
                    <FaShoppingCart size={42} color='red' />
                    {cartItemCount >= 0 && (
                        <span className='absolute top-2 right-2 bg-green-600 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center'>
                            {cartItemCount}
                        </span>
                    )}
                </div>
                <div className='relative rounded-full p-3 border-2 border-gray-200 cursor-pointer'
                    onClick={() => navigate(`/${path.MEMBER}/${path.WISHLIST}`)}
                >
                    <FaHeart size={42} color='red' />
                    {cartItemCount >= 0 && (
                        <span className='absolute top-2 right-2 bg-green-600 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center'>
                            {wishlistItemCount}
                        </span>
                    )}
                </div>
                {current &&
                    <div
                        className='flex items-center justify-center gap-2 cursor-pointer relative p-3 rounded-full border-2 border-gray-200'
                        onClick={(e) => setIsShowOptionMd(prev => !prev)}
                        id='profile-md'
                    >
                        {current?.avatar ? (
                            <span className='w-11 h-11 rounded-full'>
                                <img src={current.avatar} alt="avatar" className="w-full h-full rounded-full object-cover" />
                            </span>
                        ) : (
                            <FaCircleUser color='red' size={40} />
                        )}

                        {isShowOptionMd &&
                            <div
                                onClick={(e) => e.stopPropagation()}
                                className='absolute flex flex-col left-0 bg-gray-100 min-w-[150px] text-xs py-2 border top-full z-10'
                            >
                                <Link className='p-2 w-full hover:bg-red-100 cursor-pointer' to={`/${path.MEMBER}/${path.PERSONAL}`}>
                                    Personal
                                </Link>
                                {+current.role === 1988 && (
                                    <Link
                                        className='p-2 w-full hover:bg-red-100 cursor-pointer'
                                        to={`/${path.ADMIN}/${path.DASHBOARD}`}
                                    >
                                        Admin Workspace
                                    </Link>
                                )}
                                <span className='p-2 w-full hover:bg-red-100 cursor-pointer' onClick={() => dispatch(logout())}>
                                    Logout
                                </span>
                            </div>}
                    </div>}
            </div>
        </div>

    )
}

export default withBaseComponent(memo(Header))