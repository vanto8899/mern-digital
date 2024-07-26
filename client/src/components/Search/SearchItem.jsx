import React, { memo, useEffect, useState } from 'react'
import icons from '../../utils/icons'
import Swal from 'sweetalert2'
import { colors, ratings } from '../../utils/contants'
import { createSearchParams, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { apiGetProducts } from '../../apis'
import { formatMoney } from '../../utils/helpers'
import useDebounce from '../../hooks/useDebounce'
import { NumericFormat } from 'react-number-format';
import { AiFillStar } from 'react-icons/ai'

const { AiOutlineDown } = icons

const SearchItem = ({ name, activeClick, changeActiveFilter, type = 'checkbox' }) => {
    const [params] = useSearchParams()
    const [selected, setSelected] = useState([])
    const [highestPrice, setHighestPrice] = useState(null)
    const [price, setPrice] = useState({
        from: '',
        to: ''
    })
    const [totalRatings, setTotalRatings] = useState([]);
    const { category } = useParams()
    const navigate = useNavigate()

    useEffect(() => {
        const colorParam = params.get('color');
        if (colorParam) {
            const selectedColors = colorParam.split(',');
            setSelected(selectedColors);
        }
    }, [params]);

    useEffect(() => {
        const fromParam = params.get('from');
        const toParam = params.get('to');
        if (fromParam) setPrice(prev => ({ ...prev, from: fromParam }));
        if (toParam) setPrice(prev => ({ ...prev, to: toParam }));
    }, [params]);
    //  filter rating
    useEffect(() => {
        const ratingsParam = params.get('totalRatings');
        if (ratingsParam) setTotalRatings(ratingsParam.split(',').map(Number));
    }, [params]);

    const handleSelected = (e) => {
        const value = e.target.value;
        if (selected.includes(value)) {
            setSelected(prev => prev.filter(el => el !== value));
        } else {
            setSelected(prev => [...prev, value]);
        }
    }

    const handleRatingsSelected = (e) => {
        const value = Number(e.target.value);
        if (totalRatings.includes(value)) {
            setTotalRatings(prev => prev.filter(el => el !== value));
        } else {
            setTotalRatings(prev => [...prev, value]);
        }
    };

    // handle color filter
    useEffect(() => {
        let param = []
        for (let i of params.entries()) param?.push(i)
        const queries = {}
        for (let i of param) queries[i[0]] = i[1]
        if (selected.length > 0) {
            queries.color = selected.join(',')
            queries.page = 1
        } else delete queries.color
        navigate({
            pathname: `/${category}`,
            search: createSearchParams(queries).toString()
        })

    }, [selected])

    // handle ratings filter
    useEffect(() => {
        let param = []
        for (let i of params.entries()) param?.push(i)
        const queries = {}
        for (let i of param) queries[i[0]] = i[1]
        if (totalRatings.length > 0) {
            queries.totalRatings = totalRatings.join(',')
            queries.page = 1
        } else delete queries.totalRatings
        navigate({
            pathname: `/${category}`,
            search: createSearchParams(queries).toString()
        })

    }, [totalRatings])

    // Show highest price
    const fetchHighestPriceProduct = async () => {
        const response = await apiGetProducts({ sort: '-price', limit: 1 })
        if (response.success) setHighestPrice(response.products[0]?.price)
    }

    useEffect(() => {
        if (type === 'input') fetchHighestPriceProduct()

    }, [type])

    // validate price from < to
    const checkPrice = useDebounce(price, 2000)
    useEffect(() => {
        if (price.from !== '' && price.to !== '') {
            const fromPrice = Number(price.from.replace(/,/g, ''));
            const toPrice = Number(price.to.replace(/,/g, ''));
            if (fromPrice > toPrice) {
                Swal.fire({
                    title: 'Error!',
                    text: 'The "from" price cannot be greater than the "to" price.',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            }
        }
    }, [checkPrice]);

    const debouncePriceFrom = useDebounce(price.from, 1000)
    const debouncePriceTo = useDebounce(price.to, 1000)

    // filter price
    useEffect(() => {
        let param = []
        for (let i of params.entries()) param?.push(i)
        const queries = {}
        for (let i of param) queries[i[0]] = i[1]
        if (Number(price.from.replace(/,/g, '')) > 0) queries.from = price.from.replace(/,/g, '')
        else delete queries.from
        if (Number(price.to.replace(/,/g, '')) > 0) queries.to = price.to.replace(/,/g, '')
        else delete queries.to
        queries.page = 1
        navigate({
            pathname: `/${category}`,
            search: createSearchParams(queries).toString()
        })

    }, [debouncePriceFrom, debouncePriceTo])

    const getPriceCount = () => {
        return Object.values(price).filter(value => value).length;
    };

    return (
        <div className='py-3 px-4 cursor-pointer border text-sm relative text-gray-500 border-gray-600 flex justify-between items-center gap-4'
            onClick={() => changeActiveFilter(name)}
        >
            <div className='flex items-center gap-2'>
                <span className='capitalize'>{name}</span>
                {type === 'checkbox' && selected.length > 0 &&
                    <span className='px-1 flex items-center justify-center text-xs rounded-full bg-gray-300'>
                        {`${selected.length}`}
                    </span>
                }
                {type === 'input' && (price.to || price.from) &&
                    <span className='px-1 flex items-center justify-center text-xs rounded-full bg-gray-300'>
                        {getPriceCount()}
                    </span>
                }
                {type === 'select' && totalRatings.length > 0 &&
                    <span className='px-1 flex items-center justify-center text-xs rounded-full bg-gray-300'>
                        {totalRatings.length}
                    </span>
                }
            </div>
            <AiOutlineDown />
            {activeClick === name &&
                <div className="absolute z-10 top-[calc(100%+1px)] left-0 w-fit p-4 border text-sm bg-white min-w-[150px]">
                    {type === 'checkbox' &&
                        <div className=''>
                            <div className='p-4 items-center flex justify-between gap-8 border-b'>
                                <span className='whitespace-nowrap'>{`${selected.length} selected`}</span>
                                <span className='underline cursor-pointer hover:text-main'
                                    onClick={e => {
                                        e.stopPropagation()
                                        setSelected([])
                                        changeActiveFilter(null)
                                    }}
                                >Reset</span>
                            </div>
                            <div className='flex h-[300px] w-full md:w-[300px] flex-col gap-3 mt-4 overflow-y-scroll' onClick={e => e.stopPropagation()}>
                                {colors.map((el, i) => (
                                    <div key={i} className='flex items-center gap-4'>
                                        <input
                                            type="checkbox"
                                            className="w-5 h-5 text-gray-500 bg-gray-100 border-gray-400"
                                            value={el}
                                            onChange={handleSelected}
                                            id={el}
                                            checked={selected.includes(el)}
                                        />
                                        <label htmlFor={el} className='capitalize text-gray-700'>{el}</label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    }
                    {type === 'input' &&
                        <div onClick={e => { e.stopPropagation() }}>
                            <div className='p-4 items-center flex justify-between gap-8 border-b'>
                                <span className='whitespace-nowrap'>{`The highest price is ${formatMoney(highestPrice)} VND`}</span>
                                <span className='underline cursor-pointer hover:text-main'
                                    onClick={e => {
                                        e.stopPropagation()
                                        setPrice({ from: '', to: '' })
                                        changeActiveFilter(null)
                                    }}
                                >Reset</span>
                            </div>
                            <div className='flex flex-col md:flex-row items-center p-2 gap-2'>
                                <div className='flex items-center gap-2'>
                                    <label htmlFor="from">From</label>
                                    <NumericFormat
                                        className='form-input border-gray-300'
                                        id="from"
                                        value={price.from}
                                        onValueChange={(values) => {
                                            const { value } = values;
                                            setPrice(prev => ({ ...prev, from: value }));
                                        }}
                                        thousandSeparator={true}
                                        suffix={' VND'}
                                    />
                                </div>
                                <div className='flex items-center gap-2'>
                                    <label htmlFor="to">To</label>
                                    <NumericFormat
                                        className='form-input ml-4 border-gray-300'
                                        id="to"
                                        value={price.to}
                                        onValueChange={(values) => {
                                            const { value } = values;
                                            setPrice(prev => ({ ...prev, to: value }));
                                        }}
                                        thousandSeparator={true}
                                        suffix={' VND'}
                                    />
                                </div>
                            </div>
                        </div>
                    }
                    {type === 'select' &&
                        <div className=''>
                            <div className='p-4 items-center flex justify-between gap-8 border-b'>
                                <span className='whitespace-nowrap'>{totalRatings.length} selected</span>
                                <span className='underline cursor-pointer hover:text-main'
                                    onClick={e => {
                                        e.stopPropagation();
                                        setTotalRatings([]);
                                        changeActiveFilter(null);
                                    }}
                                >Reset</span>
                            </div>
                            <div className='flex flex-col gap-3 mt-4' onClick={e => e.stopPropagation()}>
                                {ratings.map((rating, index) => (
                                    <div key={index} className='flex items-center gap-3'>
                                        <input
                                            type="checkbox"
                                            className="w-5 h-5 text-gray-500 bg-gray-100 border-gray-400"
                                            value={rating.value}
                                            onChange={handleRatingsSelected}
                                            id={`rating-${rating.value}`}
                                            checked={totalRatings.includes(rating.value)}
                                        />
                                        <label htmlFor={`rating-${rating.value}`} className='flex items-center gap-1 capitalize text-gray-700'>
                                            <span>{rating.label}</span>
                                            {[...Array(rating.value)].map((_, idx) => (
                                                <AiFillStar key={idx} color='orange' size={18} />
                                            ))}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    }
                </div>
            }
        </div>
    )
}

export default memo(SearchItem)
