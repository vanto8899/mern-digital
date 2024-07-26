import React, { useCallback, useEffect, useState } from 'react';
import { InputField, InputSelect, Pagination, ProductCustom } from 'components';
import { apiGetProducts } from 'apis';
import Masonry from 'react-masonry-css';
import { useLocation, useNavigate, useSearchParams, createSearchParams } from 'react-router-dom';
import useDebounce from 'hooks/useDebounce';
import { FaShoppingCart } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { showCart } from 'store/app/appSlice';
import withBaseComponent from 'hocs/withBaseComponent';
import { sorts } from 'utils/contants';

const breakpointColumnsObj = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1
};

const CreateOrder = ({ dispatch }) => {
    const [products, setProducts] = useState(null);
    const [sort, setSort] = useState('');
    const [queries, setQueries] = useState({
        q: ''
    });
    const navigate = useNavigate();
    const location = useLocation();
    const [params, setParams] = useSearchParams();
    const { current } = useSelector(state => state.user)

    const [cartItemCount, setCartItemCount] = useState(0);

    // Get all products
    const fetchProductsByCategory = async (params) => {
        const response = await apiGetProducts({ ...params, limit: process.env.REACT_APP_PRODUCT_LIMIT });
        if (response.success) {
            setProducts(response);
        }
    };

    //
    useEffect(() => {
        setCartItemCount(current?.cart?.length || 0);
    }, [current]);

    const queriesDebounce = useDebounce(queries.q, 800);
    // Searching product
    useEffect(() => {
        if (queriesDebounce) {
            navigate({
                pathname: location.pathname,
                search: createSearchParams({ q: queriesDebounce }).toString()
            });
        } else {
            navigate({ pathname: location.pathname });
        }
    }, [queriesDebounce]);

    useEffect(() => {
        const queryObject = Object.fromEntries([...params]);
        fetchProductsByCategory(queryObject);
    }, [params]);

    const changeValue = useCallback((value) => {
        setSort(value);
    }, [sort]);

    // Filter product
    useEffect(() => {
        if (sort) {
            setParams({ ...params, sort });
            navigate({
                pathname: location.pathname,
                search: createSearchParams({ sort }).toString()
            });
        }
    }, [sort]);

    useEffect(() => {
        const selectedPage = parseInt(params.get('page')) || 1;
        // Lưu trạng thái trang đã chọn vào tham số truy vấn
        const updatedParams = new URLSearchParams(params);
        updatedParams.set('page', selectedPage.toString());
        navigate({ search: `?${updatedParams.toString()}` });
    }, [params]);

    return (
        <div className="w-full h-full">
            {/* Tiêu đề và ô tìm kiếm */}
            <div className="w-full py-3 bg-gray-100 flex flex-col md:flex-row gap-4 justify-center items-center">
                <div className="w-[80%] mt-4 flex justify-center py-4 md:py-0 md:justify-start md:ml-0 md:w-[475px]">
                    <InputField
                        nameKey="q"
                        value={queries.q}
                        setValue={setQueries}
                        style="w-full"
                        placeholder="Search product..."
                        isHideLabel
                        fullWidth
                    />
                </div>
                <div className="w-[80%] mt-4 flex justify-center py-4 md:py-0 md:justify-start md:ml-0 md:w-[200px]">
                    <InputSelect
                        value={sort}
                        options={sorts}
                        changeValue={changeValue}
                    />
                </div>
                {current &&
                    <div className='relative rounded-full p-3 border-2 border-gray-200 cursor-pointer'
                        onClick={() => dispatch(showCart())}
                    >
                        <FaShoppingCart size={42} />
                        {cartItemCount >= 0 && (
                            <span className='absolute top-2 right-2 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center'>
                                {cartItemCount}
                            </span>
                        )}
                    </div>}
            </div>

            {/* Sản phẩm hiển thị */}
            <div className="w-[90%] md:w-full mt-8 md:mx-auto">
                <Masonry
                    breakpointCols={breakpointColumnsObj}
                    className="my-masonry-grid"
                    columnClassName="my-masonry-grid_column"
                >
                    {products?.products?.map((el) => (
                        <ProductCustom
                            key={el._id}
                            pid={el._id}
                            productData={el}
                            normal={false}
                            isNew={true} />
                    ))}
                </Masonry>
            </div>

            {/* Phân trang */}
            <div className="w-full m-auto my-4 flex flex-col p-4 md:flex-row md:justify-between">
                <Pagination totalCount={products?.counts} />
            </div>

            {/* Khoảng trống */}
            <div className="h-[20px] w-full"></div>
        </div>

    );
};

export default withBaseComponent(CreateOrder) 