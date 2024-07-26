import React, { useCallback, useEffect, useState } from 'react';
import { InputField, InputSelect, Pagination, ProductCustom } from 'components';
import { apiGetProducts } from 'apis';
import Masonry from 'react-masonry-css';
import { useLocation, useNavigate, useSearchParams, createSearchParams } from 'react-router-dom';
import useDebounce from 'hooks/useDebounce';
import { useSelector } from 'react-redux';
import withBaseComponent from 'hocs/withBaseComponent';
import { sorts } from 'utils/contants';

const breakpointColumnsObj = {
    default: 2,
    1100: 2,
    700: 2,
    500: 1
};

const AddProduct = ({ dispatch, orderId, updateProductTrigger }) => {
    const [products, setProducts] = useState(null);
    const [sort, setSort] = useState('');
    const [queries, setQueries] = useState({
        q: ''
    });
    const navigate = useNavigate();
    const location = useLocation();
    const [params, setParams] = useSearchParams();
    const { current } = useSelector(state => state.user)

    // Get all products
    const fetchProductsByCategory = async (params) => {
        const response = await apiGetProducts({ ...params, limit: process.env.REACT_APP_PRODUCT_LIMIT });
        if (response.success) {
            setProducts(response);
        }
    };

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
    }, []);

    useEffect(() => {
        if (sort) {
            setParams(prevParams => ({ ...prevParams, sort }));
            navigate({
                pathname: location.pathname,
                search: createSearchParams({ sort }).toString()
            });
        }
    }, [sort, setParams, navigate, location.pathname]);

    useEffect(() => {
        const selectedPage = parseInt(params.get('page')) || 1;
        // Lưu trạng thái trang đã chọn vào tham số truy vấn
        const updatedParams = new URLSearchParams(params);
        updatedParams.set('page', selectedPage.toString());
        navigate({ search: `?${updatedParams.toString()}` });
    }, [params, navigate]);

    return (
        <div className="w-full">
            {/* Tiêu đề và ô tìm kiếm */}
            <div className="w-full h-auto p-2 bg-gray-100 flex flex-col items-center md:flex-row md:gap-2 md:items-center md:justify-center">
                <div className="w-[95%] my-4 flex justify-center md:py-0 md:ml-0 md:w-[60%] md:items-center md:justify-center">
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
                <div className="w-[95%] my-4 flex justify-center md:py-0 md:ml-0 md:w-[40%] md:items-center md:justify-center">
                    <InputSelect
                        value={sort}
                        options={sorts}
                        changeValue={changeValue}
                    />
                </div>
            </div>

            {/* Sản phẩm hiển thị */}
            <div className="w-[80%] md:w-full md:m-auto md:mt-8 md:pr-2">
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
                            isNew={true}
                            orderId={orderId}
                            updateProductTrigger={updateProductTrigger}
                        />
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

export default withBaseComponent(AddProduct) 