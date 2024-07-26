import React, { useEffect, useState } from 'react';
import { AddressUpdate, Button, InputField, Loading } from 'components';
import { apiGetUserById, apiUpdateUserByAdmin } from 'apis';
import Swal from 'sweetalert2';
import { enqueueSnackbar } from 'notistack';

const UserDetail = ({ userId }) => {
    const [payload, setPayload] = useState({
        email: '',
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

    // get user information
    const fetchUserData = async () => {
        try {
            const response = await apiGetUserById(userId);
            if (response.success) {
                const userData = response.res;
                setPayload({
                    email: userData.email || '',
                    firstname: userData.firstname || '',
                    lastname: userData.lastname || '',
                    mobile: userData.mobile || '',
                    role: userData.role || '1997',
                    address: userData.address || '',
                    city: userData.city || '',
                    district: userData.district || '',
                    ward: userData.ward || ''
                });
            } else {
                Swal.fire('Error', 'Failed to fetch user data', 'error');
            }
        } catch (error) {
            Swal.fire('Error', 'An error occurred while fetching user data', 'error');
        }
    };

    useEffect(() => {
        if (userId) {
            fetchUserData();
        } else {
            resetPayload();
        }
    }, [userId]);

    const handleSubmit = async () => {
        const response = await apiUpdateUserByAdmin(payload, userId);
        if (response.success) {
            enqueueSnackbar(response.message, { variant: 'success' });
            fetchUserData()
        } else {
            enqueueSnackbar(response.message, { variant: 'error' });
        }

    };

    return (
        <div onClick={(e) => e.stopPropagation()}
            className="w-full rounded-lg flex flex-col items-center justify-center p-4 md:min-h-0">
            <h1 className='text-[24px] md:text-[28px] font-semibold text-main text-center mb-8'>
                USER UPDATE FORM
            </h1>
            <div className='flex flex-col md:flex-row w-full items-center gap-3'>
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
            <AddressUpdate
                address={payload.address}
                city={payload.city}
                district={payload.district}
                ward={payload.ward}
                setPayload={setPayload}
                reset={reset}
            />
            <div className='w-full md:w-[50%] mt-5'>
                <Button handleOnclick={handleSubmit} fw>
                    Update User Information
                </Button>
            </div>
        </div>
    );
};

export default UserDetail;
