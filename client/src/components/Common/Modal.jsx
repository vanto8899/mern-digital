import React, { memo } from 'react'
import { useDispatch } from 'react-redux'
import { showModal } from '../../store/app/appSlice'

const Modal = ({ children }) => {
    const dispatch = useDispatch()
    return (
        <div className='absolute inset-0 bg-overlay z-50 flex justify-center items-center'
            onClick={() => dispatch(showModal({ isShowModal: false, modalChildren: null }))}
        >
            {children}
        </div>
    )
}

export default memo(Modal)