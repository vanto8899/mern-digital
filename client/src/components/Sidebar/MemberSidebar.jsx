import React, { Fragment, memo, useState } from 'react';
import AvatarLogo from 'assests/avatar.jpeg';
import { memberSidebar } from 'utils/contants';
import { NavLink } from 'react-router-dom';
import clsx from 'clsx';
import { AiOutlineCaretDown, AiOutlineCaretRight } from 'react-icons/ai';
import { useSelector } from 'react-redux';
import { TiArrowBackOutline } from "react-icons/ti";

const activedStyle = 'px-4 py-2 flex items-center gap-2 text-white bg-red-600';
const notActivedStyle = 'px-4 py-2 flex items-center gap-2 text-gray-800 hover:bg-red-400 hover:text-white';

const MemberSidebar = () => {
    const [actived, setActived] = useState([]);
    const { current } = useSelector(state => state.user)

    const handleShowTab = (tabID) => {
        if (actived.includes(tabID)) {
            setActived(actived.filter(id => id !== tabID));
        } else {
            setActived([...actived, tabID]);
        }
    };

    return (
        <div className='bg-gray-400 py-4 min-w-[250px] min-h-screen'>
            <div className='w-full flex flex-col justify-center items-center py-4'>
                <img src={current?.avatar || AvatarLogo} alt="logo" className='w-[100px] object-contain rounded-full' />
                <small className='text-main font-semibold'>{`${current?.lastname} ${current?.firstname}`}</small>
            </div>
            <div>
                {memberSidebar.map(el => (
                    <Fragment key={el.id}>
                        {el.type === 'SINGLE' && (
                            <NavLink
                                to={el.path}
                                className={({ isActive }) => clsx(isActive ? activedStyle : notActivedStyle)}
                            >
                                <span>{el.icon}</span>
                                <span>{el.text}</span>
                            </NavLink>
                        )}
                        {el.type === 'PARENT' && (
                            <div className='flex flex-col text-gray-200'>
                                <div
                                    className='flex items-center justify-between gap-2 px-4 py-2 text-gray-800 hover:bg-red-400 hover:text-white cursor-pointer'
                                    onClick={() => handleShowTab(el.id)}
                                >
                                    <div className='flex items-center gap-2'>
                                        <span>{el.icon}</span>
                                        <span>{el.text}</span>
                                    </div>
                                    {actived.includes(el.id) ? <AiOutlineCaretDown color='gray' />
                                        : <AiOutlineCaretRight color='gray' />}
                                </div>
                                {actived.includes(el.id) && (
                                    <div className='flex flex-col'>
                                        {el.submenu.map(item => (
                                            <NavLink
                                                key={`${el.id}-${item.text}`}
                                                to={item.path}
                                                onClick={e => e.stopPropagation()}
                                                className={({ isActive }) => clsx(isActive ? activedStyle : notActivedStyle, "pl-10")}
                                            >
                                                <span>{item.icon}</span>
                                                <span>{item.text}</span>
                                            </NavLink>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </Fragment>
                ))}
                <NavLink to={"/"} className={clsx(notActivedStyle)}>
                    <TiArrowBackOutline size={20} /><span>Go Home</span>
                </NavLink>
            </div>
        </div>
    );
};

export default memo(MemberSidebar);
