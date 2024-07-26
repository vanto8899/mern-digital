import { apiAddVarriant } from 'apis';
import { Button, InputForm, Loading } from 'components';
import React, { memo, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { showModal } from 'store/app/appSlice';
import Swal from 'sweetalert2';
import { getBase64 } from 'utils/helpers';

const CustomizeVarriant = ({ customizeVarriant, setCustomizeVarriant }) => {
    // React Hook Form setup
    const { register, handleSubmit, formState: { errors }, reset, watch } = useForm();
    const [preview, setPreview] = useState({
        thumb: '',
        images: ''
    })
    const dispatch = useDispatch()
    useEffect(() => {
        reset({
            title: customizeVarriant?.title,
            price: customizeVarriant?.price,
            color: customizeVarriant?.color,

        })

    }, [customizeVarriant])

    const handleAddVarriant = async (data) => {
        if (data.color === customizeVarriant.color)
            Swal.fire('Oops!', 'Color need to change!', 'info')
        else {
            const formData = new FormData()
            for (let i of Object.entries(data)) {
                formData.append(i[0], i[1]);
            }
            if (data.thumb) formData.append('thumb', data.thumb[0])
            if (data.images) {
                for (let image of data.images) formData.append("images", image)
            }
            dispatch(showModal({ isShowModal: true, modalChildren: <Loading /> }));
            const response = await apiAddVarriant(formData, customizeVarriant._id);
            dispatch(showModal({ isShowModal: false, modalChildren: null }));
            if (response.success) {
                reset()
                setPreview({
                    thumb: '',
                    images: []
                })
                Swal.fire({
                    title: 'Success',
                    text: response.message,
                    icon: 'success',
                    confirmButtonText: 'OK'
                });
            } else
                Swal.fire({
                    title: 'Error',
                    text: response.message,
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
        }
    }

    // Function to handle thumbnail preview
    const handlePreviewThumb = async (file) => {
        const base64Thumb = await getBase64(file);
        setPreview(prev => ({ ...prev, thumb: base64Thumb }));
    };

    // Function to handle multiple images preview
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

    // Effect to watch for thumbnail changes and preview it
    useEffect(() => {
        if (watch("thumb") instanceof FileList && watch('thumb').length > 0)
            handlePreviewThumb(watch('thumb')[0])
    }, [watch('thumb')]);

    // Effect to watch for images changes and preview them
    useEffect(() => {
        if (watch("images") instanceof FileList && watch('images').length > 0)
            handlePreviewImages(watch('images'))
    }, [watch('images')]);

    return (
        <div className='w-full flex flex-col gap-4 relative'>
            <div className='h-[70px] w-full'></div>
            <div className='flex-col p-4 border-b border-gray-400 bg-gray-50 flex justify-between items-center fixed left-[-20px] md:flex-row md:left-[20px] right-0 top-5 md:top-0 z-10'>
                <h1 className='text-3xl font-bold tracking-tight text-main'>Customize varriants</h1>
                <span
                    className='text-blue-700 px-4 py-2 hover:underline hover:text-white hover:bg-main hover:rounded-full cursor-pointer'
                    onClick={() => setCustomizeVarriant(null)}
                >
                    Back to product list
                </span>
            </div>
            <form onSubmit={handleSubmit(handleAddVarriant)} className='mt-8 p-4 w-full flex flex-col gap-4'>
                <div className='w-full flex gap-4 items-center'>
                    <InputForm
                        label='Original name'
                        register={register}
                        errors={errors}
                        id='title'
                        fullWidth
                        validate={{ required: 'This field is required' }}
                        placeholder='Title of new varriant'
                        style="flex-auto"
                    />
                </div>
                <div className='flex flex-col w-full md:flex-row gap-4'>
                    <InputForm
                        label='Price varriant'
                        register={register}
                        errors={errors}
                        id='price'
                        validate={{ required: 'This field is required' }}
                        fullWidth
                        placeholder='Price of new varriant'
                        type='number'
                        style="flex-auto"
                    />
                    <InputForm
                        label='Color varriant'
                        register={register}
                        errors={errors}
                        id='color'
                        validate={{ required: 'This field is required' }}
                        fullWidth
                        placeholder='Color of new varriant'
                        style="flex-auto"
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
                {preview.thumb
                    && <div className='my-4'>
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
                <div className='w-[40%] md:w-full'>
                    {preview.images.length > 0
                        && <div className='my-4 flex w-full gap-3 flex-wrap'>
                            {preview.images?.map((el, indx) => (
                                <div key={indx}
                                    className='w-fit relative'
                                >
                                    <img src={el} alt="products" className='w-[200px] h-[230px] object-contain' />
                                </div>
                            ))}
                        </div>}
                </div>
                <div className='my-6'>
                    <Button type='submit'>Add varriants</Button>
                </div>
            </form>
        </div>
    );
}

export default memo(CustomizeVarriant);
