import React, { memo, useState } from 'react';
import { productInfoTabs } from 'utils/contants';
import { VoteBar, Button, Comment } from 'components';
import VoteOption from 'components/Vote/VoteOption'
import { renderStarFromNumber } from 'utils/helpers';
import { useDispatch, useSelector } from 'react-redux';
import { showModal } from 'store/app/appSlice';
import { apiRatings } from 'apis';
import Swal from 'sweetalert2';
import path from 'utils/path';
import { createSearchParams } from 'react-router-dom';
import withBaseComponent from 'hocs/withBaseComponent';

const ProductInformation = ({ totalRatings, ratings, nameProduct, pid, reRender, navigate, location }) => {
    const dispatch = useDispatch();
    const { isLoggedIn } = useSelector(state => state.user);
    const [activeTab, setActiveTab] = useState(1);
    const [payload, setPayload] = useState({
        comment: '',
        score: ''
    });

    const handleSubmitVoteOption = async ({ comment, score }) => {
        if (!comment || !pid || !score) {
            alert('Something went wrong for submission!');
            return;
        }
        await apiRatings({ star: score, comment, pid, updatedAt: Date.now() });
        dispatch(showModal({ isShowModal: false, modalChildren: null }));
        reRender();
    };

    const handleVoteNow = () => {
        if (!isLoggedIn) {
            Swal.fire({
                text: 'Login to vote!',
                cancelButtonText: 'Cancel',
                confirmButtonText: 'Go login!',
                showCancelButton: true,
                title: 'Oops!',
            }).then((rs) => {
                if (rs.isConfirmed) {
                    navigate({
                        pathname: `/${path.LOGIN}`,
                        search: createSearchParams({ redirect: location.pathname }).toString()
                    });
                }
            });
        } else {
            dispatch(showModal({
                isShowModal: true,
                modalChildren: <VoteOption nameProduct={nameProduct} handleSubmitVoteOption={handleSubmitVoteOption} />
            }));
        }
    };

    return (
        <div>
            <div className='flex items-center gap-1 relative bottom-[-1px]'>
                {productInfoTabs.map(el => (
                    <span
                        onClick={() => setActiveTab(el.id)}
                        key={el.id}
                        className={`py-2 px-[22px] cursor-pointer ${activeTab === +el.id ? 'bg-white border border-b-0' : 'bg-gray-200'}`}
                    >
                        {el.name}
                    </span>
                ))}
            </div>
            <div className='w-full md:w-main border p-4'>
                {productInfoTabs.some(el => el.id === activeTab)
                    && productInfoTabs.find(el => el.id === activeTab)?.content}
            </div>
            <div className='flex flex-col py-8 w-full md:w-main'>
                <span className='p-2 font-semibold text-main'>CUSTOMER REVIEWS:</span>
                <div className='flex border flex-col md:flex-row'>
                    <div className='md:flex-4 w-full pt-3 flex flex-col items-center justify-center gap-2'>
                        <span className='font-semibold text-3xl text-blue-800'>{`${totalRatings}/5`}</span>
                        <span className='flex items-center gap-1'>
                            {renderStarFromNumber(totalRatings, 20)?.map((el, index) => (
                                <span key={index}>{el}</span>
                            ))}
                        </span>
                        <span className='text-sm'>{`${ratings?.length} Reviewers and Commentators`}</span>
                    </div>
                    <div className='flex-6 p-4 flex flex-col gap-2'>
                        {Array.from(Array(5).keys()).reverse().map(el => (
                            <VoteBar
                                key={el}
                                number={el + 1}
                                ratingTotal={ratings?.length}
                                ratingCount={ratings?.filter(i => i.star === el + 1)?.length}
                            />
                        ))}
                    </div>
                </div>
                <div className='p-4 w-full flex flex-col items-center justify-center gap-2 text-sm'>
                    <span>Do you review this Product?</span>
                    <Button handleOnclick={handleVoteNow}>Vote here now!</Button>
                </div>
                <div className='flex flex-col gap-4'>
                    {ratings?.map(el => (
                        <Comment
                            key={el._id}
                            star={el.star}
                            updatedAt={el.updatedAt}
                            comment={el.comment}
                            name={`${el.postedBy?.lastname} ${el.postedBy?.firstname}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default withBaseComponent(memo(ProductInformation));
