import React, { memo } from 'react'
import clsx from 'clsx'
import { createSearchParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom'

const PagiItem = ({ children }) => {
    const [params] = useSearchParams()
    const navigate = useNavigate()
    const location = useLocation()

    const handlePagination = () => {
        const queries = Object.fromEntries([...params])
        if (Number(children)) queries.page = children
        navigate({
            pathname: location.pathname,
            search: createSearchParams(queries).toString()
        })
        // console.log(queries)
    }

    return (
        <button className={clsx('p-4 w-12 h-12 flex justify-center border',
            !Number(children)
            && 'items-end pb-2',
            Number(children)
            && 'items-center  bg-slate-100 hover:text-white hover:bg-red-400',
            +params.get('page') === +children && '!bg-main text-white',
            !+params.get('page') && +children === 1 && '!bg-main text-white')}
            onClick={handlePagination}
            type='button'
            disabled={!Number(children)}
        >
            {children}
        </button>
    )
}

export default memo(PagiItem)