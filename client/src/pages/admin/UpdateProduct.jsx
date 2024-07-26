import { Button, InputForm, Loading, MakedownEditor, Select } from 'components'
import React, { useCallback, useEffect, useState, memo } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { getBase64, validate } from 'utils/helpers'
import { ImBin } from "react-icons/im";
import { apiUpdateProduct } from 'apis'
import { showModal } from 'store/app/appSlice'
import Swal from 'sweetalert2'

const UpdateProduct = ({ editProduct, render, setEditProduct }) => {
    const { categories } = useSelector(state => state.app);
    const dispatch = useDispatch();

    const { register, handleSubmit, formState: { errors }, reset, watch } = useForm();

    const [payload, setPayload] = useState({
        description: '',
        thumb: '',
        images: []
    });
    const [invalidFields, setInvalidFields] = useState([]);
    const [preview, setPreview] = useState({
        thumb: null,
        images: []
    });
    /* const [hoverElm, setHoverElm] = useState(null); */

    useEffect(() => {
        reset({
            title: editProduct?.title || '',
            price: editProduct?.price || '',
            quantity: editProduct?.quantity || '',
            color: editProduct?.color || '',
            category: editProduct?.category || '',
            brand: editProduct?.brand?.toLowerCase() || '',
            sold: editProduct?.sold || 0,
            totalRatings: editProduct?.totalRatings || 0,
        });
        setPayload({
            description: typeof editProduct?.description === 'object' ? editProduct?.description.join(',')
                : editProduct?.description
        });
        setPreview({
            thumb: editProduct?.thumb || '',
            images: editProduct?.images || []
        });
    }, [editProduct, reset]);

    const changeValue = useCallback((e) => {
        setPayload(e);
    }, [payload]);

    const handlePreviewThumb = async (file) => {
        const base64Thumb = await getBase64(file);
        setPreview(prev => ({ ...prev, thumb: base64Thumb }));
    };

    const handlePreviewImages = async (files) => {
        if (!files || !files.length) {
            toast.warning("No files selected!");
            return;
        }
        const imagesPreview = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file.type !== "image/png"
                && file.type !== "image/jpg"
                && file.type !== "image/jpeg"
                && file.type !== "image/webp") {
                toast.warning("Image file is not supported!");
                return;
            }
            const base64 = await getBase64(file);
            imagesPreview.push(base64);
        }
        setPreview(prev => ({ ...prev, images: imagesPreview }));
    };

    useEffect(() => {
        if (watch("thumb") instanceof FileList && watch('thumb').length > 0)
            handlePreviewThumb(watch('thumb')[0])
    }, [watch('thumb')]);

    useEffect(() => {
        if (watch("images") instanceof FileList && watch('images').length > 0)
            handlePreviewImages(watch('images'))
    }, [watch('images')]);

    const handleUpdateProduct = async (data) => {
        const invalids = validate(payload, setInvalidFields);
        if (invalids === 0) {
            if (data.category) {
                data.category = categories?.find(el => el.title === data.category)?.title;
            }
            const finalPayload = { ...data, ...payload };
            finalPayload.thumb = data?.thumb?.length === 0 ? preview.thumb : data.thumb[0];
            const formData = new FormData();
            for (let [key, value] of Object.entries(finalPayload)) {
                formData.append(key, value);
            }
            finalPayload.images = data.images?.length === 0 ? preview.images : data.images;
            for (let image of finalPayload.images) formData.append("images", image);
            dispatch(showModal({ isShowModal: true, modalChildren: <Loading /> }));
            const response = await apiUpdateProduct(formData, editProduct._id);
            dispatch(showModal({ isShowModal: false, modalChildren: null }));

            if (response.success) {
                render();
                setEditProduct(null);
                Swal.fire({
                    title: 'Success',
                    text: response.message,
                    icon: 'success',
                    confirmButtonText: 'OK'
                });
            } else {
                Swal.fire({
                    title: 'Error',
                    text: response.message,
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            }
        }
    };

    /* const handleRemoveImage = (name) => {
        const files = [...watch('images')];
        reset({
            images: files?.filter(el => el.name !== name)
        });
        if (preview.images?.some(el => el.name === name)) {
            setPreview(prev => ({ ...prev, images: prev.images?.filter(el => el.name !== name) }));
        }
    }; */

    return (
        <div className='w-full flex flex-col gap-4 relative'>
            <div className='h-[70px] w-full'></div>
            <div className='flex-col p-4 border-b border-gray-400 bg-gray-50 flex justify-between items-center fixed left-[-20px] md:flex-row md:left-[20px] right-0 top-5 md:top-0 z-10'>
                <h1 className='text-3xl font-bold tracking-tight text-main'>Update Products</h1>
                <span className='text-main px-4 py-2 hover:underline hover:text-white hover:bg-main hover:rounded-full cursor-pointer'
                    onClick={() => setEditProduct(null)}
                >
                    Cancel ?
                </span>
            </div>
            <div className='p-4 mt-8'>
                <form onSubmit={handleSubmit(handleUpdateProduct)}>
                    <div className='w-full'>
                        <InputForm
                            label='Name product'
                            register={register}
                            errors={errors}
                            id='title'
                            validate={{ required: 'This field is required' }}
                            fullWidth
                            placeholder='Name of new product'
                        />
                    </div>
                    <div className='w-full md:flex-row flex-col my-6 flex gap-4'>
                        <InputForm
                            label='Price'
                            register={register}
                            errors={errors}
                            id='price'
                            validate={{ required: 'This field is required' }}
                            style='flex-auto'
                            placeholder='Price of new product'
                            type='number'
                            fullWidth={true}
                        />
                        <InputForm
                            label='Quantity'
                            register={register}
                            errors={errors}
                            id='quantity'
                            validate={{ required: 'This field is required' }}
                            style='flex-auto'
                            placeholder='Quantity of new product'
                            type='number'
                            fullWidth={true}
                        />
                        <InputForm
                            label='Color'
                            register={register}
                            errors={errors}
                            id='color'
                            validate={{ required: 'This field is required' }}
                            style='flex-auto'
                            placeholder='Color of new product'
                            fullWidth={true}
                        />
                        <InputForm
                            label='Sold'
                            register={register}
                            errors={errors}
                            id='sold'
                            validate={{ required: 'This field is required' }}
                            style='flex-auto'
                            placeholder='Sold of new product'
                            type='number'
                            fullWidth={true}
                        />
                        <InputForm
                            label='Total Ratings'
                            register={register}
                            errors={errors}
                            id='totalRatings'
                            validate={{ required: 'This field is required' }}
                            style='flex-auto'
                            placeholder='Total ratings of new product'
                            type='number'
                            fullWidth={true}
                        />
                    </div>
                    <div className='w-full md:flex-row flex-col my-6 flex gap-4'>
                        <Select
                            label='Category'
                            fullWidth
                            style='flex-auto'
                            register={register}
                            errors={errors}
                            id="category"
                            options={categories?.map(el => ({ code: el.title, value: el.title }))}
                            validate={{ required: 'This field is required' }}
                        />
                        <Select
                            label='Brand (Optional)'
                            fullWidth
                            style='flex-auto'
                            register={register}
                            errors={errors}
                            id="brand"
                            options={categories?.find(el => el.title === watch('category'))
                                ?.brand.map(el => ({ code: el.toLowerCase(), value: el }))}
                        />
                    </div>
                    <div className='w-full'>
                        <MakedownEditor
                            label="Description"
                            name='description'
                            changeValue={changeValue}
                            invalidFields={invalidFields}
                            setInvalidFields={setInvalidFields}
                            value={payload.description}
                        />
                    </div>
                    <div className='flex flex-col gap-2 mt-8'>
                        <label htmlFor="thumb" className='font-semibold'>Upload thumb</label>
                        <input
                            type="file"
                            id="thumb"
                            {...register("thumb")}
                            className='w-[300px] border border-gray-300 rounded-md cursor-pointer p-2'
                        />
                        {errors.thumb && <small className='text-xs text-red-500'>{errors.thumb?.message}</small>}
                    </div>
                    {preview.thumb
                        && <div className='my-4'>
                            <img src={preview.thumb} alt="thumbnail" className='w-[200px] h-[230px] object-contain' />
                        </div>}
                    <div className='flex flex-col gap-2 mt-8'>
                        <label htmlFor="products" className='font-semibold'>Upload images of product</label>
                        <input
                            type="file"
                            id="products"
                            {...register("images")}
                            multiple
                            className='w-[300px] border border-gray-300 rounded-md cursor-pointer p-2'
                        />
                        {errors.images && <small className='text-xs text-red-500'>{errors.images?.message}</small>}
                    </div>
                    <div className='w-[40%] md:w-full'>
                        {preview.images.length > 0
                            && <div className='my-4 flex w-full gap-3 flex-wrap'>
                                {preview.images?.map((el, indx) => (
                                    <div key={el.name}
                                        className='w-fit relative'
                                    >
                                        <img src={el} alt="products" className='w-[200px] h-[230px] object-contain' />
                                    </div>
                                ))}
                            </div>}
                    </div>
                    <div className='my-6'>
                        <Button type='submit'>Update product</Button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default memo(UpdateProduct);
