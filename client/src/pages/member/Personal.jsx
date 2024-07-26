import { Button, InputForm, Loading } from 'components';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import AvatarLogo from 'assests/avatar.jpeg';
import { apiUpdateCurrent } from 'apis';
import { getCurrent } from 'store/users/asyncActions';
import { useSnackbar } from 'notistack';
import { showModal } from 'store/app/appSlice';
import withBaseComponent from 'hocs/withBaseComponent';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';

const Personal = ({ navigate }) => {
    const { register, handleSubmit, formState: { errors, isDirty }, reset, watch } = useForm();
    const { current } = useSelector(state => state.user);
    const dispatch = useDispatch();
    const [searchParams] = useSearchParams();
    const { enqueueSnackbar } = useSnackbar();
    const [cities, setCities] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const selectedCity = watch('city');
    const selectedDistrict = watch('district');

    // get api address
    useEffect(() => {
        axios.get('https://raw.githubusercontent.com/kenzouno1/DiaGioiHanhChinhVN/master/data.json')
            .then(response => {
                setCities(response.data);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }, []);

    useEffect(() => {
        if (current && cities.length > 0) {
            const foundCity = cities.find(c => c.Name === current.city);
            if (foundCity) {
                setDistricts(foundCity.Districts);
                const foundDistrict = foundCity.Districts.find(d => d.Name === current.district);
                if (foundDistrict) {
                    setWards(foundDistrict.Wards);
                }
            }
            reset({
                firstname: current.firstname || '',
                lastname: current.lastname || '',
                email: current.email || '',
                mobile: current.mobile || '',
                address: current.address || '',
                city: current.city || '',
                district: current.district || '',
                ward: current.ward || '',
                message: current.message || '',
                avatar: current.avatar || ''
            });
        }
    }, [current, cities, reset]);
    // select district
    useEffect(() => {
        if (selectedCity) {
            const cityData = cities.find(city => city.Name === selectedCity);
            if (cityData) {
                setDistricts(cityData.Districts);
                setWards([]);
            }
        }
    }, [selectedCity, cities]);
    // select wards
    useEffect(() => {
        if (selectedDistrict) {
            const districtData = districts.find(district => district.Name === selectedDistrict);
            if (districtData) {
                setWards(districtData.Wards);
            }
        }
    }, [selectedDistrict, districts]);
    // call update
    const handleUpdateInfor = async (data) => {
        const formData = new FormData();
        if (data.avatar.length > 0) formData.append("avatar", data.avatar[0]);
        delete data.avatar;
        for (let [key, value] of Object.entries(data)) {
            formData.append(key, value);
        }
        dispatch(showModal({ isShowModal: true, modalChildren: <Loading /> }));
        try {
            const response = await apiUpdateCurrent(formData);
            dispatch(showModal({ isShowModal: false, modalChildren: null }));
            if (response.success) {
                dispatch(getCurrent());
                enqueueSnackbar(response.message, { variant: 'success' });
                if (searchParams.get('redirect')) navigate(searchParams.get('redirect'));
            } else {
                enqueueSnackbar(response.message, { variant: 'error' });
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || "An unexpected error occurred. Please try again.";
            dispatch(showModal({ isShowModal: false, modalChildren: null }));
            enqueueSnackbar(errorMessage, { variant: 'info' });
        }
    };

    if (!current) {
        return <Loading />; // Render loading state if current is undefined
    }

    return (
        <div onSubmit={handleSubmit(handleUpdateInfor)} className='w-full relative px-4'>
            <header className='text-3xl font-semibold py-4 border-b border-gray-300'>
                Personal
            </header>
            <form className='w-full mr-[200px] md:w-3/5 md:mx-auto py-8 flex flex-col gap-4'>
                <InputForm
                    label='Firstname'
                    register={register}
                    errors={errors}
                    id='firstname'
                    validate={{ required: 'This field is required' }}
                    fullWidth
                />
                <InputForm
                    label='Lastname'
                    register={register}
                    errors={errors}
                    id='lastname'
                    validate={{ required: 'This field is required' }}
                    fullWidth
                />
                <InputForm
                    label='Email Address'
                    register={register}
                    errors={errors}
                    id='email'
                    validate={{
                        required: 'This field is required',
                        pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: "Invalid email address"
                        }
                    }}
                    fullWidth
                />
                <InputForm
                    label='Phone number'
                    register={register}
                    errors={errors}
                    id='mobile'
                    validate={{
                        required: 'This field is required',
                        pattern: {
                            value: /^(0|\+84)(\d{9}|\d{10})$/,
                            message: "Invalid mobile phone"
                        }
                    }}
                    fullWidth
                />
                <InputForm
                    label='Address'
                    register={register}
                    errors={errors}
                    id='address'
                    validate={{ required: 'This field is required' }}
                    fullWidth
                />
                <div className='w-full flex md: flex-col md:flex-row gap-2'>
                    <div className='w-full flex flex-col gap-2'>
                        <label htmlFor='city' className='font-medium'>City</label>
                        <select id='city' {...register('city')} className='p-2 border border-gray-300 rounded'>
                            <option value=''>Select city</option>
                            {cities.map(city => (
                                <option key={city.Id} value={city.Name}>{city.Name}</option>
                            ))}
                        </select>
                        {errors.city && <span className='text-red-500'>{errors.city.message}</span>}
                    </div>
                    <div className='w-full flex flex-col gap-2'>
                        <label htmlFor='district' className='font-medium'>District</label>
                        <select id='district' {...register('district')} className='p-2 border border-gray-300 rounded'>
                            <option value=''>Select district</option>
                            {districts.map(district => (
                                <option key={district.Id} value={district.Name}>{district.Name}</option>
                            ))}
                        </select>
                        {errors.district && <span className='text-red-500'>{errors.district.message}</span>}
                    </div>
                    <div className='w-full flex flex-col gap-2'>
                        <label htmlFor='ward' className='font-medium'>Ward</label>
                        <select id='ward' {...register('ward')} className='p-2 border border-gray-300 rounded'>
                            <option value=''>Select ward</option>
                            {wards.map(ward => (
                                <option key={ward.Id} value={ward.Name}>{ward.Name}</option>
                            ))}
                        </select>
                        {errors.ward && <span className='text-red-500'>{errors.ward.message}</span>}
                    </div>
                </div>
                <div className='w-full flex flex-col gap-2'>
                    <label htmlFor='message' className='font-medium'>Message</label>
                    <textarea
                        {...register('message')}
                        className="w-full p-2 border border-gray-300 rounded-lg placeholder:italic placeholder:text-sm"
                        rows="4"
                        placeholder="Enter your message here..."
                    ></textarea>
                </div>
                <div>
                    <div className='flex items-center gap-2'>
                        <span className='font-medium'>Account status:</span>
                        <span className={current?.isBlocked ? 'text-red-500' : 'text-green-500'}>
                            {current?.isBlocked ? 'Blocked' : 'Actived'}
                        </span>
                    </div>
                    <div className='flex items-center gap-2'>
                        <span className='font-medium'>Role:</span>
                        <span>{+current?.role === 1988 ? 'Admin' : 'User'}</span>
                    </div>
                    <div className='flex items-center gap-2'>
                        <span className='font-medium'>Created At:</span>
                        <span>{moment(current?.createdAt).fromNow()}</span>
                    </div>
                    <div className='flex flex-col gap-2'>
                        <span className='font-medium'>Profile Image:</span>
                        <label htmlFor="file">
                            <img src={current?.avatar || AvatarLogo} alt="avatar" className='w-20 h-20 ml-8 object-cover rounded-full cursor-pointer' />
                        </label>
                        <input type="file" id="file" {...register('avatar')} hidden />
                    </div>
                    {isDirty &&
                        <div className='w-full flex justify-end'>
                            <Button type='submit'>Update Information</Button>
                        </div>}
                </div>
            </form>
        </div>
    );
};

export default withBaseComponent(Personal);
