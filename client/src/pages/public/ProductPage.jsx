import React, { useEffect, useState } from 'react';
import { InputField, Pagination, LoadingProductComponent } from 'components';
import Product from 'components/Products/Product'
import { apiGetProducts } from 'apis';
import Masonry from 'react-masonry-css';
import { useLocation, useNavigate, useSearchParams, createSearchParams } from 'react-router-dom';
import useDebounce from 'hooks/useDebounce';

// Define breakpoint columns for the Masonry layout
const breakpointColumnsObj = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1
};

const ProductPage = () => {
    const [products, setProducts] = useState(null); // State to hold fetched products
    const [queries, setQueries] = useState({ q: '' }); // State to hold query parameters
    const navigate = useNavigate(); // Hook to navigate programmatically
    const location = useLocation(); // Hook to get current location
    const [params] = useSearchParams(); // Hook to get search parameters

    // Function to fetch products based on query parameters
    const fetchProductsByCategory = async (params) => {
        const response = await apiGetProducts({ ...params, limit: process.env.REACT_APP_PRODUCT_LIMIT });
        if (response.success) {
            setProducts(response); // Update state with fetched products
        }
    };

    // Debounce the search query to limit API calls
    const queriesDebounce = useDebounce(queries.q, 800);

    // Effect to update URL with search query when it changes
    useEffect(() => {
        if (queriesDebounce) {
            navigate({
                pathname: location.pathname,
                search: createSearchParams({ q: queriesDebounce }).toString()
            });
        } else {
            navigate({ pathname: location.pathname });
        }
    }, [queriesDebounce, navigate, location.pathname]);

    // Effect to fetch products whenever URL parameters change
    useEffect(() => {
        const queryObject = Object.fromEntries([...params]);
        fetchProductsByCategory(queryObject);
    }, [params]);

    // Effect to update the 'page' parameter in the URL when it changes
    useEffect(() => {
        const selectedPage = parseInt(params.get('page')) || 1;
        const updatedParams = new URLSearchParams(params);
        updatedParams.set('page', selectedPage.toString());
        navigate({ search: `?${updatedParams.toString()}` });
        //console.log(selectedPage)
    }, [params, navigate]);

    return (
        <div className="w-full">
            {/* Search section */}
            <div className="h-auto py-3 bg-gray-100 flex justify-center items-center">
                <div className="w-full md:w-main flex justify-between items-center px-4 md:px-0">
                    <h3 className="hidden mb-2 text-[18px] uppercase md:flex">All Products</h3>
                    <div className="flex w-full flex-col justify-center p-3 md:p-0 md:items-center md:flex-row md:w-[50%]">
                        <h3 className="mb-2 flex items-center justify-center text-[18px] uppercase md:w-[24%] md:flex md:justify-end">
                            Search product :
                        </h3>
                        <div className="flex justify-center py-4 md:flex md:justify-start md:ml-0 md:w-[76%]">
                            <InputField
                                nameKey="q"
                                value={queries.q}
                                setValue={setQueries}
                                style="w-full md:w-[475px]" // Adjust width as needed for smaller screens
                                placeholder="Search by title or category or color or brand"
                                isHideLabel
                                fullWidth
                            />
                        </div>
                    </div>
                </div>
            </div>
            {/* Products section */}
            {products === null ? (
                <LoadingProductComponent /> // Display loading component while products are being fetched
            ) : (
                <>
                    <div className="w-full md:w-main mt-8 mx-auto px-4 md:px-0">
                        <Masonry
                            breakpointCols={breakpointColumnsObj}
                            className="my-masonry-grid pr-5 md:pr-0"
                            columnClassName="my-masonry-grid_column"
                        >
                            {products?.products?.map((el) => (
                                <Product key={el._id} pid={el._id} productData={el} normal={true} />
                            ))}
                        </Masonry>
                    </div>
                    <div className="w-full md:w-main mx-auto my-4 flex justify-center md:justify-between px-4 md:px-0">
                        <Pagination totalCount={products?.counts} />
                    </div>
                </>
            )}
            <div className="h-[50px] w-full"></div>
        </div>
    );
};

export default ProductPage;
