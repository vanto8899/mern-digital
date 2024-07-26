import React, { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import path from 'utils/path'
import Swal from 'sweetalert2'

const CompleteRegister = () => {
    const { status } = useParams()
    const navigate = useNavigate()

    useEffect(() => {
        if (status === 'failed') Swal.fire('Oop!', 'Register unsuccessfull!', 'error').then(() => {
            navigate(`/${path.LOGIN}`)
        })
        if (status === 'success') Swal.fire('Congratudation!', 'Register successfull!', 'success').then(() => {
            navigate(`/${path.LOGIN}`)
        })
    }, [])

    return (
        <div className='h-screen w-screen bg-gray-300'></div>
    )
}

export default CompleteRegister