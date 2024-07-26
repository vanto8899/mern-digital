import React, { memo } from 'react'
import icons from 'utils/icons'

const { MdEmail, FaLocationDot, FaPhoneAlt } = icons

const Footer = () => {
    return (
        <div className='w-full flex flex-col'>
            <div className='flex items-center h-auto pl-5 md:justify-center md:w-full md:h-[103px] bg-main py-[20px] md:p-5'>
                <div className='flex flex-col w-[80%] md:flex-row md:items-center md:justify-between md:w-main'>
                    <div className='flex flex-col flex-1 mb-4 md:mb-0'>
                        <span className='text-[20px] text-gray-100'>SIGN UP TO NEWSLETTER</span>
                        <small className='text-[13px] text-gray-300'>Subscribe now and receive weekly newsletter</small>
                    </div>
                    <div className='flex-1 flex items-center w-full'>
                        <input
                            type='text'
                            className='p-4 pr-0 rounded-l-full w-full bg-[#F04646] text-gray-100 outline-none custom-outline-none 
                            placeholder:text-sm placeholder:text-gray-200 placeholder:italic placeholder:opacity-50 border-none'
                            placeholder='email address'
                        />
                        <div className='h-[56px] w-[56px] bg-[#F04646] rounded-r-full flex items-center justify-center text-white'>
                            <MdEmail size={18} />
                        </div>
                    </div>
                </div>
            </div>

            <div className='h-auto bg-gray-900 flex text-white text-[13px] md:p-5 md:justify-center md:h-[250px] md:items-center md:w-full'>
                <div className='w-[80%] flex flex-col p-5 md:flex-row md:p-0 md:w-main'>
                    <div className='flex-2 flex flex-col gap-2'>
                        <h3 className='mb-[20px] text-[15px] font-medium border-l-2 border-main pl-[15px]'>ABOUT US</h3>
                        <span className='flex'>
                            <span className='flex items-center'>
                                <FaLocationDot size={10} />
                                <span className='ml-1'>Address:</span>
                            </span>
                            <span className='opacity-70 ml-1'>474 Ontario St Toronto, ON M4X 1M7 Canada</span>
                        </span>
                        <span className='flex items-center'>
                            <FaPhoneAlt />
                            <span className='ml-1'>Phone: </span>
                            <span className='opacity-70 ml-1'>(+1234)56789xxx</span>
                        </span>
                        <span className='flex items-center'>
                            <MdEmail />
                            <span className='ml-1'>Mail: </span>
                            <span className='opacity-70 ml-1'>tadathemes@gmail.com</span>
                        </span>
                    </div>
                    <div className='flex-1 flex flex-col gap-2'>
                        <h3 className='mb-[20px] text-[15px] font-medium border-l-2 border-main pl-[15px] mt-[20px] md:mt-0'>INFORMATION</h3>
                        <span className='opacity-70'>Typography</span>
                        <span className='opacity-70'>Gallery</span>
                        <span className='opacity-70'>Store Location</span>
                        <span className='opacity-70'>Today's Deals</span>
                        <span className='opacity-70'>Contact</span>
                    </div>
                    <div className='flex-1 flex flex-col gap-2'>
                        <h3 className='mb-[20px] text-[15px] font-medium border-l-2 border-main pl-[15px] mt-[20px] md:mt-0'>WHO ARE YOU</h3>
                        <span className='opacity-70'>Help</span>
                        <span className='opacity-70'>Free Shipping</span>
                        <span className='opacity-70'>FAQs</span>
                        <span className='opacity-70'>Return & Exchange</span>
                        <span className='opacity-70'>Testimonials</span>
                    </div>
                    <div className='flex-1 flex flex-col gap-2'>
                        <h3 className='mb-[20px] text-[15px] font-medium border-l-2 border-main pl-[15px] mt-[20px] md:mt-0'>#DIGITALWORLDSTORE</h3>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default memo(Footer)