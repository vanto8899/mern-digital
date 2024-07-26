import React, { memo, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import path from 'utils/path'
import { getCurrent } from 'store/users/asyncActions'
import { useDispatch, useSelector } from 'react-redux'
import icons from 'utils/icons'
import { logout, clearMessage } from 'store/users/userSlice'
import Swal from 'sweetalert2'

const { AiOutlineLogout } = icons;

const TopHeader = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate()
    const { isLoggedIn, current, message } = useSelector(state => state.user);

    useEffect(() => {
        const setTimeoutId = setTimeout(() => {
            if (isLoggedIn) {
                dispatch(getCurrent())
            }
        }, 300)
        return () => {
            clearTimeout(setTimeoutId)
        }
    }, [dispatch, isLoggedIn]);

    useEffect(() => {
        if (message) Swal.fire('Oops!', message, 'info').then(() => {
            dispatch(clearMessage())
            navigate(`/${path.LOGIN}`)
        })
    }, [message])

    return (
        <div className='hidden md:flex h-[38px] w-full bg-main items-center justify-center'>
            <div className='w-main flex items-center justify-between text-xs text-white py-2'>
                <span>ORDER ONLINE OR CALL US (+1800) 000 8808</span>
                {isLoggedIn
                    ? <div className='flex gap-4 text-sm items-center'>
                        <span>{`Welcome, ${current?.lastname} ${current?.firstname}`}</span>
                        <span
                            onClick={() => dispatch(logout())}
                            className='hover:rounded-full
                         hover:bg-gray-200
                          hover:text-main 
                          cursor-pointer p-1
                          inline-block transform transition-transform duration-300 hover:-rotate-90'
                        >
                            <AiOutlineLogout size={18} />
                        </span>
                    </div>
                    : <Link to={`/${path.LOGIN}`}
                        className='hover:text-blue-900'
                    >Sign In or Create Account</Link>
                }
            </div>
        </div>
    )
}

export default memo(TopHeader)
