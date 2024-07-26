import React, { useEffect, useState } from 'react';
import { Button, InputField } from 'components'; // Adjust as per your actual imports
import { apiGetOrderById, apiUpdateOrderInfo } from 'apis';
import Swal from 'sweetalert2';
import { enqueueSnackbar } from 'notistack';

const OrderInformationDetail = ({ orderId }) => {
    const [payload, setPayload] = useState({
        email: '',
        name: '',
        mobile: '',
        address: '',
        message: '',
        status: '',
        paymentStatus: ''
    });
    const [invalidFields, setInvalidFields] = useState([]);

    const statusOptions = [
        { value: 'Succeed', label: 'Succeed' },
        { value: 'Pending', label: 'Pending' },
        { value: 'Cancelled', label: 'Cancelled' },
    ];

    const paymentStatusOptions = [
        { value: 'Pending', label: 'Pending' },
        { value: 'Failed', label: 'Failed' },
        { value: 'Completed', label: 'Completed' },
    ];

    const fetchOrderData = async () => {
        try {
            const response = await apiGetOrderById(orderId);
            if (response.success) {
                const orderData = response.order;
                setPayload({
                    email: orderData.email || '',
                    name: orderData.name || '',
                    mobile: orderData.mobile || '',
                    address: orderData.address || '',
                    message: orderData.message || '',
                    status: orderData.status || '',
                    paymentStatus: orderData.paymentStatus || '',
                });
            } else {
                Swal.fire('Error', 'Failed to fetch order data', 'error');
            }
        } catch (error) {
            Swal.fire('Error', 'An error occurred while fetching order data', 'error');
        }
    };

    useEffect(() => {
        if (orderId) {
            fetchOrderData();
        }
    }, [orderId]);

    const handleSelectChange = (e) => {
        const { name, value } = e.target;
        setPayload(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        try {
            const { email, name, mobile, address, message, status, paymentStatus } = payload;
            const updatedPayload = { email, name, mobile, address, message, status, paymentStatus };
            const response = await apiUpdateOrderInfo(orderId, updatedPayload);
            if (response.success) {
                enqueueSnackbar(response.message, { variant: 'success' });
                fetchOrderData(); // Re-fetch data to update form fields
            } else {
                enqueueSnackbar(response.message, { variant: 'error' });
            }
        } catch (error) {
            console.error('Error updating order information:', error);
            enqueueSnackbar('Error updating order information', { variant: 'error' });
        }
    };

    return (
        <div onClick={(e) => e.stopPropagation()} className="w-full max-w-3xl md:min-h-0 rounded-lg flex flex-col items-center justify-center p-6">
            <h1 className='text-[28px] font-semibold text-main text-center mb-8'>
                ORDER INFORMATION FORM
            </h1>
            <InputField
                value={payload.name}
                setValue={setPayload}
                nameKey='name'
                invalidFields={invalidFields}
                setInvalidFields={setInvalidFields}
                fullWidth
            />
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
                value={payload.address}
                setValue={setPayload}
                nameKey='address'
                invalidFields={invalidFields}
                setInvalidFields={setInvalidFields}
                fullWidth
            />
            <InputField
                value={payload.message}
                setValue={setPayload}
                nameKey='message'
                invalidFields={invalidFields}
                setInvalidFields={setInvalidFields}
                fullWidth
            />
            <div className='mt-2 w-full flex flex-row gap-4'>
                <div className='w-full'>
                    <label className='block mb-2 text-sm font-medium text-gray-700'>
                        Order Status
                    </label>
                    <select
                        name='status'
                        value={payload.status}
                        onChange={handleSelectChange}
                        className='w-full p-2 border border-gray-300 rounded-xs'
                    >
                        <option value='' disabled>Select status</option>
                        {statusOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                </div>
                <div className='w-full'>
                    <label className='block mb-2 text-sm font-medium text-gray-700'>
                        Payment Status
                    </label>
                    <select
                        name='paymentStatus'
                        value={payload.paymentStatus}
                        onChange={handleSelectChange}
                        className='w-full p-2 border border-gray-300 rounded-xs'
                    >
                        <option value='' disabled>Select payment status</option>
                        {paymentStatusOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                </div>
            </div>
            <div className='w-full md:w-[50%] mt-5'>
                <Button handleOnclick={handleSubmit} fw>
                    Update Order Information
                </Button>
            </div>
        </div>
    );
};

export default OrderInformationDetail;
