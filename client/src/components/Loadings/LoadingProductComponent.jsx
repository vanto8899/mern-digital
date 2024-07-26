import React from 'react';
import Lottie from 'lottie-react';
import loadingAnimation from 'assests/loading-animation-2.json'

const LoadingProductComponent = () => {
    return (
        <div className="flex justify-center items-center h-screen">
            <Lottie animationData={loadingAnimation} loop autoplay />
        </div>
    );
};

export default LoadingProductComponent;
