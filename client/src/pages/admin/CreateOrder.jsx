import React, { useCallback, useEffect, useState } from 'react';
import { AddressUpdate, Button, InputField } from 'components';
import FilterProduct from 'components/Modals/FilterProduct'
import { apiGetUserByEmailOrMobile, apiUpdateUserByAdmin } from 'apis';
import Swal from 'sweetalert2';
import AdminDetailCart from 'pages/admin/AdminDetailCart';
import { IoClose } from 'react-icons/io5';
import { enqueueSnackbar } from 'notistack';

const CreateOrder = () => {
    const [isShowAddProduct, setIsShowAddProduct] = useState(false);
    const [isClosing, setIsClosing] = useState(false); // State for closing animation
    const [triggerFetchOrder, setTriggerFetchOrder] = useState(false); // State trigger
    const [payload, setPayload] = useState({
        email: '',
        password: '',
        lastname: '',
        mobile: '',
        address: '',
        city: '',
        district: '',
        ward: '',
        message: '',
        userId: ''
    });
    const [reset, setReset] = useState(false);
    const [invalidFields, setInvalidFields] = useState([]);

    // reset form
    const resetPayload = () => {
        setPayload({
            email: '',
            password: '',
            lastname: '',
            mobile: '',
            address: '',
            city: '',
            district: '',
            ward: '',
            message: '',
            userId: ''
        });
        setReset(true);
    };
    // fetch data user by Id or email
    const fetchUserData = async (emailOrMobile) => {
        try {
            const response = await apiGetUserByEmailOrMobile(emailOrMobile);
            if (response.success) {
                const userData = response.res;
                setPayload({
                    email: userData.email || '',
                    lastname: userData.lastname || '',
                    mobile: userData.mobile || '',
                    address: userData.address || '',
                    city: userData.city || '',
                    district: userData.district || '',
                    ward: userData.ward || '',
                    message: userData.message || '',
                    userId: userData._id
                });
            } else {
                Swal.fire(response.message, 'error');
            }
        } catch (error) {
            Swal.fire("Error", error.response?.data?.message || error.message || "Please try again.", "error");
        }
    };

    useEffect(() => {
        resetPayload();
    }, []);

    // find data user via email or phone
    const handleFindUserInfo = useCallback(async () => {
        const emailOrMobile = payload.email || payload.mobile;
        await fetchUserData(emailOrMobile);
    }, [payload]);

    // Show add product and update user info order
    const handleSubmit = async () => {
        setIsShowAddProduct(true);
        if (payload.userId && (payload.email || payload.mobile)) {
            const response = await apiUpdateUserByAdmin(payload, payload.userId);
            if (response.success) {
                const emailOrMobile = payload.email || payload.mobile;
                fetchUserData(emailOrMobile);
            } else {
                enqueueSnackbar(response.message, { variant: 'error' });
            }
        }
    };

    // Close add product window
    const handleAddProductClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsClosing(false);
            setIsShowAddProduct(false);
        }, 800); // Adjust timeout duration to match CSS animation
    };

    return (
        <div className="w-full relative">
            <header className="text-3xl font-semibold p-4 bg-gray-100 border-b border-gray-500 text-main">
                Create New Order
            </header>
            {/* show window add product here */}
            {isShowAddProduct && (
                <div className="absolute min-h-screen top-0 left-0 right-0 bottom-0 bg-overlay z-50 flex flex-col justify-center items-center">
                    <div className={`w-full md:w-[68%] bg-gray-50 absolute top-14 left-[510px] ${isClosing ? 'animate-side-left-close' : 'animate-side-left'}`}>
                        <FilterProduct userId={payload.userId} triggerFetchOrder={() => setTriggerFetchOrder(!triggerFetchOrder)} />
                        <span
                            className="absolute top-3 right-4 p-3 text-gray-700 hover:rounded-full hover:text-main cursor-pointer"
                            onClick={handleAddProductClose}
                        >
                            <IoClose size={24} />
                        </span>
                    </div>
                </div>
            )}
            <div className='w-full flex flex-col md:flex-row'>
                <div className='p-8 bg-white flex flex-col items-center rounded-md w-full md:w-[30%] gap-3'>
                    <h1 className='text-[28px] font-semibold text-main text-center mb-8'>
                        ORDER INFORMATION
                    </h1>
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
                    <InputField
                        value={payload.lastname}
                        setValue={setPayload}
                        nameKey='lastname'
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
                    <textarea
                        className="w-full p-3 border border-gray-300 rounded-md placeholder:italic placeholder:text-sm"
                        placeholder="Enter additional notes"
                        value={payload.message}
                        onChange={(e) => setPayload({ ...payload, message: e.target.value })}
                    />
                    <div className='w-full flex flex-col items-start gap-4 md:flex-row md:justify-between'>
                        <Button handleOnclick={handleFindUserInfo}>
                            Find Information
                        </Button>
                        <Button handleOnclick={handleSubmit}>
                            Add Product
                        </Button>
                    </div>
                </div>
                {/* detail order here */}
                <div className='w-full md:w-[70%]'>
                    <AdminDetailCart userId={payload.userId} triggerFetchOrder={triggerFetchOrder} />
                </div>
            </div>
        </div>
    );
};

export default CreateOrder;
