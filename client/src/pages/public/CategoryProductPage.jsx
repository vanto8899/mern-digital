import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Breadcrumb, InputSelect, LoadingCategoryComponent, Pagination, SearchItem } from 'components';
import Product from 'components/Products/Product'
import { apiGetProducts } from 'apis';
import Masonry from 'react-masonry-css';
import { sorts } from 'utils/contants';
import { useDispatch } from 'react-redux';

const breakpointColumnsObj = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1
};

const CategoryProductPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { category } = useParams();
    const [products, setProducts] = useState(null);
    const [activeClick, setActiveClick] = useState(null);
    const [sort, setSort] = useState('');
    const [params] = useSearchParams();
    const titleRef = useRef();

    // call api get product
    const fetchProductsByCategory = async (queries) => {
        const response = await apiGetProducts({ ...queries, category, limit: process.env.REACT_APP_PRODUCT_LIMIT });
        if (response.success) setProducts(response);
    };
    // Query multi parametters
    useEffect(() => {
        const queries = Object.fromEntries([...params]);
        let priceQueryObj = {};
        if (queries.from && queries.to) {
            priceQueryObj = {
                $and: [
                    { price: { gte: queries.from } },
                    { price: { lte: queries.to } }
                ]
            };
            delete queries.price;
        } else {
            if (queries.from) {
                queries.price = { gte: queries.from };
            }
            if (queries.to) {
                queries.price = { lte: queries.to };
            }
        }
        delete queries.from;
        delete queries.to;

        const q = { ...priceQueryObj, ...queries };
        fetchProductsByCategory(q);
        if (titleRef.current) {
            titleRef.current.scrollIntoView({ block: "center" });
        }
    }, [params]);

    const changeActiveFilter = useCallback((name) => {
        setActiveClick((prev) => (prev === name ? null : name));
    }, []);

    const changeValue = useCallback((value) => {
        setSort(value);
    }, []);

    // Filter sort
    useEffect(() => {
        if (sort) {
            const updatedParams = new URLSearchParams(params);
            updatedParams.set('sort', sort);
            navigate({
                pathname: `/${category}`,
                search: `?${updatedParams.toString()}`
            });
        }
    }, [sort, params, navigate, category]);

    // Effect to update the 'page' parameter in the URL when it changes
    useEffect(() => {
        const selectedPage = parseInt(params.get('page')) || 1;
        const updatedParams = new URLSearchParams(params);
        updatedParams.set('page', selectedPage.toString());
        navigate({ search: `?${updatedParams.toString()}` });
        //console.log(selectedPage)
    }, [params, navigate]);

    return (
        <div className='w-full'>
            <div ref={titleRef} className='h-[81px] bg-gray-100 flex justify-center items-center pl-3 md:pl-0'>
                <div className='w-full md:w-main'>
                    <h3 className='mb-2 font-semibold text-[18px] uppercase'>{category}</h3>
                    <Breadcrumb category={category} />
                </div>
            </div>
            <div className='w-full md:w-main border p-4 flex flex-col m-auto mt-8 md:flex-row md:justify-between gap-4'>
                <div className='w-full md:w-4/5 flex-auto flex flex-col gap-3'>
                    <span className='font-semibold text-sm'>Filter By</span>
                    <div className='w-full md:w-full flex flex-col md:flex-row gap-2'>
                        <SearchItem
                            name='price'
                            activeClick={activeClick}
                            changeActiveFilter={changeActiveFilter}
                            type='input'
                        />
                        <SearchItem
                            name='color'
                            activeClick={activeClick}
                            changeActiveFilter={changeActiveFilter}
                            type='checkbox'
                        />
                        <SearchItem
                            name='Ratings'
                            activeClick={activeClick}
                            changeActiveFilter={changeActiveFilter}
                            type='select'
                        />
                    </div>
                </div>
                <div className='w-full md:w-1/5 flex flex-col gap-3'>
                    <span className='font-semibold text-sm'>Sort By</span>
                    <div>
                        <InputSelect
                            value={sort}
                            options={sorts}
                            changeValue={changeValue}
                        />
                    </div>
                </div>
            </div>
            {products === null ? (
                <LoadingCategoryComponent /> // Hiển thị LoadingComponent khi products chưa được fetch
            ) : (
                <>
                    <div className='w-full md:w-main mt-8 mx-auto px-4 md:px-0'>
                        <Masonry
                            breakpointCols={breakpointColumnsObj}
                            className="my-masonry-grid pr-6 md:pr-0"
                            columnClassName="my-masonry-grid_column">
                            {products?.products?.map(el => (
                                <Product
                                    key={el._id}
                                    pid={el._id}
                                    productData={el}
                                    normal={true}
                                />
                            ))}
                        </Masonry>
                    </div>
                    <div className='w-full md:w-main mx-auto my-4 flex justify-center md:justify-between px-4 md:px-0'>
                        <Pagination totalCount={products?.counts} />
                    </div>
                </>
            )}
            <div className='h-[20px] w-full'></div>
        </div>
    );
};

export default CategoryProductPage;
