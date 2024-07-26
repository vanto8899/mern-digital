import { apiGetUserById, apiRemoveWishlistById } from "apis";
import { enqueueSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { ImBin } from "react-icons/im";
import { formatMoney } from "utils/helpers";

const WishlistView = ({ userId }) => {
  const [wishlist, setWishlist] = useState([]);

  const fetchWishlist = async () => {
    try {
      const response = await apiGetUserById(userId);
      if (response.success && response.res.wishlist) {
        setWishlist(response.res.wishlist);
      } else {
        console.error("Failed to fetch wishlist or wishlist is empty");
      }
    } catch (error) {
      console.error("Error fetching wishlist: ", error);
    }
  };
  // function remove wishlish user
  const handleRemoveWishlist = async (userId, pid) => {
    const response = await apiRemoveWishlistById(userId, pid);
    if (response.success) {
      enqueueSnackbar(response.message, { variant: "success" });
      fetchWishlist();
    } else {
      enqueueSnackbar(response.message, { variant: "error" });
    }
  };

  useEffect(() => {
    if (userId) {
      fetchWishlist();
    }
  }, [userId]);

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="w-full md:min-h-0 rounded-lg"
    >
      <header className="border-b bg-main p-6 font-semibold text-white text-3xl flex justify-between items-center py-4">
        User's Wishlisted
      </header>
      <div className="w-full overflow-x-auto md:overflow-visible">
        {wishlist.length > 0 ? (
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border px-4 py-2">Image</th>
                <th className="border px-4 py-2">Name</th>
                <th className="border px-4 py-2">Color</th>
                <th className="border px-4 py-2">Price</th>
                <th className="border px-2 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {wishlist.map((el) => (
                <tr key={el._id} className="bg-white">
                  <td className="border px-4 py-2">
                    <img
                      src={el.thumb}
                      alt="thumb"
                      className="w-8 h-8 rounded-md object-cover"
                    />
                  </td>
                  <td className="border p-2 text-center">{el.title}</td>
                  <td className="border p-2 text-center">{el.color}</td>
                  <td className="border p-2 text-center">
                    {`${formatMoney(el?.price)}`} VND
                  </td>
                  <td className="border px-2 py-6 flex justify-center items-center">
                    <span
                      className="p-1 w-8 h-8 flex justify-center items-center hover:rounded-full hover:bg-main"
                      title="Remove"
                      onClick={() => handleRemoveWishlist(userId, el._id)}
                    >
                      <ImBin size={16} />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center w-full mt-4">No products in wishlist</p>
        )}
      </div>
    </div>
  );
};

export default WishlistView;
