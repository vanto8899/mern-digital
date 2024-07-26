import clsx from 'clsx';
import { Button, InputForm, Loading, MakedownEditor, Select } from 'components';
import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getBase64, validate } from 'utils/helpers';
import { ImBin } from "react-icons/im";
import { apiCreateProduct } from 'apis';
import { showModal } from 'store/app/appSlice';
import Swal from 'sweetalert2';

const CreateProducts = () => {
    const { categories } = useSelector(state => state.app); // Get categories from Redux state
    const dispatch = useDispatch();
    const { register, handleSubmit, formState: { errors }, reset, watch } = useForm(); // Initialize form handling
    const [payload, setPayload] = useState({ description: '' }); // State for additional payload data
    const [invalidFields, setInvalidFields] = useState([]); // State for invalid form fields
    const [preview, setPreview] = useState({ thumb: null, images: [] }); // State for image previews
    /*  const [hoverElm, setHoverElm] = useState(null); // State for hovered image element */

    const changeValue = useCallback((e) => {
        setPayload(e);
    }, [payload]);

    const handlePreviewThumb = async (file) => {
        const base64Thumb = await getBase64(file);
        setPreview(prev => ({ ...prev, thumb: base64Thumb }));
    };

    const handlePreviewImages = async (files) => {
        const imagesPreview = [];
        for (let file of files) {
            // Validate file type
            if (file.type !== "image/png" && file.type !== "image/jpg" && file.type !== "image/jpeg" && file.type !== "image/webp") {
                toast.warning("Image file is not supported!");
                return;
            }
            const base64 = await getBase64(file);
            imagesPreview.push({ name: file.name, path: base64 });
        }
        setPreview(prev => ({ ...prev, images: imagesPreview }));
    };

    // Watch for changes in 'thumb' input field
    useEffect(() => {
        handlePreviewThumb(watch('thumb')[0]);
    }, [watch('thumb')]);

    // Watch for changes in 'images' input field
    useEffect(() => {
        handlePreviewImages(watch('images'));
    }, [watch('images')]);

    const handleCreateProduct = async (data) => {
        const invalids = validate(payload, setInvalidFields);
        if (invalids === 0) {
            if (data.category) {
                const selectedCategory = categories?.find(el => el._id === data.category);
                if (selectedCategory) {
                    data.category = selectedCategory.title;
                }
            }
            const finalPayload = { ...data, ...payload };
            const formData = new FormData();
            for (let [key, value] of Object.entries(finalPayload)) {
                if (key === 'thumb' && value.length > 0) {
                    formData.append(key, value[0]);
                } else if (key === 'images' && value.length > 0) {
                    for (let image of value) {
                        formData.append(key, image);
                    }
                } else {
                    formData.append(key, value);
                }
            }
            // Scroll to the top of the page
            window.scrollTo({ top: 0, behavior: 'smooth' });

            dispatch(showModal({ isShowModal: true, modalChildren: <Loading /> }));
            const response = await apiCreateProduct(formData);
            dispatch(showModal({ isShowModal: false, modalChildren: null }));
            if (response.success) {
                reset();
                setPayload({ description: '' });
                setPreview({ thumb: null, images: [] });
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
    
        if (preview.images?.some(el => el.name === name))
            setPreview(prev => ({ ...prev, images: prev.images?.filter(el => el.name !== name) }));
    }; */

    return (
        <div className={clsx("w-full mr-[200px] overflow-x-auto")}>
            <h1 className='h-[75px] flex justify-between items-center text-3xl font-bold px-4 text-main bg-gray-100 border-b border-gray-500'>
                <span>Create New Product</span>
            </h1>
            <div className='p-4 mt-8'>
                <form onSubmit={handleSubmit(handleCreateProduct)}>
                    <div className='flex-col md:flex-row md:w-full'>
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
                    <div className='flex-col md:flex-row md:w-full my-6 flex gap-4'>
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
                    </div>
                    <div className='flex-col md:flex-row md:w-full my-6 flex gap-4'>
                        <Select
                            label='Category'
                            fullWidth
                            style='flex-auto'
                            register={register}
                            errors={errors}
                            id="category"
                            options={categories?.map(el => ({ code: el._id, value: el.title }))}
                            validate={{ required: 'This field is required' }}
                        />
                        <Select
                            label='Brand (Optional)'
                            fullWidth
                            style='flex-auto'
                            register={register}
                            errors={errors}
                            id="brand"
                            options={categories?.find(el => el._id === watch('category'))
                                ?.brand.map(el => ({ code: el, value: el }))}
                        />
                    </div>
                    <div className='md:w-full'>
                        <MakedownEditor
                            label="Description"
                            name='description'
                            changeValue={changeValue}
                            invalidFields={invalidFields}
                            setInvalidFields={setInvalidFields}
                        />
                    </div>
                    <div className='flex flex-col gap-2 mt-8'>
                        <label htmlFor="thumb" className='font-semibold'>Upload thumb</label>
                        <input
                            type="file"
                            id="thumb"
                            {...register("thumb", { required: "This field is required" })}
                            className='w-[300px] border border-gray-300 rounded-md cursor-pointer p-2'
                        />
                        {errors.thumb && <small className='text-xs text-red-500'>{errors.thumb?.message}</small>}
                    </div>
                    {preview.thumb && <div className='my-4'>
                        <img src={preview.thumb} alt="thumbnail" className='w-[200px] h-[230px] object-contain' />
                    </div>}
                    <div className='flex flex-col gap-2 mt-8'>
                        <label htmlFor="products" className='font-semibold'>Upload images of product</label>
                        <input
                            type="file"
                            id="products"
                            {...register("images", { required: "This field is required" })}
                            multiple
                            className='w-[300px] border border-gray-300 rounded-md cursor-pointer p-2'
                        />
                        {errors.images && <small className='text-xs text-red-500'>{errors.images?.message}</small>}
                    </div>
                    {preview.images.length > 0 && <div className='my-4 flex w-full gap-3 flex-wrap'>
                        {preview.images?.map((el, indx) => (
                            <div key={el.name}
                                className='w-fit relative'>
                                <img src={el.path} alt="products" className='w-[200px] h-[230px] object-contain' />
                            </div>
                        ))}
                    </div>}
                    <div className='my-6'>
                        <Button type='submit'>Create new product</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateProducts;
