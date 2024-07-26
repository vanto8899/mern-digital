import React, { memo } from 'react';
import Slider from 'react-slick';
import banner1 from 'assests/banner-11.jpeg';
import banner2 from 'assests/banner-12.jpeg';
import banner3 from 'assests/banner-13.jpeg';
import banner4 from 'assests/banner-21.jpeg';
import banner5 from 'assests/banner-22.jpeg';
import banner6 from 'assests/banner-23.jpeg';


const Banner = () => {
    const banners = [banner1, banner2, banner3, banner4, banner5, banner6];

    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        arrows: true
    };

    return (
        <div className='w-full p-3 md:p-0 md:mb-1'>
            <Slider {...settings}>
                {banners.map((banner, index) => (
                    <div key={index}>
                        <img
                            src={banner}
                            alt={`banner-${index + 1}`}
                            className='w-full object-cover'
                            style={{ height: '360px' }}
                        />
                    </div>
                ))}
            </Slider>
        </div>
    );
};

export default memo(Banner);
