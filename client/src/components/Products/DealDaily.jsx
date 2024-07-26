import React, { useEffect, useState, memo } from 'react'
import icons from 'utils/icons'
import { apiGetProducts } from 'apis/product'
import { formatMoney, renderStarFromNumber, secondsToHms } from 'utils/helpers'
import { CountDown } from 'components'
import moment from 'moment'
import { useSelector } from 'react-redux'
import { getDealDaily } from 'store/products/productSlice'
import withBaseComponent from 'hocs/withBaseComponent'

const { AiFillStar, IoMenu } = icons
let idInterval

const DealDaily = ({ dispatch, navigate }) => {
    const [hour, setHour] = useState(0)
    const [minute, setMinute] = useState(0)
    const [second, setSecond] = useState(0)
    const [expiredTime, setExpiredTime] = useState(false)
    const { dealDaily } = useSelector(state => state.products)

    const fetchDealDaily = async () => {
        const response = await apiGetProducts({ sort: "-totalRatings", limit: 5 })
        console.log(response)
        if (response?.success) {
            const pr = response.products[Math.round(Math.random() * 5)]
            dispatch(getDealDaily({ data: pr, time: Date.now() + 24 * 60 * 60 * 1000 }))
        }
    }
    useEffect(() => {
        if (dealDaily?.time) {
            const deltaTime = dealDaily.time - Date.now();
            const { h, m, s } = secondsToHms(deltaTime);
            setHour(h);
            setMinute(m);
            setSecond(s);
        }
    }, [dealDaily]);


    // set countdown time to update deal daily
    useEffect(() => {
        idInterval && clearInterval(idInterval)
        if (moment(moment(dealDaily?.time).format("MM/DD/YYYY")).isBefore(moment())) fetchDealDaily()
    }, [expiredTime])

    useEffect(() => {
        const idInterval = setInterval(() => {
            if (second > 0) {
                setSecond((prev) => prev - 1);
            } else {
                if (minute > 0) {
                    setMinute((prev) => prev - 1);
                    setSecond(59);
                } else {
                    if (hour > 0) {
                        setHour((prev) => prev - 1);
                        setMinute(59);
                        setSecond(59);
                    } else {
                        clearInterval(idInterval);
                        setExpiredTime(true);
                    }
                }
            }
        }, 1000);
        return () => clearInterval(idInterval);
    }, [second, minute, hour]);

    if (expiredTime) {
        return <div>Deal expired</div>;
    }
    return (
        <div className='border w-full flex-auto p-3'>
            <div className='flex items-center justify-between p-4 w-full'>
                <span className='flex-1 flex justify-center'><AiFillStar size={20} color='#DD1111' /></span>
                <span className='flex-8 font-semibold text-[20px] flex justify-center text-gray-700'>DEAL DAILY</span>
                <span className='flex-1'></span>
            </div>
            <div className='w-full flex flex-col items-center pt-8 px-4 gap-2'>
                <img src={dealDaily?.data?.thumb ||
                    'https://png.pngtree.com/template/20220419/ourmid/pngtree-photo-coming-soon-abstract-admin-banner-image_1262901.jpg'}
                    alt='' className='w-full object-contain'
                />
                <span className='line-clamp-1 text-center'>{dealDaily?.data?.title}</span>
                <span className='flex h-4'>{renderStarFromNumber(dealDaily?.data?.totalRatings, 20)?.map((el, index) => (
                    <span key={index}>{el}</span>
                ))}</span>
                <span>{`${formatMoney(dealDaily?.data?.price)}`} VND</span>
            </div>
            <div className='px-4 mt-8'>
                <div className='flex justify-center gap-2 items-center mb-4'>
                    <CountDown unit={'Hours'} number={hour} />
                    <CountDown unit={'Minutes'} number={minute} />
                    <CountDown unit={'Seconds'} number={second} />
                </div>
                <button
                    className='flex gap-2 items-center justify-center w-full bg-main text-white font-medium p-2 cursor-pointer hover:bg-gray-800'
                    type='button'
                    onClick={() => navigate(`/${dealDaily?.data.category?.toLowerCase()}/${dealDaily?.data._id}/${dealDaily?.data.title}`)}
                >
                    <IoMenu size={20} />
                    <span>OPTIONS</span>
                </button>
            </div>
        </div>
    )
}

export default withBaseComponent(memo(DealDaily))