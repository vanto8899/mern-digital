import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createSearchParams, useParams } from 'react-router-dom';
import { apiGetProductById, apiGetProducts, apiUpdateCart } from 'apis';
import { Breadcrumb, Button, SelectQuantity, ProductExtraItem } from 'components';
import ProductInformation from 'components/Products/ProductInformation'
import CustomSliderMobile from 'components/Common/CustomSliderMobile'
import Slider from 'react-slick';
import ReactImageMagnify from 'react-image-magnify';
import { formatMoney, formatPrice, renderStarFromNumber } from 'utils/helpers';
import { ProductExtraInformation } from 'utils/contants';
import DOMPurify from 'dompurify';
import clsx from 'clsx';
import { useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import { enqueueSnackbar } from 'notistack';
import { getCurrent } from 'store/users/asyncActions';
import withBaseComponent from 'hocs/withBaseComponent';
import path from 'utils/path';

const DetailProductPage = ({ isQuickView, data, location, dispatch, navigate }) => {
    const titleRef = useRef();
    const params = useParams();
    const { current } = useSelector(state => state.user);
    const [product, setProduct] = useState(null);
    const [currenImage, setCurrenImage] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [update, setUpdate] = useState(false);
    const [relatedProducts, setRelatedProducts] = useState(null);
    const [varriants, setVarriants] = useState(null);
    const [pid, setPid] = useState(null);
    const [category, setCategory] = useState(null);
    const [currentProduct, setCurrentProduct] = useState({
        title: '',
        thumb: '',
        images: [],
        price: '',
        color: ''
    });
    const [isAddToCartDisabled, setIsAddToCartDisabled] = useState(false);

    useEffect(() => {
        if (data) {
            setPid(data.pid);
            setCategory(data.category);
        } else if (params && params.pid) {
            setPid(params.pid);
            setCategory(params.category);
        }
    }, [data, params]);

    const fetchProductData = async () => {
        const response = await apiGetProductById(pid);
        if (response.success) {
            setProduct(response.productData);
            setCurrenImage(response.productData?.thumb);
        }
    };

    useEffect(() => {
        if (varriants && product) {
            const selectedVarriant = product?.varriants?.find(el => el.sku === varriants);
            if (selectedVarriant) {
                setCurrentProduct({
                    title: selectedVarriant.title,
                    color: selectedVarriant.color,
                    thumb: selectedVarriant.thumb,
                    images: selectedVarriant.images,
                    price: selectedVarriant.price,
                });
                setCurrenImage(selectedVarriant.thumb);
            } else {
                setCurrentProduct({
                    title: product?.title,
                    color: product?.color,
                    thumb: product?.thumb,
                    images: product?.images || [],
                    price: product?.price,
                });
            }
        }
    }, [varriants, product]);

    const fetchProducts = async () => {
        const response = await apiGetProducts({ category });
        if (response.success) setRelatedProducts(response.products);
    };

    useEffect(() => {
        if (pid) {
            fetchProductData();
            fetchProducts();
        }
        if (titleRef.current) {
            titleRef.current.scrollIntoView({ block: 'center' });
        }
    }, [pid]);

    const reRender = useCallback(() => {
        setUpdate(!update);
    }, [update]);

    useEffect(() => {
        if (pid) {
            fetchProductData();
        }
    }, [update]);

    // handle quantity select
    const handleQuantity = useCallback((number) => {
        if (number === '') {
            setQuantity('');
            setIsAddToCartDisabled(true);
            return;
        }
        if (!Number(number) || Number(number) < 1) {
            return;
        } else {
            setQuantity(number);
            setIsAddToCartDisabled(Number(number) > product?.quantity || product?.quantity === 0);
        }
    }, [quantity, product]);

    const handleChangeQuantity = useCallback((flag) => {
        if (product?.quantity === 0) {
            Swal.fire({
                title: 'Product is out of Stock',
                text: 'This product is currently out of stock. Please select another product!',
                icon: 'warning',
                confirmButtonText: 'OK'
            });
            setIsAddToCartDisabled(true);
            return;
        }

        if (flag === 'minus' && quantity === 1) return;

        if (flag === 'minus') {
            const newQuantity = +quantity - 1;
            setQuantity(newQuantity);
            setIsAddToCartDisabled(newQuantity > product?.quantity);
        }

        if (flag === 'plus') {
            const newQuantity = +quantity + 1;
            setQuantity(newQuantity);
            setIsAddToCartDisabled(newQuantity > product?.quantity);
            if (newQuantity > product?.quantity) {
                Swal.fire({
                    title: 'Product is out of Stock',
                    text: 'Quantity exceeds available stock. Please check the quantity or select another product!',
                    icon: 'warning',
                    confirmButtonText: 'OK'
                });
            }
        }
    }, [quantity, product]);

    // if quantity in stock = 0 
    useEffect(() => {
        if (product?.quantity === 0) {
            setIsAddToCartDisabled(true);
            Swal.fire({
                title: 'Product is out of Stock',
                text: 'This product is currently out of stock. Please select another product!',
                icon: 'warning',
                confirmButtonText: 'OK'
            });
        }
    }, [product]);

    // handle view image
    const handleClickImage = (e, el) => {
        e.stopPropagation();
        setCurrenImage(el);
    };

    // handle add to cart
    const handleAddToCart = async () => {
        if (!current) return Swal.fire({
            title: "Almost!...",
            text: "Please login first!",
            icon: "info",
            cancelButtonText: "Not now!",
            showCancelButton: true,
            confirmButtonText: "Go login->"
        }).then((rs) => {
            if (rs.isConfirmed) navigate({
                pathname: `/${path.LOGIN}`,
                search: createSearchParams({ redirect: location.pathname }).toString()
            });
        });
        const response = await apiUpdateCart({
            pid: pid,
            color: currentProduct?.color || product?.color,
            price: currentProduct?.price || product?.price,
            thumbnail: currentProduct?.thumb || product?.thumb,
            title: currentProduct?.title || product?.title,
            quantity
        });
        if (response.success) {
            enqueueSnackbar(response.message, { variant: 'success' });
            dispatch(getCurrent());
        } else enqueueSnackbar(response.message, { variant: 'error' });
    };

    var settings = {
        dots: false,
        infinite: false,
        speed: 500,
        slidesToShow: 3,
        slidesToScroll: 1
    };

    return (
        <div className={clsx('w-full')}>
            {!isQuickView &&
                <div className='h-[81px] bg-gray-100 flex justify-center items-center pl-3 md:pl-0'>
                    <div ref={titleRef} className='w-main'>
                        <h3 className='mb-2 font-semibold text-[18px]'>{currentProduct.title || product?.title}</h3>
                        <Breadcrumb title={currentProduct.title || product?.title} category={category} />
                    </div>
                </div>
            }
            <div className={clsx('bg-white mt-4 m-auto flex flex-col p-3 md:p-0 md:flex-row',
                isQuickView ? 'max-w-[1000px] gap-16 p-8 max-h-[100vh] overflow-y-auto' : 'w-full md:w-main')}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={clsx('flex flex-col gap-4 w-full md:w-2/5', isQuickView && 'w-1/2 p-4')}>
                    <div className='w-full h-[458px] border flex items-center md:w-[458px] md:pr-0'>
                        {/* zoom images */}
                        <ReactImageMagnify {...{
                            smallImage: {
                                alt: 'Product image',
                                isFluidWidth: true,
                                src: currenImage || currentProduct.thumb,
                                // Adding optional styling for the small image container
                                style: { width: '100%', height: 'auto' }
                            },
                            largeImage: {
                                src: currenImage || currentProduct.thumb,
                                width: 1200,
                                height: 1200
                            },
                            // Optional: Adding additional props for better UX
                            enlargedImageContainerStyle: { background: '#fff' },
                            enlargedImageContainerDimensions: {
                                width: '200%',
                                height: '150%'
                            }
                        }} />
                    </div>
                    <div className='w-full md:w-[458px] md:pr-0'>
                        <Slider className='images-slider' {...settings}>
                            {currentProduct?.images?.length === 0 && product?.images?.map(el => (
                                <div key={el} className='px-2'>
                                    <img
                                        src={el} alt='sub-product'
                                        className='h-[143px] w-[143px] border object-cover cursor-pointer'
                                        onClick={e => handleClickImage(e, el)}
                                    />
                                </div>
                            ))}
                            {currentProduct?.images?.length > 0 && currentProduct?.images?.map(el => (
                                <div key={el} className='px-2'>
                                    <img
                                        src={el} alt='sub-product'
                                        className='h-[143px] w-[143px] border object-cover cursor-pointer'
                                        onClick={e => handleClickImage(e, el)}
                                    />
                                </div>
                            ))}
                        </Slider>
                    </div>
                </div>
                <div className={clsx('flex flex-col gap-4 w-full md:w-3/5 pl-2', isQuickView && 'md:w-1/2 p-4')}>
                    <div className='flex items-center justify-between mt-2'>
                        <h2 className='text-[30px] font-semibold'>{`${formatMoney(formatPrice(currentProduct.price || product?.price))} VND`}</h2>
                        <span className='text-sm text-main pl-2'>{`In stock: ${product?.quantity} pieces`}</span>
                    </div>
                    <div className='flex items-center gap-1'>
                        {renderStarFromNumber(product?.totalRatings, 22)?.map((el, i) => (<span key={i}>{el}</span>))}
                        <span className='text-sm text-main italic'>{`(Sold: ${product?.sold} pieces)`}</span>
                    </div>
                    <ul className='text-sm text-gray-500 list-square pl-4'>
                        {product?.description?.length > 1 && product?.description?.map((el, i) => (<li key={i} className='leading-6'>{el}</li>))}
                        {product?.description?.length === 1
                            && <div className='text-sm line-clamp-[10] mb-8' dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product?.description[0]) }}></div>}
                    </ul>
                    <div className='my-4 flex gap-4'>
                        <span className='font-bold'>Color:</span>
                        <div className='flex flex-wrap gap-4 items-center w-full'>
                            <div className={clsx('flex items-center gap-2 p-2 border cursor-pointer', !varriants && "border-red-700")}
                                onClick={() => {
                                    setVarriants(null); // Clear the selected variant
                                    window.location.reload(); // Reload the page
                                }}
                            >
                                <img src={product?.thumb} alt="thumb" className='w-8 h-8 object-cover rounded-md' />
                                <span className='flex flex-col'>
                                    <span>{product?.color}</span>
                                    <span className='text-sm'>{product?.price}</span>
                                </span>
                            </div>
                            {product?.varriants?.map(el => (
                                <div key={el.sku} className={clsx('flex items-center gap-2 p-2 border cursor-pointer', varriants === el.sku && "border-red-700")}
                                    onClick={() => setVarriants(el.sku)}
                                >
                                    <img src={el.thumb} alt="thumb" className='w-8 h-8 object-cover rounded-md' />
                                    <span className='flex flex-col'>
                                        <span>{el.color}</span>
                                        <span className='text-sm'>{el.price}</span>
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className='flex flex-col gap-8'>
                        <div className='flex items-center gap-4 font-semibold'>
                            <h2 className=''>Quantity:</h2>
                            <SelectQuantity
                                quantity={quantity}
                                handleQuantity={handleQuantity}
                                handleChangeQuantity={handleChangeQuantity}
                                containerWidth="40%"
                                disabled={isAddToCartDisabled}
                            />
                        </div>
                        <Button handleOnclick={handleAddToCart} fw disabled={isAddToCartDisabled}>
                            ADD TO CART
                        </Button>
                    </div>
                </div>
                {!isQuickView &&
                    <div className='w-[93%] md:w-1/5 ml-4'>
                        {ProductExtraInformation.map(el => (
                            <ProductExtraItem
                                key={el.id}
                                title={el.title}
                                icon={el.icon}
                                sub={el.sub}
                            />
                        ))}
                    </div>}
            </div>
            {!isQuickView &&
                <div className='w-[95%] pl-[10px] md:w-main mt-8 md:mx-auto'>
                    <ProductInformation
                        totalRatings={product?.totalRatings}
                        ratings={product?.ratings}
                        nameProduct={product?.title}
                        pid={product?._id}
                        reRender={reRender}
                    />
                </div>}
            {!isQuickView &&
                <div className='md:block mt-8 mb-10 m-auto w-full md:w-main'>
                    <h3 className='text-[20px] font-semibold py-[15px] p-2 mb-4 border-b-4 border-main'>OTHER CUSTOMERS ALSO BUY:</h3>
                    <CustomSliderMobile products={relatedProducts} normal={true} />
                </div>}
        </div>
    );
};

export default withBaseComponent(DetailProductPage);
