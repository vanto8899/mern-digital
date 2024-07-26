import React, { memo } from 'react';
import usePagination from '../../hooks/usePagination';
import PagiItem from './PagiItem';
import { useSearchParams } from 'react-router-dom';

const Pagination = ({ totalCount }) => {
    const [params] = useSearchParams();
    const currentPage = +params.get('page');
    const pagination = usePagination(totalCount, currentPage);
    const pageSize = +process.env.REACT_APP_PRODUCT_LIMIT || 10;

    const range = () => {
        const start = (currentPage - 1) * pageSize + 1;
        const end = Math.min(currentPage * pageSize, totalCount);
        return `${start} - ${end}`;
    };

    return (
        <div className='flex flex-col gap-2 w-full justify-start items-center md:justify-between md:gap-0 md:flex-row'>
            <div className='border p-2'>
                <span className='text-sm italic text-main'>
                    {`Show products ${range()} of ${totalCount}`}
                </span>
            </div>
            <div className='flex items-center gap-1'>
                {pagination?.map(el => (
                    <PagiItem key={el}>
                        {el}
                    </PagiItem>
                ))}
            </div>
        </div>
    );
};

export default memo(Pagination);
