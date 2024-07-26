import React, { useCallback, useEffect, useState } from 'react';
import { InputField, InputForm, Button } from 'components';
import useDebounce from 'hooks/useDebounce';
import { useSearchParams } from 'react-router-dom';
import { useForm } from "react-hook-form";
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import clsx from 'clsx';
import { AiFillDelete, AiFillEdit } from 'react-icons/ai';
import { apiDeleteCouponById, apiGetCoupons, apiUpdateCouponById } from 'apis';
import moment from 'moment';

const ManageCoupons = () => {
    // Initializing react-hook-form with default values
    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        defaultValues: {
            _id: '',
            name: '',
            discount: '',
            expiry: '',
        }
    });
    // State to store coupons, search queries, the element being edited, and a toggle for updating the component
    const [coupons, setCoupons] = useState(null);
    const [queries, setQueries] = useState({ q: '' });
    const [editElm, setEditElm] = useState(null);
    const [update, setUpdate] = useState(false);
    const [params] = useSearchParams();

    // Fetching coupons from API
    const fetchCoupons = useCallback(async (queriesObj) => {
        const response = await apiGetCoupons(queriesObj);
        if (response.success) setCoupons(response.coupons);
    }, []);

    // Function to re-render the component
    const render = useCallback(() => {
        setUpdate(prevUpdate => !prevUpdate);
    }, []);

    // Debouncing search queries
    const queriesDebounce = useDebounce(queries.q, 800);

    // Fetching coupons when queries or update toggle changes
    useEffect(() => {
        const queriesObj = Object.fromEntries([...params]);
        if (queriesDebounce) queriesObj.q = queriesDebounce;
        fetchCoupons(queriesObj);
    }, [queriesDebounce, params, update, fetchCoupons]);

    // Handling form submission for updating a coupon
    const handleUpdate = async (data) => {
        const response = await apiUpdateCouponById(data, editElm._id);
        if (response.success) {
            setEditElm(null);
            render();
            toast.success(response.message);
        } else {
            toast.error(response.message);
        }
    };

    const handleDeleteCoupon = (uid) => {
        Swal.fire({
            title: "Coupon Deleting...",
            text: "Do you want to remove this coupon?",
            showCancelButton: true,
        }).then(async (rs) => {
            if (rs.isConfirmed) {
                const response = await apiDeleteCouponById(uid);
                if (response.success) {
                    render();
                    toast.success(response.message);
                } else {
                    toast.error(response.message);
                }
            }
        });
    };

    // Presetting form values when editing an element
    useEffect(() => {
        if (editElm) {
            reset({
                _id: editElm._id,
                name: editElm.name,
                discount: editElm.discount,
                expiry: editElm.expiry,
            });
        }
    }, [editElm, reset]);

    return (
        <div className={clsx("w-full overflow-x-auto", editElm && "pl-16")}>
            <h1 className='h-[75px] flex justify-between items-center text-3xl font-bold p-4 text-main bg-gray-100 border-b border-gray-500'>
                <span>Manage Coupons</span>
            </h1>
            <div className='w-full p-4'>
                <div className='flex justify-center w-full md:justify-end'>
                    <InputField
                        nameKey={'q'}
                        value={queries.q}
                        setValue={setQueries}
                        style={'w500'}
                        placeholder="Search by ID or Coupon name"
                        isHideLabel
                    />
                </div>
                <form onSubmit={handleSubmit(handleUpdate)} className='md:w-full overflow-x-auto md:overflow-visible'>
                    {editElm && <Button type='submit'>Update Information</Button>}
                    <table className='table-auto text-left w-full my-6'>
                        <thead className='font-bold bg-main text-[14px] text-white'>
                            <tr className='border border-gray-500'>
                                <th className='px-4 py-3'>#</th>
                                <th className='px-4 py-3'>Coupon ID</th>
                                <th className='px-4 py-3'>Coupon Name</th>
                                <th className='px-4 py-3'>Coupon Discount (%)</th>
                                <th className='px-4 py-3'>Coupon Expiry</th>
                                <th className='px-4 py-3'>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {coupons?.map((el, index) => {
                                // Checking if each coupon is expired
                                const isExpired = moment(el.expiry).isBefore(moment());
                                return (
                                    <tr key={el._id} className='border border-gray-500'>
                                        <td className='px-4 py-2'>{index + 1}</td>
                                        <td className='px-4 py-2'>
                                            {editElm?._id === el._id
                                                ? <InputForm
                                                    fullWidth
                                                    register={register}
                                                    errors={errors}
                                                    id={"_id"}
                                                    validate={{ required: 'This field is required' }}
                                                    defaultValue={editElm._id}
                                                />
                                                : <span>{el._id}</span>}
                                        </td>
                                        <td className='px-4 py-2'>
                                            {editElm?._id === el._id
                                                ? <InputForm
                                                    fullWidth
                                                    register={register}
                                                    errors={errors}
                                                    id={"name"}
                                                    validate={{ required: 'This field is required' }}
                                                    defaultValue={editElm.name}
                                                />
                                                : <span>{el.name}</span>}
                                        </td>
                                        <td className='px-4 py-2'>
                                            {editElm?._id === el._id
                                                ? <InputForm
                                                    fullWidth
                                                    register={register}
                                                    errors={errors}
                                                    id={"discount"}
                                                    validate={{ required: 'This field is required' }}
                                                    defaultValue={editElm.discount}
                                                />
                                                : <span>{el.discount}</span>}
                                        </td>
                                        {/* Displaying either the expiry date or 'Coupon expired' */}
                                        <td className={`px-4 py-2 ${isExpired ? 'text-main' : ''}`}>
                                            {editElm?._id === el._id ? (
                                                <InputForm
                                                    fullWidth
                                                    register={register}
                                                    errors={errors}
                                                    id={"expiry"}
                                                    validate={{ required: 'This field is required' }}
                                                    defaultValue={editElm.expiry}
                                                />
                                            ) : (
                                                isExpired ? 'Coupon expired' : moment(el.expiry).format("DD/MM/YYYY")
                                            )}
                                        </td>
                                        <td className='p-2 flex gap-2'
                                            onClick={(e) => e.stopPropagation()}>
                                            {editElm?._id === el._id
                                                ? <span className='px-1 text-main hover:underline cursor-pointer'
                                                    onClick={() => setEditElm(null)}>Back</span>
                                                : <span title='Quick edit' className='px-2 text-blue-900 hover:underline cursor-pointer'
                                                    onClick={() => setEditElm(el)}><AiFillEdit size={20} /></span>}
                                            <span
                                                title='Delete user'
                                                className='px-1 text-main cursor-pointer'
                                                onClick={() => handleDeleteCoupon(el._id)}
                                            ><AiFillDelete /></span>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </form>
            </div>
        </div>
    );
};

export default ManageCoupons;
