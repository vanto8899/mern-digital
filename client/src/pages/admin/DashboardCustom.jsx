import React, { useEffect, useState } from 'react';
import { BsFillArchiveFill, BsFillGrid3X3GapFill, BsPeopleFill, BsCartPlusFill } from 'react-icons/bs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, Cell } from 'recharts';
import 'components/Dashboards/DashboardCSS.css';
import { apiGetAllUser, apiGetCategories, apiGetOrders, apiGetProductNoLimit } from 'apis';
import moment from 'moment';
import { formatMoney } from 'utils/helpers';
import { FaHandHoldingUsd } from 'react-icons/fa';

const DashboardCustom = () => {
    const [orders, setOrders] = useState(null);
    const [newOrders, setNewOrders] = useState(null);
    const [users, setUsers] = useState(null);
    const [products, setProducts] = useState(null);
    const [productCategories, setProductCategories] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [chartOrderData, setChartOrderData] = useState([]);
    const [chartUserData, setChartUserData] = useState([]);
    const [chartSumOfTotal, setChartSumOfTotal] = useState([])

    // Function to format money
    const formatMoneyForChart = (amount) => {
        return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
    };

    // Fetch order data
    const fetchOrderData = async () => {
        try {
            const response = await apiGetOrders();
            if (response.success) setOrders(response?.orders);
            const orders = response.orders || [];
            const orderCounts = orders.reduce((acc, order) => {
                const date = moment(order?.createdAt).format('DD MM');
                acc[date] = (acc[date] || 0) + 1;
                return acc;
            }, {});

            const revenueCounts = orders.reduce((acc, order) => {
                const date = moment(order?.createdAt).format('DD MM');
                acc[date] = (acc[date] || 0) + order.total;
                return acc;
            }, {});


            const pastWeekDates = Array.from({ length: 7 }, (_, i) =>
                moment().subtract(i, 'days').format('DD MM')
            ).reverse();

            const data = pastWeekDates.map(date => ({
                date,
                orders: orderCounts[date] || 0
            }));

            const revenueData = pastWeekDates.map(date => ({
                date,
                revenue: revenueCounts[date] || 0
            }));

            setChartOrderData(data);
            setChartSumOfTotal(revenueData);
        } catch (error) {
            console.error('Error fetching order data', error);
        }
    };
    // Calculate the total revenue
    const totalRevenue = orders?.reduce((acc, order) => acc + order.total, 0) || 0;

    // Fetch user data
    const fetchUserData = async () => {
        try {
            const response = await apiGetAllUser();
            if (response.success) setUsers(response?.users);
            const users = response.users || [];

            const userCounts = users.reduce((acc, user) => {
                const date = moment(user?.createdAt).format('DD MM');
                acc[date] = (acc[date] || 0) + 1;
                return acc;
            }, {});

            const pastWeekDates = Array.from({ length: 7 }, (_, i) =>
                moment().subtract(i, 'days').format('DD MM')
            ).reverse();

            const data = pastWeekDates.map(date => ({
                date,
                users: userCounts[date] || 0
            }));
            setChartUserData(data);
        } catch (error) {
            console.error('Error fetching user data', error);
        }
    };

    // Fetch product data
    const fetchProducts = async () => {
        try {
            const response = await apiGetProductNoLimit();
            if (response.success) setProducts(response?.products);
            const products = response.products || [];

            const categoryCounts = products.reduce((acc, product) => {
                const category = product?.category;
                acc[category] = (acc[category] || 0) + product.quantity;
                return acc;
            }, {});

            const soldCounts = products.reduce((acc, product) => {
                const category = product?.category;
                acc[category] = (acc[category] || 0) + product.sold;
                return acc;
            }, {});

            const categories = Object.keys(categoryCounts);
            const quantities = Object.values(categoryCounts);
            //
            const soldPercentages = categories.map(category =>
                ((soldCounts[category] || 0) / categoryCounts[category] * 100).toFixed(2)
            );

            const statistics = categories.map((category, index) => ({
                name: category,
                sold: soldCounts[category] || 0, // Total sold
                totalQuantity: quantities[index] || 0, // Total quantity
            }));

            setChartData(statistics);
        } catch (error) {
            console.error('Error fetching product data', error);
        }
    };

    // Fetch product categories data
    const fetchProductCategories = async () => {
        try {
            const response = await apiGetCategories();
            if (response.success) setProductCategories(response?.productCategory);
        } catch (error) {
            console.error('Error fetching product categories data', error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            await fetchOrderData();
            await fetchUserData();
            await fetchProducts();
            await fetchProductCategories();
        };
        fetchData();
    }, []);

    // Fetch 7 new orders
    const fetchLatestOrderData = async () => {
        const response = await apiGetOrders({ sort: '-createdAt', limit: 7 });
        if (response.success) setNewOrders(response?.orders);
    }
    useEffect(() => {
        fetchLatestOrderData()
    }, [])

    // Combined data for linecharts
    const combinedData = chartOrderData.map((orderData, index) => ({
        date: orderData.date,
        orders: orderData.orders,
        users: chartUserData[index]?.users || 0
    }));

    return (
        <main className='main-container mr-[200px] overflow-y-auto md:overflow-y-visible w-full md:mr-0'>
            <div className='main-title font-semibold text-3xl p-4 text-main border-b border-gray-500'>
                <h3>Dashboards</h3>
            </div>
            <div className='main-cards'>
                <div className='card hover:scale-105 hover:bg-blue-700'>
                    <div className='card-inner'>
                        <h3>PRODUCTS</h3>
                        <BsFillArchiveFill className='card_icon' />
                    </div>
                    <h1 className='font-semibold text-[22px]'>{products?.length}</h1>
                </div>
                <div className='card hover:scale-105 hover:bg-orange-700'>
                    <div className='card-inner'>
                        <h3>CATEGORIES</h3>
                        <BsFillGrid3X3GapFill className='card_icon' />
                    </div>
                    <h1 className='font-semibold text-[22px]'>{productCategories?.length}</h1>
                </div>
                <div className='card hover:scale-105 hover:bg-green-800'>
                    <div className='card-inner'>
                        <h3>CUSTOMERS</h3>
                        <BsPeopleFill className='card_icon' />
                    </div>
                    <h1 className='font-semibold text-[22px]'>{users?.length}</h1>
                </div>
                <div className='card hover:scale-105 hover:bg-red-800'>
                    <div className='card-inner'>
                        <h3>ORDERS</h3>
                        <BsCartPlusFill className='card_icon' />
                    </div>
                    <h1 className='font-semibold text-[22px]'>{orders?.length}</h1>
                </div>
                <div className='card hover:scale-105 hover:bg-blue-950'>
                    <div className='card-inner'>
                        <h3>REVENUE</h3>
                        <FaHandHoldingUsd className='card_icon' />
                    </div>
                    <h1 className='font-semibold text-[22px] text-yellow-500'>{formatMoneyForChart(totalRevenue)}</h1>
                </div>
            </div>
            <div className='charts'>
                {/* Title for BarChart */}
                <div className='flex flex-col gap-1'>
                    <h3 className='font-semibold text-xl text-main py-2'>PRODUCT SALES BY CATEGORY</h3>
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart width={500} height={400} data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 10 }}>
                            <CartesianGrid strokeDasharray="3 3"
                                stroke="#ffffff" // Darker color for grid lines
                                strokeWidth={1} // Thicker grid lines 
                            />
                            <XAxis dataKey="name" tick={{ angle: -45, textAnchor: 'end' }} />
                            <YAxis tickCount={5} /> {/* Ensure YAxis has all necessary props */}
                            <Tooltip />
                            <Legend
                                wrapperStyle={{
                                    paddingTop: '50px', // Adjust this value to move the legend down
                                }} />
                            <Bar dataKey="sold" fill="#8884d8" />
                            <Bar dataKey="totalQuantity" fill="#82ca9d" />
                            {/* <text x={220} y={15} fill="black" textAnchor="middle" dominantBaseline="central">
                            PRODUCT SALES BY CATEGORY
                        </text> */}
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                {/* LineChart */}
                <div className='flex flex-col gap-1'>
                    <h3 className='font-semibold text-xl text-main py-2'>UERS & ORDERS OVER LAST 7 DAYS</h3>
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart
                            data={combinedData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 10 }}
                        >
                            <CartesianGrid strokeDasharray="3 3"
                                stroke="#ffffff" // Darker color for grid lines
                                strokeWidth={1} // Thicker grid lines 
                            />
                            <XAxis dataKey="date" tick={{ angle: -45, textAnchor: 'end' }} />
                            <YAxis tickCount={5} /> {/* Ensure YAxis has all necessary props */}
                            <Tooltip />
                            <Legend wrapperStyle={{
                                paddingTop: '50px', // Adjust this value to move the legend down
                            }} />
                            <Line type="monotone" dataKey="orders" stroke="#8884d8" name="Orders" />
                            <Line type="monotone" dataKey="users" stroke="#82ca9d" name="Users" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                {/* Title for BarChart */}
                <div className='flex flex-col gap-1'>
                    <h3 className='font-semibold text-xl text-main py-2'>REVENUE OVER 7 DAYS</h3>
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart
                            width={500}
                            height={400}
                            data={chartSumOfTotal}
                            margin={{ top: 5, right: 30, left: 20, bottom: 10 }}
                            layout="vertical" // Set to vertical for horizontal bars
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" strokeWidth={1} />
                            <XAxis type="number" tickFormatter={(value) => formatMoneyForChart(value)} />
                            <YAxis dataKey="date" type="category" />
                            <Tooltip formatter={(value) => formatMoneyForChart(value)} />
                            <Legend wrapperStyle={{ paddingTop: '50px' }} />
                            <Bar dataKey="revenue" fill="#133052">
                                {chartSumOfTotal.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#FFBB28" : "#FF8042"} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div className='chart mb-[30px] mt-[1000px] md:mt-[100px]'>
                <div className='main-title font-semibold text-xl text-main py-4'>
                    <h3>THE RECENT 7 ORDERS</h3>
                </div>
                <div className="overflow-auto md:w-full">
                    <table className="table-auto w-full overflow-x-auto">
                        <thead>
                            <tr className="border border-gray-400 text-white">
                                <th className="text-center py-2 min-w-[40px] bg-[#8884d8] border">No.</th>
                                <th className="text-center py-2 min-w-[175px] bg-[#82ca9d] border">Order Code</th>
                                <th className="text-center py-2 min-w-[175px] bg-[#8884d8] border">User Email</th>
                                <th className="text-center py-2 min-w-[100px] bg-[#82ca9d] border">Name</th>
                                <th className="text-center py-2 min-w-[125px] bg-[#8884d8] border">Phone</th>
                                <th className="text-center py-2 min-w-[175px] bg-[#82ca9d] border">Shipping Destination</th>
                                <th className="text-center py-2 min-w-[175px] bg-[#8884d8] border">Message</th>
                                <th className="text-center py-2 min-w-[125px] bg-[#82ca9d] border">Order Status</th>
                                <th className="text-center py-2 min-w-[140px] bg-[#8884d8] border">Payment Status</th>
                                <th className="text-center py-2 min-w-[100px] bg-[#82ca9d] border">Created At</th>
                                <th className="text-center py-2 min-w-[175px] bg-[#8884d8] border">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {newOrders?.map((el, idx) => (
                                <tr key={el._id} className="border-b border-gray-400 text-gray-500">
                                    <td className="text-center py-2 text-no-wrap border ">{idx + 1}</td>
                                    <td className="text-center py-2 text-no-wrap border">{el.orderCode}</td>
                                    <td className="text-center py-2 text-no-wrap border">{el.email}</td>
                                    <td className="text-center py-2 text-no-wrap border">{el.name}</td>
                                    <td className="text-center py-2 text-no-wrap border">{el.mobile}</td>
                                    <td className="text-center py-2 text-no-wrap border">{el.address}</td>
                                    <td className="text-center py-2 text-no-wrap border">{el.message}</td>
                                    <td className="text-center py-2 text-no-wrap border">{el.status}</td>
                                    <td className="text-center py-2 text-no-wrap border">{el.paymentStatus}</td>
                                    <td className="text-center py-2 text-no-wrap border">
                                        {moment(el.createdAt)?.format('DD/MM/YYYY')}
                                    </td>
                                    <td className="text-center py-2 text-no-wrap border">{formatMoney(el.total) + " VND"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    );
};

export default DashboardCustom;
