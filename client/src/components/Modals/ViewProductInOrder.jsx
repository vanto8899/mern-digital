import { apiGetProductInOrder } from "apis";
import { enqueueSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { ImBin } from "react-icons/im";
import { formatMoney } from "utils/helpers";

const ViewProductInOrder = ({ productId }) => {
  const [orderlist, setOrderlist] = useState([]);

  const fetchOrderlist = async () => {
    try {
      const response = await apiGetProductInOrder(productId);
      if (response.success && response.orderDetails) {
        //console.log(orderlist)
        setOrderlist(response.orderDetails);
      } else {
        console.error("Failed to fetch wishlist or wishlist is empty");
      }
    } catch (error) {
      console.error("Error fetching wishlist: ", error);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchOrderlist();
    }
  }, [productId]);

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="w-full md:min-h-0 rounded-lg"
    >
      <header className="w-full border-b bg-main p-6 font-semibold text-white text-3xl flex justify-between items-center py-4">
        Detailed list of Orders included Product
      </header>
      <div className="w-full overflow-x-auto mb-4 md:overflow-visible">
        {orderlist.length > 0 ? (
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border px-4 py-2">Order Code</th>
                <th className="border px-4 py-2">Order ID</th>
                <th className="border px-4 py-2">Product Quantity</th>
              </tr>
            </thead>
            <tbody>
              {orderlist.map((el) => (
                <tr key={el._id} className="bg-white">
                  <td className="border p-2 text-center">{el.orderCode}</td>
                  <td className="border p-2 text-center">{el.orderId}</td>
                  <td className="border p-2 text-center">{el.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center w-full my-4">There is no Order available</p>
        )}
      </div>
    </div>

  );
};

export default ViewProductInOrder
