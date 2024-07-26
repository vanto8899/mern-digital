import React, { useEffect, useState } from 'react';
import { InputForm, Pagination } from 'components';
import { useForm } from 'react-hook-form';
import { apiGetProducts, apiGetUserById, apiUpdateCartByUserId } from 'apis';
import moment from 'moment';
import { useSearchParams, createSearchParams, useNavigate, useLocation } from 'react-router-dom';
import useDebounce from 'hooks/useDebounce';
import { FaPlus, FaCheck } from 'react-icons/fa';
import { enqueueSnackbar } from 'notistack';

const FilterProduct = ({ userId, triggerFetchOrder }) => {
    const { register, formState: { errors }, watch } = useForm();
    const navigate = useNavigate();
    const location = useLocation();
    const [products, setProducts] = useState(null); // State to store the fetched products
    const [counts, setCounts] = useState(0); // State to store the total number of products
    const [params] = useSearchParams(); // To manage URL search parameters
    const [update, setUpdate] = useState(false); // State to trigger re-fetching products
    const [userCurrentCart, setUserCurrentCart] = useState([]); // State to store the current user's cart
    const [addedProductIds, setAddedProductIds] = useState(new Set()); // State to track added product IDs

    // Function to fetch products based on given parameters
    const fetchProducts = async (params) => {
        const response = await apiGetProducts({ ...params, limit: process.env.REACT_APP_PRODUCT_LIMIT });
        if (response.success) {
            setCounts(response.counts);
            setProducts(response.products);
        }
    };

    // Function to fetch the current user's cart
    const fetchUserCurrentCart = async () => {
        try {
            const response = await apiGetUserById(userId);
            if (response.success && response.res.cart) {
                setUserCurrentCart(response.res.cart);
            } else {
                console.error("Failed to fetch cart or cart is empty");
            }
        } catch (error) {
            console.error("Error fetching cart: ", error);
        }
    };

    // Fetch user cart when userId changes
    useEffect(() => {
        if (userId) {
            fetchUserCurrentCart();
        }
    }, [userId]);

    const queryDebounce = useDebounce(watch('q'), 800); // Debounce search query input

    // Update URL search parameters when debounced query changes
    useEffect(() => {
        if (queryDebounce) {
            navigate({
                pathname: location.pathname,
                search: createSearchParams({ q: queryDebounce }).toString()
            });
        } else {
            navigate({ pathname: location.pathname });
        }
    }, [queryDebounce, navigate, location.pathname]);

    // Fetch products when URL parameters or update state changes
    useEffect(() => {
        const searchParams = Object.fromEntries([...params]);
        fetchProducts({ ...searchParams });
    }, [params, update]);

    // Function to handle adding a product to the cart
    const handleAddToCartOrder = async (userId, product) => {
        const productExists = userCurrentCart.some(cartItem => cartItem.pid === product._id);

        if (productExists) {
            enqueueSnackbar('Product is already in the cart', { variant: 'warning' });
            return;
        }

        const response = await apiUpdateCartByUserId(userId, {
            pid: product._id,
            color: product.color,
            price: product.price,
            thumbnail: product.thumb,
            title: product.title,
            quantity: 1
        });

        if (response.success) {
            enqueueSnackbar(response.message, { variant: 'success' });
            await fetchUserCurrentCart(); // Update the cart state
            setAddedProductIds((prevIds) => new Set(prevIds).add(product._id)); // Track added product ID
            triggerFetchOrder(); // Trigger order fetch
        } else {
            enqueueSnackbar(response.message, { variant: 'error' });
        }
    };

    const currentPage = parseInt(params.get("page")) || 1;
    const limit = parseInt(process.env.REACT_APP_PRODUCT_LIMIT);
    const itemIndex = (currentPage - 1) * limit; // Calculate item index for pagination

    return (
        <div className='w-full flex flex-col gap-4 relative'>
            <div className='h-[70px] w-full'></div>
            <div className='p-4 border-b border-gray-400 w-full bg-gray-100 flex justify-between items-center fixed top-0'>
                <h1 className='text-3xl font-bold tracking-tight'>Manage Products</h1>
            </div>
            <div className='flex w-full justify-start md:justify-end items-center px-4'>
                <form className='w-full md:w-[45%]'>
                    <InputForm
                        id="q"
                        register={register}
                        errors={errors}
                        fullWidth
                        placeholder="Find Product by title, category, color, brand,..."
                    />
                </form>
            </div>
            <div className="w-[98%] max-h-[500px] md:pl-4 md:w-full overflow-auto">
                <table className='table-auto md:w-main'>
                    <thead className='sticky top-0 border border-gray-50 bg-main z-30'>
                        <tr>
                            <th className='text-center py-3 text-white'>No.</th>
                            <th className='text-center py-3 text-white'>Thumb</th>
                            <th className='text-center py-3 text-white'>Title</th>
                            <th className='text-center py-3 text-white'>Brand</th>
                            <th className='text-center py-3 text-white'>Category</th>
                            <th className='text-center py-3 text-white'>Price</th>
                            <th className='text-center py-3 text-white'>Quantity</th>
                            <th className='text-center py-3 text-white'>Sold</th>
                            <th className='text-center py-3 text-white'>Color</th>
                            <th className='text-center py-3 text-white'>Total Ratings</th>
                            <th className='text-center py-3 text-white'>Variants</th>
                            <th className='text-center py-3 text-white'>Updated At</th>
                            <th className='text-center py-3 text-white'>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products?.map((el, idx) => {
                            const productInCart = userCurrentCart.some(cartItem => cartItem.pid === el._id);
                            const isProductAdded = addedProductIds.has(el._id); // Check if product is added
                            const isDisabled = el.quantity === 0; // Check if product quantity is 0
                            return (
                                <tr key={el._id} className={`border-b border-gray-400 ${isDisabled ? 'opacity-50' : ''}`}>
                                    <td className='text-center py-2'>{idx + 1 + itemIndex}</td>
                                    <td className='text-center py-2'>
                                        <img src={el.thumb} alt="thumb" className="w-12 h-12 object-cover" />
                                    </td>
                                    <td className='text-center py-2'>{el.title}</td>
                                    <td className='text-center py-2'>{el.brand}</td>
                                    <td className='text-center py-2'>{el.category}</td>
                                    <td className='text-center py-2'>{el.price}</td>
                                    <td className='text-center py-2'>{el.quantity}</td>
                                    <td className='text-center py-2'>{el.sold}</td>
                                    <td className='text-center py-2'>{el.color}</td>
                                    <td className='text-center py-2'>{el.totalRatings}</td>
                                    <td className='text-center py-2'>{el?.variants?.length || 0}</td>
                                    <td className='text-center py-2'>{moment(el.updatedAt).format("DD/MM/YYYY")}</td>
                                    <td className='text-center py-2'>
                                        <span className='flex items-center justify-center gap-4'>
                                            <span
                                                title='Add product'
                                                className={`cursor-pointer transition-transform transform hover:scale-125
                                                     ${productInCart || isProductAdded || isDisabled ? 'text-green-700' : 'hover:text-green-500'}`}
                                                onClick={() => !productInCart && !isDisabled && handleAddToCartOrder(userId, el)}
                                            >
                                                {productInCart || isProductAdded ? <FaCheck color='green' size={24} /> : <FaPlus color='green' size={24} />}
                                            </span>
                                        </span>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
            <div className='md:w-full flex justify-end my-8 px-4'>
                <Pagination totalCount={counts} />
            </div>
        </div>
    );
};

export default FilterProduct;
