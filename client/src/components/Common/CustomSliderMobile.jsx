import Product from 'components/Products/Product';
import React, { memo } from 'react';
import Slider from "react-slick";

var settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
        {
            breakpoint: 768,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1,
                infinite: false,
                dots: false
            }
        }
    ]
};

const CustomSliderMobile = ({ products, activedTab, normal, detail }) => {
    return (
        <>
            {products &&
                <Slider className='custom-slider' {...settings}>
                    {products?.map((el, index) => (
                        <div key={index} className="w-full md:w-auto">
                            <Product
                                pid={el._id}
                                productData={el}
                                isNew={activedTab === 1 ? false : true}
                                normal={normal}
                                detail={detail}
                            />
                        </div>
                    ))}
                </Slider>
            }
        </>
    );
}

export default memo(CustomSliderMobile);
