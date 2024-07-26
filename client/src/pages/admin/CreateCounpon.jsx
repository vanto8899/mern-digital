import React, { useCallback, useEffect, useState } from 'react';
import { Button, InputField, Loading } from 'components';
import { apiCreateNewCoupon } from 'apis';
import { useDispatch } from 'react-redux';
import { validate } from 'utils/helpers';
import { showModal } from 'store/app/appSlice';
import clsx from 'clsx';
import { enqueueSnackbar } from 'notistack';

const CreateCounpon = () => {
    const dispatch = useDispatch();
    const [payload, setPayload] = useState({
        name: "",
        discount: "",
        expiry: ""
    });
    const [reset, setReset] = useState(false);

    const [invalidFields, setInvalidFields] = useState([]);

    const resetPayload = () => {
        setPayload({
            name: '',
            discount: '',
            expiry: ''
        });
        setReset(true);
    };

    useEffect(() => {
        resetPayload();
    }, []);

    const handleSubmit = useCallback(async () => {
        //console.log(payload)
        const invalids = validate(payload, setInvalidFields);
        if (invalids === 0) {
            dispatch(showModal({ isShowModal: true, modalChildren: <Loading /> }));
            const response = await apiCreateNewCoupon(payload);
            dispatch(showModal({ isShowModal: false, modalChildren: null }));
            if (response.success) {
                enqueueSnackbar(response.message, { variant: 'success' });
            } else {
                enqueueSnackbar(response.message, { variant: 'error' });
            }
        }
    }, [payload]);

    return (
        <div className={clsx('w-full mr-[245px] md:min-h-screen md:flex md:items-center md:justify-center')}>
            <div className='p-8 flex flex-col items-center rounded-md w-full min-h-screen gap-3 z-40'>
                <h1 className='text-[28px] text-left w-full font-semibold text-main my-4 border-b border-gray-500'>
                    COUPON CREATE FORM
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
                    value={payload.discount}
                    setValue={setPayload}
                    nameKey='discount'
                    invalidFields={invalidFields}
                    setInvalidFields={setInvalidFields}
                    fullWidth
                />
                <InputField
                    value={payload.expiry}
                    setValue={setPayload}
                    nameKey='expiry'
                    invalidFields={invalidFields}
                    setInvalidFields={setInvalidFields}
                    fullWidth
                />
                <div className='w-full flex items-center justify-end rdlative'>
                    <Button handleOnclick={handleSubmit}>
                        Create new coupon
                    </Button>
                </div>

            </div>
        </div>
    );
};

export default CreateCounpon;
