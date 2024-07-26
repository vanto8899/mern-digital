import {
    PayPalScriptProvider,
    PayPalButtons,
    usePayPalScriptReducer
} from "@paypal/react-paypal-js";
import { apiCreateOrder } from "apis";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const style = { "layout": "vertical" };

const ButtonWrapper = ({ currency, showSpinner, amount, payload, setIsSuccess }) => {
    const [{ isPending, options }, dispatch] = usePayPalScriptReducer();
    const navigate = useNavigate()
    useEffect(() => {
        dispatch({
            type: 'resetOptions',
            value: {
                ...options, currency: currency
            }
        });
    }, [currency, dispatch]);

    const handleSaveOrder = async () => {
        try {
            const response = await apiCreateOrder({ ...payload, status: "Succeed", paymentStatus: "Completed" });
            if (response.success) {
                setIsSuccess(true);
                setTimeout(() => {
                    Swal.fire("Congratulations!", "Your order was created!", "success").then(() => {
                        navigate("/");
                    });
                }, 500);
            } else {
                Swal.fire("Error", response.error || "An error occurred while creating your order", "error");
            }
        } catch (error) {
            Swal.fire("Error", error.response?.data?.error || error.message || "Please try again.", "error");
        }
    };

    return (
        <>
            {(showSpinner && isPending) && <div className="spinner" />}
            <PayPalButtons
                style={style}
                disabled={false}
                forceReRender={[style, currency, amount]}
                fundingSource={undefined}
                createOrder={(data, actions) => actions.order.create({
                    purchase_units: [
                        { amount: { currency_code: currency, value: amount } }
                    ]
                }).then(orderId => orderId)}
                onApprove={(data, actions) => actions.order.capture().then(async (response) => {
                    // check status payment then call create order
                    if (response.status === 'COMPLETED') {
                        handleSaveOrder()
                    }
                })}
            />
        </>
    );
};

export default function Paypal({ amount, payload, setIsSuccess }) {
    return (
        <div style={{ maxWidth: "750px", minHeight: "200px", margin: 'auto' }}>
            <PayPalScriptProvider options={{ clientId: "test", components: "buttons", currency: "USD" }}>
                <ButtonWrapper setIsSuccess={setIsSuccess} payload={payload} currency={'USD'} showSpinner={false} amount={amount} />
            </PayPalScriptProvider>
        </div>
    );
}
