import { Product } from "components";
import React from "react";
import { useSelector } from "react-redux";

const Wishlist = () => {
  const { current } = useSelector((state) => state.user);
  //console.log("current", current.wishlist);
  return (
    <div className="w-full relative px-4">
      <header className="text-3xl font-semibold py-4 px-2 border-b border-gray-300">
        Wishlisted Products
      </header>
      <div className="p-4 w-full mr-[200px] md:mr-0 flex flex-wrap gap-4">
        {current?.wishlist?.map((el) => (
          <div
            key={el._id}
            className="bg-white rounded-md w-[380px] md:w-[300px] drop-shadow flex flex-col py-2 gap-3"
          >
            <Product pid={el._id} productData={el} className="bg-white" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
