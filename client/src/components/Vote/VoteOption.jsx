import React, { memo, useEffect, useRef, useState } from 'react';
import logo from 'assests/voteLogo.gif';
import { voteOptions } from 'utils/contants';
import icons from 'utils/icons';
import { Button } from 'components';

const { AiFillStar } = icons;

const VoteOption = ({ nameProduct, handleSubmitVoteOption }) => {
    const [chosenScore, setChosenScore] = useState(null);
    const [comment, setComment] = useState('');
    const [score, setScore] = useState(null);
    const modalRef = useRef();

    useEffect(() => {
        modalRef.current.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }, []);

    return (
        <div
            ref={modalRef}
            onClick={e => e.stopPropagation()}
            className="bg-red-50 w-full max-w-[600px] rounded-lg flex flex-col items-center justify-center gap-4 p-5 mx-4 sm:mx-0"
        >
            <img src={logo} alt="logo" className="w-[150px] object-contain" />
            <h2 className="text-center text-medium text-lg">{`Voting Product ${nameProduct}`}</h2>
            <textarea
                className="form-textarea w-full rounded-lg border-gray-300 placeholder:text-sm placeholder:text-gray-300 placeholder:italic placeholder:opacity-80"
                placeholder="Type something"
                value={comment}
                onChange={e => setComment(e.target.value)}
            ></textarea>
            <div className="w-full flex flex-col gap-4">
                <p>How do you like this product?</p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                    {voteOptions.map(el => (
                        <div
                            key={el.id}
                            className="w-[100px] bg-gray-200 hover:bg-gray-300 cursor-pointer rounded-md p-2 flex flex-col justify-center items-center gap-2"
                            onClick={() => {
                                setChosenScore(el.id);
                                setScore(el.id);
                            }}
                        >
                            {(Number(chosenScore && chosenScore) >= el.id) ? <AiFillStar color="orange" size={20} /> : <AiFillStar color="gray" size={20} />}
                            <span>{el.text}</span>
                        </div>
                    ))}
                </div>
            </div>
            <Button fw handleOnclick={() => handleSubmitVoteOption({ comment, score: chosenScore })}>
                Voting Submit
            </Button>
        </div>
    );
};

export default memo(VoteOption);
