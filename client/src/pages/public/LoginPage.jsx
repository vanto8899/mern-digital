import React, { useCallback, useEffect, useState } from 'react'
import { Button, InputField, Loading } from 'components'
import { apiFinalRegister, apiForgotPassword, apiLogin, apiRegister } from 'apis'
import Swal from 'sweetalert2'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import path from 'utils/path'
import { login } from 'store/users/userSlice'
import { useDispatch, useSelector } from 'react-redux'
import { IoEye, IoEyeOff } from 'react-icons/io5'
import { enqueueSnackbar } from 'notistack';
import { formatTime, validate } from 'utils/helpers'
import { showModal } from 'store/app/appSlice'

const LoginPage = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const isLoggedIn = useSelector(state => state.user?.isLoggedIn);
    const [showPassword, setShowPassword] = useState(false)
    const [isRegister, setIsRegister] = useState(false)
    const [isForgotPassword, setIsForgotPassword] = useState(false)
    const [email, setEmail] = useState('')
    const [token, setToken] = useState('')
    const [isVerifiedEmail, setIsVerifiedEmail] = useState(false)
    const [isDialogVisible, setIsDialogVisible] = useState(true);//show code activate
    const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes in seconds
    const [searchParams] = useSearchParams()
    //console.log(searchParams.get('redirect'))
    const [payload, setPayload] = useState({
        email: "",
        password: "",
        firstname: "",
        lastname: "",
        mobile: ""
    })
    const [invalidFields, setInvalidFields] = useState([])
    const resetPayload = () => {
        setPayload({
            email: "",
            password: "",
            firstname: "",
            lastname: "",
            mobile: ""
        })
    }

    const handleForgotPassword = async () => {
        dispatch(showModal({ isShowModal: true, modalChildren: <Loading /> }))
        const response = await apiForgotPassword({ email })
        dispatch(showModal({ isShowModal: false, modalChildren: null }))
        if (response.success) {
            enqueueSnackbar(response.message, { variant: 'success' });

        } else enqueueSnackbar(response.message, { variant: 'error' });
    }

    useEffect(() => {
        resetPayload()
    }, [isRegister])

    // check redux status login
    useEffect(() => {
        if (isLoggedIn) {
            searchParams.get("redirect") ? navigate(searchParams.get("redirect")) : navigate(`/${path.HOME}`)
        }
    }, [isLoggedIn, navigate]);

    // submit
    const handleSubmit = useCallback(async () => {
        const { firstname, lastname, mobile, ...data } = payload;
        const invalids = isRegister ? validate(payload, setInvalidFields) : validate(data, setInvalidFields);
        // console.log(invalids) // check validate
        if (invalids === 0) {
            try {
                if (isRegister) {
                    dispatch(showModal({ isShowModal: true, modalChildren: <Loading /> }));
                    const response = await apiRegister(payload);
                    dispatch(showModal({ isShowModal: false, modalChildren: null }));

                    if (response.success) {
                        setIsVerifiedEmail(true);
                    } else {
                        Swal.fire('Oops!', response.error || "Please try again.", 'error');
                    }
                } else {
                    const rs = await apiLogin(data);

                    if (rs.success) {
                        dispatch(login({ isLoggedIn: true, token: rs.accessToken, userData: rs.userData }));
                        // check login to direct page
                        searchParams.get("redirect") ? navigate(searchParams.get("redirect")) : navigate(`/${path.HOME}`);
                    } else {
                        Swal.fire('Oops!', rs.message, 'error');
                    }
                }
            } catch (error) {
                // Check if error response has a message property
                const errorMessage = error.response?.data?.message || error.message || "An unexpected error occurred. Please try again.";
                Swal.fire('Oops!', errorMessage, 'error');
            }
        }
    }, [payload, isRegister]);

    // time out for activate code
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
            }, 1000); // Decrement every second

            // Cleanup the timer if the component unmounts
            return () => clearInterval(timer);
        }
    }, [isVerifiedEmail, isDialogVisible]);

    const finalRegister = async () => {
        const response = await apiFinalRegister(token)
        if (response.success) {
            Swal.fire('Congratulation!', response.message, 'success').then(() => {
                setIsRegister(false)
                resetPayload()
            });
        } else Swal.fire('Oops!', response.message, 'error')
        setIsVerifiedEmail(false)
        setIsDialogVisible(false); // Close the dialog after successful registration
        setToken('')
    }

    return (
        <div className='w-screen h-screen relative flex items-center justify-center'>
            {/* Modal */}
            {isVerifiedEmail && isDialogVisible &&
                <div className='absolute top-0 left-0 right-0 bottom-0 bg-overlay z-50 flex flex-col justify-center items-center'>
                    <div className='bg-white w-[500px] rounded-md p-8'>
                        <h4 className=''>We sent a code to your email. Please check your email and enter the code here:</h4>
                        <div className='flex justify-between w-full items-center'>
                            <input type="text"
                                value={token}
                                onChange={e => setToken(e.target.value)}
                                className='mt-2 p-2 border rounded-md outline-none w-[70%]'
                            />
                            <button className='w-[25%] px-4 py-2 bg-blue-700 hover:bg-red-700 font-semibold text-white rounded-md ml-4'
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
            }

            {isForgotPassword &&
                <div className='flex flex-col items-center absolute animate-side-right top-0 left-0 bottom-0 right-0 bg-overlay z-50 py-8'>
                    <h1 className='text-[28px] font-semibold text-blue-600 text-center mb-8'>
                        RESET YOUR PASSWORD ?
                    </h1>
                    <div className='flex flex-col gap-4 w-full px-4 sm:px-8 md:px-16 lg:px-32'>
                        <label htmlFor='email' className='text-white'>Enter your email: </label>
                        <input
                            type="text"
                            placeholder='Exp: email@gmail.com'
                            id="email"
                            value={email}
                            className='w-full p-2 border-b outline-none rounded-md placeholder:text-sm'
                            onChange={e => setEmail(e.target.value)}
                        />
                        <div className='flex items-center justify-end w-full gap-4'>
                            <Button
                                handleOnclick={() => setIsForgotPassword(false)}
                                style="px-4 py-2 rounded-md text-white bg-gray-500 text-semibold my-2 hover:bg-gray-700 w-full sm:w-auto"
                            >Back to</Button>
                            <Button
                                handleOnclick={handleForgotPassword}
                                style="px-4 py-2 rounded-md text-white bg-blue-500 text-semibold my-2 hover:bg-blue-700 w-full sm:w-auto"
                            >Submit</Button>
                        </div>
                    </div>
                </div>
            }

            {/* main form */}
            <img
                src='https://t3.ftcdn.net/jpg/05/79/79/66/360_F_579796669_RfgUEv3sBoY3mATB0uuQhkoAeWrzBfDx.jpg'
                alt='Login image'
                className='w-full h-full object-cover hidden md:block'
            />
            <div className='absolute top-0 bottom-0 right-0 left-0 md:right-0 md:left-auto md:w-1/2 flex items-center justify-center'>
                <div className='p-8 bg-white flex flex-col items-center rounded-md w-full max-w-[500px] gap-3'>
                    <h1 className='text-[28px] font-semibold text-main text-center mb-8'>
                        {isRegister ? "USER REGISTER " : "USER LOGIN"}
                    </h1>
                    {isRegister &&
                        <div className='flex w-full items-center gap-2'>
                            <InputField
                                value={payload.firstname}
                                setValue={setPayload}
                                nameKey="firstname"
                                invalidFields={invalidFields}
                                setInvalidFields={setInvalidFields}
                                fullWidth
                            />
                            <InputField
                                value={payload.lastname}
                                setValue={setPayload}
                                nameKey="lastname"
                                invalidFields={invalidFields}
                                setInvalidFields={setInvalidFields}
                                fullWidth
                            />
                        </div>}
                    <InputField
                        value={payload.email}
                        setValue={setPayload}
                        nameKey="email"
                        invalidFields={invalidFields}
                        setInvalidFields={setInvalidFields}
                        fullWidth
                    />
                    {isRegister &&
                        <InputField
                            value={payload.mobile}
                            setValue={setPayload}
                            nameKey="mobile"
                            invalidFields={invalidFields}
                            setInvalidFields={setInvalidFields}
                            fullWidth
                        />
                    }
                    <div className='w-full flex items-center relative'>
                        <InputField
                            value={payload.password}
                            setValue={setPayload}
                            nameKey="password"
                            invalidFields={invalidFields}
                            setInvalidFields={setInvalidFields}
                            type={showPassword ? 'text' : 'password'}
                            fullWidth
                        />
                        <div className='cursor-pointer text-xl absolute right-2' onClick={() => setShowPassword((preve) => !preve)}>
                            <span>
                                {
                                    showPassword ? (
                                        <IoEyeOff />
                                    )
                                        :
                                        (
                                            <IoEye />
                                        )
                                }
                            </span>
                        </div>
                    </div>
                    <Button
                        handleOnclick={handleSubmit}
                        fw
                    >
                        {isRegister ? 'Register' : 'Login'}
                    </Button>
                    <div className='w-full flex items-center justify-between my-2 text-sm'>
                        {!isRegister && <span
                            className='text-red-500 hover:underline hover:text-semibold cursor-pointer hover:text-blue-900'
                            onClick={() => setIsForgotPassword(true)}
                        >Forgot your password?
                        </span>}
                        {!isRegister &&
                            <span className='text-red-500 hover:underline cursor-pointer hover:text-blue-900'
                                onClick={() => setIsRegister(true)}
                            >
                                Create Account
                            </span>
                        }
                        {isRegister &&
                            <span className='text-red-500 hover:underline hover:text-blue-900 cursor-pointer w-full text-center'
                                onClick={() => setIsRegister(false)}
                            >
                                Go to Login
                            </span>
                        }
                    </div>
                    <Link to={`/${path.HOME}`} className='text-red-500 text-sm hover:underline hover:text-blue-900 cursor-pointer w-full text-center'
                    >
                        Go Home?</Link>
                </div>
            </div>
        </div>
    )
}

export default LoginPage
