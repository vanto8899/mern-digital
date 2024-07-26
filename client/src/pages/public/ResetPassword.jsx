import React, { useState } from 'react';
import { Button } from 'components';
import { useNavigate, useParams } from 'react-router-dom';
import { apiResetPassword } from 'apis';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash } from 'react-icons/fa6';
import path from 'utils/path';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [isShowPassword, setIsShowPassword] = useState(false);
    const { token } = useParams();
    const navigate = useNavigate();

    const handleResetPassword = async () => {
        if (password.length < 6) {
            toast.error('Password must be at least 6 characters long.', { theme: 'colored' });
            return;
        }

        try {
            const response = await apiResetPassword({ password, token });

            if (response.success) {
                toast.success(response.message, { theme: 'colored' });
                setPassword(''); // Clear the input field
                navigate(`/${path.LOGIN}`);
            } else {
                toast.info(response.message, { theme: 'colored' });
            }
        } catch (error) {
            // Handle error here
            if (error.response && error.response.data && error.response.data.message) {
                toast.error(error.response.data.message, { theme: 'colored' });
            } else {
                toast.error('An error occurred. Please try again.', { theme: 'colored' });
            }
        }
    };

    return (
        <div className='flex flex-col items-center absolute animate-side-right top-0 left-0 bottom-0 right-0 bg-white z-50 py-8'>
            <div className='flex flex-col gap-4 w-full px-4 sm:px-8 md:px-16 lg:px-32'>
                <label htmlFor='password'>Enter your new Password: </label>
                <div className='relative w-full'>
                    <input
                        type={isShowPassword ? "text" : "password"}
                        placeholder='Type here'
                        id="password"
                        value={password}
                        className='w-full p-2 border outline-none rounded-md placeholder:text-sm pr-10'
                        onChange={e => setPassword(e.target.value)}
                    />
                    <span
                        className='absolute top-1/2 right-2 transform -translate-y-1/2 cursor-pointer'
                        onClick={() => setIsShowPassword(!isShowPassword)}
                    >
                        {isShowPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                </div>
                <div className='flex items-center justify-end w-full gap-4'>
                    <Button
                        handleOnclick={handleResetPassword}
                        style="px-4 py-2 rounded-md text-white bg-blue-500 text-semibold my-2 hover:bg-blue-700 w-full sm:w-auto"
                    >
                        Submit
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
