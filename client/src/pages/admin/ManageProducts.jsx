import React, { useCallback, useEffect, useState } from 'react'
import { InputForm, Pagination, ViewProductInOrder } from 'components'
import CustomizeVarriant from 'components/Products/CustomizeVarriant'
import { useForm } from 'react-hook-form'
import { apiDeleteProduct, apiGetProducts } from 'apis'
import moment from 'moment'
import { useSearchParams, createSearchParams, useNavigate, useLocation } from 'react-router-dom'
import useDebounce from 'hooks/useDebounce'
import UpdateProduct from './UpdateProduct'
import Swal from 'sweetalert2'
import { toast } from 'react-toastify'
import icons from 'utils/icons'
import { colors } from 'utils/contants'
import { IoClose } from 'react-icons/io5'
import { GoEye, GoEyeClosed } from 'react-icons/go'

const { FaEdit, MdOutlineAutoDelete, MdOutlineDomainAdd } = icons

const ManageProducts = () => {
    const { register, formState: { errors }, watch, reset, setValue } = useForm()
    const navigate = useNavigate()
    const location = useLocation()
    const [products, setProducts] = useState([])
    const [counts, setCounts] = useState(0)
    const [params] = useSearchParams()
    const [editProduct, setEditProduct] = useState(null)
    const [update, setUpdate] = useState(false)
    const [customizeVarriant, setCustomizeVarriant] = useState(null)
    const [animation, setAnimation] = useState('animate-side-right')
    const [priceFromDisplay, setPriceFromDisplay] = useState('');
    const [priceToDisplay, setPriceToDisplay] = useState('');
    const [isViewProductInOrder, setIsViewProductInOrder] = useState(false)
    const [isViewing, setIsViewing] = useState(false);
    const [productId, setProductId] = useState(null);

    // Toggle the update state to trigger a re-render
    const render = useCallback(() => {
        setUpdate(!update)
    })

    // Fetch products from the API based on the provided parameters
    const fetchProducts = async (params) => {
        const response = await apiGetProducts({ ...params, limit: process.env.REACT_APP_PRODUCT_LIMIT })
        if (response.success) {
            setCounts(response.counts)
            setProducts(response.products)
        }
    }

    // Debounce the search query input to avoid frequent API calls
    const queryDebounce = useDebounce(watch('q'), 1000)

    // Update the URL search parameters and fetch products when filters change
    useEffect(() => {
        const queryParams = {
            q: watch('q') || '',
            category: watch('category') || '',
            totalRatings: watch('totalRatings') || '',
            'price[gte]': watch('priceFrom') || '',
            'price[lte]': watch('priceTo') || '',
            color: watch('color') || ''
        }

        // Remove empty values from queryParams
        Object.keys(queryParams).forEach(key => {
            if (!queryParams[key]) {
                delete queryParams[key]
            }
        })

        const paramsString = createSearchParams(queryParams).toString()
        navigate({
            pathname: location.pathname,
            search: paramsString
        })
    }, [queryDebounce, watch('category'), watch('totalRatings'), watch('priceFrom'), watch('priceTo'), watch('color')])

    // Fetch products whenever the URL parameters or the update state change
    useEffect(() => {
        const searchParams = Object.fromEntries([...params])
        fetchProducts({ ...searchParams })
    }, [params, update])

    // Handle product deletion with a confirmation dialog
    const handleDeleteProduct = (pid) => {
        Swal.fire({
            title: "Product Deleting...",
            text: "Do you want to remove this product?",
            icon: 'warning',
            showCancelButton: true,
        }).then(async (rs) => {
            if (rs.isConfirmed) {
                try {
                    const response = await apiDeleteProduct(pid);

                    if (response.success) {
                        render(); // Refresh or update the UI accordingly
                        toast.success(response.message); // Show success message
                    } else {
                        toast.error(response.message); // Show error message
                    }
                } catch (error) {
                    const errorMessage = error.response?.data?.message || error.message || "Error deleting user!";
                    toast.error(errorMessage);
                }
            }
        })
    }

    // Calculate the starting index of the items on the current page
    const currentPage = parseInt(params.get("page")) || 1
    const limit = parseInt(process.env.REACT_APP_PRODUCT_LIMIT)
    const itemIndex = (currentPage - 1) * limit

    // Close the edit or customize variant component with an animation
    const closeComponent = () => {
        setAnimation('animate-side-left')
        setTimeout(() => {
            setEditProduct(null)
            setCustomizeVarriant(null)
            setAnimation('animate-side-right')
        }, 500)
    }

    // Reset filters
    const resetFilters = () => {
        reset({
            q: '',
            category: '',
            totalRatings: '',
            priceFrom: '',
            priceTo: '',
            color: ''
        })
        navigate({
            pathname: location.pathname,
            search: ''
        })
    }

    // Format input price with commas
    const formatNumberWithCommas = (value) => {
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    // Handle price change and formatting
    const handlePriceChange = (e, fieldName) => {
        const value = e.target.value.replace(/,/g, ''); // Remove existing commas
        const formattedValue = formatNumberWithCommas(value);
        if (fieldName === 'priceFrom') {
            setPriceFromDisplay(formattedValue);
        } else {
            setPriceToDisplay(formattedValue);
        }
        setValue(fieldName, value); // Set the value without commas in the form state
    };

    // Create sort table column
    const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });
    const sortedProducts = [...products].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
    });

    // Handle sort column click
    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    // function product in order view
    const handleViewProductInOrder = (pid) => {
        setIsViewing(true)
        setProductId(pid)
        setIsViewProductInOrder(true);
    };

    // Effect to update the 'page' parameter in the URL when it changes

    return (
        <>
            <div className='w-full flex flex-col gap-4 relative overflow-x-auto'>
                {/* Component for updating a product */}
                {editProduct &&
                    <div className={`absolute inset-0 min-h-screen ${animation} bg-gray-50 z-40`}>
                        <UpdateProduct
                            editProduct={editProduct}
                            render={render}
                            setEditProduct={closeComponent}
                        />
                    </div>}
                {/* Component for customizing a product variant */}
                {customizeVarriant &&
                    <div className={`absolute inset-0 min-h-screen ${animation} bg-gray-50 z-40`}>
                        <CustomizeVarriant
                            customizeVarriant={customizeVarriant}
                            render={render}
                            setCustomizeVarriant={closeComponent}
                        />
                    </div>}

                {/* Top padding for the fixed header */}
                <div className='h-[70px] w-full'></div>
                <div className='text-main p-4 border-b border-gray-400 w-full bg-gray-100 flex justify-between items-center fixed top-0'>
                    <h1 className='text-3xl font-bold tracking-tight'>Manage Products</h1>
                </div>
                <div className='flex w-full justify-center md:justify-start items-center px-4'>
                    <form className='w-full md:w-[60%]'>
                        <InputForm
                            id="q"
                            register={register}
                            errors={errors}
                            fullWidth
                            placeholder="Search by title, category, color, brand,..."
                        />
                        <div className='flex justify-between items-center gap-6'>
                            <select {...register("category")} className='w-full md:w-[45%]'>
                                <option value="">Select Category</option>
                                <option value="smartphone">Smartphone</option>
                                <option value="tablet">Tablet</option>
                                <option value="speaker">Speaker</option>
                                <option value="camera">Camera</option>
                                <option value="accessories">Accessories</option>
                                <option value="television">Television</option>
                                <option value="printer">Printer</option>
                            </select>
                            <select {...register("totalRatings")} className='w-full md:w-[45%]'>
                                <option value="">Select Total Ratings</option>
                                <option value="1">1+</option>
                                <option value="2">2+</option>
                                <option value="3">3+</option>
                                <option value="4">4+</option>
                                <option value="5">5+</option>
                            </select>
                            <select {...register("color")} className='w-full md:w-[45%]'>
                                <option value="">Select Color</option>
                                {colors.map(color => (
                                    <option key={color} value={color}>{color}</option>
                                ))}
                            </select>
                        </div>
                        <div className='w-full my-4 flex justify-between items-center gap-2'>
                            <div className='w-full flex flex-col gap-4'>
                                <input
                                    type="text"
                                    {...register("priceFrom")}
                                    placeholder="greater than Price ?"
                                    value={priceFromDisplay}
                                    onChange={(e) => handlePriceChange(e, 'priceFrom')}
                                    className='w-[80%]'
                                />
                                <input
                                    type="text"
                                    {...register("priceTo")}
                                    placeholder="less than Price ?"
                                    value={priceToDisplay}
                                    onChange={(e) => handlePriceChange(e, 'priceTo')}
                                    className='w-[80%]'
                                />
                            </div>
                            <button type="button"
                                onClick={e => {
                                    e.stopPropagation()
                                    resetFilters()
                                }}
                                className="w-[20%] bg-main text-white px-4 py-2 rounded-md hover:bg-red-700"
                            >
                                Reset Filters
                            </button>
                        </div>
                    </form>
                </div>
                <div className="w-[98%] max-h-[500px] md:pl-4 md:w-full md:max-h-[500px] overflow-auto">
                    <table className='table-auto w-full'>
                        <thead className='sticky top-0 border border-gray-50 bg-main z-30'>
                            <tr>
                                {['No.', 'Thumb', 'Title', 'Brand', 'Category', 'Price', 'Quantity', 'Sold', 'Color', 'Total Ratings', 'Varriants', 'Updated At', 'Actions'].map((header, index) => (
                                    <th
                                        key={index}
                                        className='text-center py-3 text-white cursor-pointer border border-gray-50'
                                        onClick={() => handleSort(header.toLowerCase().replace(/ /g, ''))}
                                    >
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {sortedProducts.map((el, idx) => (
                                <tr key={el._id} className='border border-gray-50'>
                                    <td className='text-center py-2 border border-gray-50'>{idx + 1 + itemIndex}</td>
                                    <td className='text-center p-2 border border-gray-50'>
                                        <img src={el.thumb} alt="thumb" className="w-12 h-12 object-cover" />
                                    </td>
                                    <td className='text-center py-2 border border-gray-50'>{el.title}</td>
                                    <td className='text-center py-2 border border-gray-50'>{el.brand}</td>
                                    <td className='text-center py-2 border border-gray-50'>{el.category}</td>
                                    <td className='text-center py-2 border border-gray-50'>{el.price}</td>
                                    <td className='text-center py-2 border border-gray-50'>{el.quantity}</td>
                                    <td className='text-center py-2 border border-gray-50'>{el.sold}</td>
                                    <td className='text-center py-2 border border-gray-50'>{el.color}</td>
                                    <td className='text-center py-2 border border-gray-50'>{el.totalRatings}</td>
                                    <td className='text-center py-2 border border-gray-50'>{el?.varriants.length || 0}</td>
                                    <td className='text-center py-2 border border-gray-50'>
                                        {moment(el.updatedAt).format("DD/MM/YYYY")}
                                    </td>
                                    <td className='text-center py-2 border border-gray-50'>
                                        <span className='flex items-center justify-center gap-4'>
                                            <span
                                                title='Add varriant'
                                                className='text-green-700 cursor-pointer transition-transform transform hover:scale-125 hover:text-green-500'
                                                onClick={() => setCustomizeVarriant(el)}
                                            >
                                                <MdOutlineDomainAdd size={20} />
                                            </span>
                                            <span
                                                title='Edit product'
                                                className='text-sky-600 cursor-pointer transition-transform transform hover:scale-125 hover:text-blue-500'
                                                onClick={() => setEditProduct(el)}
                                            >
                                                <FaEdit size={20} />
                                            </span>
                                            <span
                                                title='Delete product'
                                                className='text-orange-700 cursor-pointer transition-transform transform hover:scale-125 hover:text-orange-500'
                                                onClick={() => handleDeleteProduct(el._id)}
                                            >
                                                <MdOutlineAutoDelete size={20} />
                                            </span>
                                            <span
                                                title="View order"
                                                className="cursor-pointer transition-transform transform hover:scale-125"
                                                onClick={() => handleViewProductInOrder(el._id)}
                                            >
                                                {isViewing ? <GoEye size={24} color='blue' />
                                                    : <GoEyeClosed size={24} color='blue' />}
                                            </span>
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className='md:w-full flex justify-end my-8 px-4'>
                    <Pagination totalCount={counts} />
                </div>
            </div>
            {isViewProductInOrder &&
                <div
                    className='absolute min-h-screen top-0 left-0 right-0 bottom-0 bg-overlay z-50 flex flex-col justify-center items-center'
                >
                    <div
                        className='bg-white w-full animate-side-left md:ml-10 md:w-[40%] md:h-auto rounded-md relative'
                    >
                        <ViewProductInOrder productId={productId} />
                        <span
                            className='absolute top-3 right-3 p-1 text-white hover:rounded-ful hover:text-gray-700 cursor-pointer'
                            onClick={() => {
                                setIsViewProductInOrder(false);
                                setIsViewing(false);
                            }}
                        >
                            <IoClose size={24} />
                        </span>
                    </div>
                </div >}
        </>


    )
}

export default ManageProducts
