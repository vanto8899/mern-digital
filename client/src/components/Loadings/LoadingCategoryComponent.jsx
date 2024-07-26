import React from 'react';
import Lottie from 'lottie-react';
import loadingAnimation from 'assests/loading-animation-1.json'

const LoadingCategoryComponent = () => {
    return (
        <div className="w-full flex justify-center items-center h-screen">
            <Lottie animationData={loadingAnimation} loop autoplay size={10} />
        </div>
    );
};

export default LoadingCategoryComponent
