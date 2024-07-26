import React, { useCallback, useEffect, useState } from 'react';
import { AddressSelector, Button, InputField, Loading } from 'components';
import { apiFinalRegister, apiRegister } from 'apis';
import Swal from 'sweetalert2';
import { useDispatch } from 'react-redux';
import { IoEye, IoEyeOff } from 'react-icons/io5';
import { formatTime, validate } from 'utils/helpers';
import { showModal } from 'store/app/appSlice';
import clsx from 'clsx';

const RegisterPage = () => {
    const dispatch = useDispatch();
    const [showPassword, setShowPassword] = useState(false);
    const [token, setToken] = useState('');
    const [isVerifiedEmail, setIsVerifiedEmail] = useState(false);
    const [isDialogVisible, setIsDialogVisible] = useState(true); // show code activate
    const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes in seconds
    const [payload, setPayload] = useState({
        email: '',
        password: '',
        firstname: '',
        lastname: '',
        mobile: '',
        role: '1997', // default to User role
        address: '',
        city: '',
        district: '',
        ward: ''
    });
    const [reset, setReset] = useState(false);

    const [invalidFields, setInvalidFields] = useState([]);

    const resetPayload = () => {
        setPayload({
            email: '',
            password: '',
            firstname: '',
            lastname: '',
            mobile: '',
            role: '1997',
            address: '',
            ward: '',
            district: '',
            city: ''
        });
        setReset(true);
    };

    useEffect(() => {
        resetPayload();
    }, []);
    // call api register
    const handleSubmit = useCallback(async () => {
        const invalids = validate(payload, setInvalidFields);
        if (invalids === 0) {
            dispatch(showModal({ isShowModal: true, modalChildren: <Loading /> }));
            try {
                const response = await apiRegister(payload);
                dispatch(showModal({ isShowModal: false, modalChildren: null }));
                if (response.success) {
                    setIsVerifiedEmail(true);
                } else {
                    Swal.fire('Oops!', response.message, 'error');
                }
            } catch (error) {
                const errorMessage = error.response?.data?.message || error.message || "An unexpected error occurred. Please try again.";
                dispatch(showModal({ isShowModal: false, modalChildren: null }));
                Swal.fire('Oops!', errorMessage, 'error');
            }
        }
    }, [payload, dispatch]);

    useEffect(() => {
        if (isVerifiedEmail && isDialogVisible) {
            const timer = setInterval(() => {
                setTimeRemaining(prevTime => {
                    if (prevTime <= 1) {
                        clearInterval(timer);
                        setIsDialogVisible(false);
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [isVerifiedEmail, isDialogVisible]);

    const finalRegister = async () => {
        const response = await apiFinalRegister(token);
        if (response.success) {
            Swal.fire('Congratulations!', response.message, 'success').then(() => {
                resetPayload();
            });
        } else {
            Swal.fire('Oops!', response.message, 'error');
        }
        setIsVerifiedEmail(false);
        setIsDialogVisible(false); // Close the dialog after successful registration
        setToken('');
        // Clear address fields
        setReset(false);
    };

    return (
        <div className={clsx('w-full mr-[240px] md:min-h-screen md:flex md:items-center md:justify-center')}>
            <div className='p-8 bg-white flex flex-col items-center rounded-md w-full max-w-[700px] gap-3 z-40'>
                <h1 className='text-[28px] font-semibold text-main text-center mb-8'>
                    USER REGISTER FORM
                </h1>
                <div className='flex w-full items-center gap-2'>
                    <InputField
                        value={payload.firstname}
                        setValue={setPayload}
                        nameKey='firstname'
                        invalidFields={invalidFields}
                        setInvalidFields={setInvalidFields}
                        fullWidth
                    />
                    <InputField
                        value={payload.lastname}
                        setValue={setPayload}
                        nameKey='lastname'
                        invalidFields={invalidFields}
                        setInvalidFields={setInvalidFields}
                        fullWidth
                    />
                </div>
                <InputField
                    value={payload.email}
                    setValue={setPayload}
                    nameKey='email'
                    invalidFields={invalidFields}
                    setInvalidFields={setInvalidFields}
                    fullWidth
                />
                <InputField
                    value={payload.mobile}
                    setValue={setPayload}
                    nameKey='mobile'
                    invalidFields={invalidFields}
                    setInvalidFields={setInvalidFields}
                    fullWidth
                />
                <div className='w-full flex items-center relative'>
                    <InputField
                        value={payload.password}
                        setValue={setPayload}
                        nameKey='password'
                        invalidFields={invalidFields}
                        setInvalidFields={setInvalidFields}
                        type={showPassword ? 'text' : 'password'}
                        fullWidth
                    />
                    <div
                        className='cursor-pointer text-xl absolute right-2'
                        onClick={() => setShowPassword(prev => !prev)}
                    >
                        <span>{showPassword ? <IoEyeOff /> : <IoEye />}</span>
                    </div>
                </div>
                <AddressSelector setPayload={setPayload} reset={reset} />
                <div className='w-[50%]'>
                    <select
                        value={payload.role}
                        onChange={(e) => setPayload(prev => ({ ...prev, role: e.target.value }))}
                        className='mt-1 block w-full p-2 border border-gray-300 bg-white 
                        text-sm italic rounded-sm shadow-sm focus:outline-none focus:ring-blue-500
                        focus:border-blue-500 sm:text-sm'
                    >
                        <option value=''>Select Role</option>
                        <option value='1988'>Admin</option>
                        <option value='1997'>User</option>
                    </select>
                </div>
                <Button handleOnclick={handleSubmit} fw>
                    Add New User
                </Button>
            </div>

            {isVerifiedEmail && isDialogVisible && (
                <div className='absolute top-0 left-0 right-0 bottom-0 bg-overlay z-50 flex flex-col justify-center items-center'>
                    <div className='bg-white w-full md:w-[500px] rounded-md p-8'>
                        <h4>We sent a code to your email. Please check your email and enter the code here:</h4>
                        <div className='flex flex-col md:flex-row justify-between w-full items-center'>
                            <input
                                type='text'
                                value={token}
                                onChange={e => setToken(e.target.value)}
                                className='mt-2 p-2 border rounded-md outline-none md:w-[70%]'
                            />
                            <button
                                className='w-full md:w-[25%] mt-2 md:mt-0 px-4 py-2 bg-blue-700 hover:bg-red-700 font-semibold text-white rounded-md ml-0 md:ml-4'
                                onClick={finalRegister}
                            >
                                Submit
                            </button>
                        </div>
                        <div className='mt-4 text-center text-main font-semibold'>
                            <span>(Time remaining: {formatTime(timeRemaining)})</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RegisterPage;
