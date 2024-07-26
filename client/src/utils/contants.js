import path from "./path";
import icons from "./icons";
import { RiCouponLine } from "react-icons/ri";
const {
  FaShieldAlt,
  FaTruck,
  FaGift,
  FaReply,
  FaTty,
  AiOutlineDashboard,
  MdGroups,
  TbBrandProducthunt,
  RiBillLine,
  FcLike,
} = icons;

export const navigation = [
  {
    id: 1,
    value: "HOME",
    path: `/${path.HOME}`,
  },
  {
    id: 2,
    value: "PRODUCTS",
    path: `/${path.PRODUCTS}`,
  },
  {
    id: 3,
    value: "BLOGS",
    path: `/${path.BLOGS}`,
  },
  {
    id: 4,
    value: "OUR SERVICES",
    path: `/${path.OUR_SERVICES}`,
  },
  { id: 5, value: "FAQs", path: `/${path.FAQ}` },
];

export const ProductExtraInformation = [
  {
    id: 1,
    title: "Guarantee",
    sub: "Quality Checked",
    icon: <FaShieldAlt />,
  },
  {
    id: 2,
    title: "Free Shipping",
    sub: "Free On All Products",
    icon: <FaTruck />,
  },
  {
    id: 3,
    title: "Special Gift Cards",
    sub: "Special Gift Cards",
    icon: <FaGift />,
  },
  {
    id: 4,
    title: "Free Return",
    sub: "Within 7 Days",
    icon: <FaReply />,
  },
  {
    id: 5,
    title: "Consultancy",
    sub: "Lifetime 24/7/356",
    icon: <FaTty />,
  },
];

export const productInfoTabs = [
  {
    id: 1,
    name: "DESCRIPTION",
    content: `Technology: GSM / CDMA / HSPA / EVDO / LTE
    Dimensions: 142.4 x 69.6 x 7.9 mm
    Weight: 152 g
    Display: Super AMOLED 5.1 inches
    Resolution: 1440 x 2560
    OS: Android 6.0 (Marshmallow)
    Chipset: Exynos 8890
    CPU: Quad-core
    Internal: 32 GB, 4 GB RAM
    Camera: 112 MP - 5 MP`,
  },
  {
    id: 2,
    name: "WARRANTY",
    content: `WARRANTY INFORMATION
    LIMITED WARRANTIES
    Limited Warranties are non-transferable. The following Limited Warranties are given to the original retail purchaser of the following Ashley Furniture Industries, Inc.Products:
    
    Frames Used In Upholstered and Leather Products
    Limited Lifetime Warranty
    A Limited Lifetime Warranty applies to all frames used in sofas, couches, love seats, upholstered chairs, ottomans, sectionals, and sleepers. Ashley Furniture Industries,Inc. warrants these components to you, the original retail purchaser, to be free from material manufacturing defects.`,
  },
  {
    id: 3,
    name: "DELIVERY",
    content: `PURCHASING & DELIVERY
    Before you make your purchase, it’s helpful to know the measurements of the area you plan to place the furniture. You should also measure any doorways and hallways through which the furniture will pass to get to its final destination.
    Picking up at the store
    Shopify Shop requires that all products are properly inspected BEFORE you take it home to insure there are no surprises. Our team is happy to open all packages and will assist in the inspection process. We will then reseal packages for safe transport. We encourage all customers to bring furniture pads or blankets to protect the items during transport as well as rope or tie downs. Shopify Shop will not be responsible for damage that occurs after leaving the store or during transit. It is the purchaser’s responsibility to make sure the correct items are picked up and in good condition.
    Delivery
    Customers are able to pick the next available delivery day that best fits their schedule. However, to route stops as efficiently as possible, Shopify Shop will provide the time frame. Customers will not be able to choose a time. You will be notified in advance of your scheduled time frame. Please make sure that a responsible adult (18 years or older) will be home at that time.
    In preparation for your delivery, please remove existing furniture, pictures, mirrors, accessories, etc. to prevent damages. Also insure that the area where you would like your furniture placed is clear of any old furniture and any other items that may obstruct the passageway of the delivery team. Shopify Shop will deliver, assemble, and set-up your new furniture purchase and remove all packing materials from your home. Our delivery crews are not permitted to move your existing furniture or other household items. Delivery personnel will attempt to deliver the purchased items in a safe and controlled manner but will not attempt to place furniture if they feel it will result in damage to the product or your home. Delivery personnel are unable to remove doors, hoist furniture or carry furniture up more than 3 flights of stairs. An elevator must be available for deliveries to the 4th floor and above.`,
  },
];

export const colors = [
  "black",
  "white",
  "red",
  "lime",
  "blue",
  "yellow",
  "cyan",
  "magenta",
  "silver",
  "gray",
  "brown",
  "olive",
  "green",
  "purple",
  "teal",
  "navy",
];

export const ratings = [
  { value: 1, label: "1" },
  { value: 2, label: "2" },
  { value: 3, label: "3" },
  { value: 4, label: "4" },
  { value: 5, label: "5" },
];

export const sorts = [
  {
    id: 1,
    value: "-sold",
    text: "Best selling",
  },
  {
    id: 2,
    value: "-title",
    text: "Alphabetically, A->Z",
  },
  {
    id: 3,
    value: "title",
    text: "Alphabetically, Z->A",
  },
  {
    id: 4,
    value: "-price",
    text: "Price, high->low",
  },
  {
    id: 5,
    value: "price",
    text: "Price, low->high",
  },
  {
    id: 6,
    value: "-createdAt",
    text: "Date, new->old",
  },
  {
    id: 7,
    value: "createdAt",
    text: "Date, old->new",
  },
  {
    id: 8,
    value: "-totalRatings",
    text: "Ratings, high->low",
  },
  {
    id: 9,
    value: "totalRatings",
    text: "Ratings, low->high",
  },
];

export const voteOptions = [
  {
    id: 1,
    text: "Very Bad",
  },
  {
    id: 2,
    text: "Bad",
  },
  {
    id: 3,
    text: "Neutral",
  },
  {
    id: 4,
    text: "Good",
  },
  {
    id: 5,
    text: "Perfect",
  },
];

export const adminSidebar = [
  {
    id: 1,
    type: "SINGLE",
    text: "Dashboard",
    path: `/${path.ADMIN}/${path.DASHBOARD}`,
    icon: <AiOutlineDashboard size={20} />,
  },
  {
    id: 2,
    type: "PARENT",
    text: "Manage Users",
    icon: <MdGroups size={20} />,
    submenu: [
      {
        text: "Create New User",
        path: `/${path.ADMIN}/${path.ADD_NEW_USER}`,
      },
      {
        text: "Manage User",
        path: `/${path.ADMIN}/${path.MANAGE_USER}`,
      },
    ],
  },
  {
    id: 3,
    type: "PARENT",
    text: "Manage Products",
    icon: <TbBrandProducthunt size={20} />,
    submenu: [
      {
        text: "Create Product",
        path: `/${path.ADMIN}/${path.CREATE_PRODUCTS}`,
      },
      {
        text: "Manage Product",
        path: `/${path.ADMIN}/${path.MANAGE_PRODUCTS}`,
      },
    ],
  },
  {
    id: 4,
    type: "PARENT",
    text: "Manage Orders",
    path: `/${path.ADMIN}/${path.MANAGE_ORDER}`,
    icon: <RiBillLine size={20} />,
    submenu: [
      {
        text: "Create Order",
        path: `/${path.ADMIN}/${path.CREATE_ORDER}`,
      },
      {
        text: "Manage Orders",
        path: `/${path.ADMIN}/${path.MANAGE_ORDER}`,
      },
    ],
  },
  {
    id: 5,
    type: "PARENT",
    text: "Manage Coupons",
    path: `/${path.ADMIN}/${path.MANAGE_COUPON}`,
    icon: <RiCouponLine size={20} />,
    submenu: [
      {
        text: "Create Coupon",
        path: `/${path.ADMIN}/${path.CREATE_COUPON}`,
      },
      {
        text: "Manage Coupons",
        path: `/${path.ADMIN}/${path.MANAGE_COUPON}`,
      },
    ],
  },
];

export const memberSidebar = [
  {
    id: 1,
    type: "SINGLE",
    text: "Personal",
    path: `/${path.MEMBER}/${path.PERSONAL}`,
    icon: <AiOutlineDashboard size={20} />,
  },
  {
    id: 2,
    type: "SINGLE",
    text: "My Order",
    path: `/${path.MEMBER}/${path.MY_CART}`,
    icon: <MdGroups size={20} />,
  },
  {
    id: 4,
    type: "SINGLE",
    text: "Buy history",
    path: `/${path.MEMBER}/${path.HISTORY}`,
    icon: <RiBillLine size={20} />,
  },
  {
    id: 5,
    type: "SINGLE",
    text: "Wishlist",
    path: `/${path.MEMBER}/${path.WISHLIST}`,
    icon: <FcLike size={20} />,
  },
];

export const roles = [
  {
    code: 1988,
    value: "Admin",
  },
  {
    code: 1997,
    value: "User",
  },
];

export const blockStatus = [
  {
    code: true,
    value: "Blocked",
  },
  {
    code: false,
    value: "Active",
  },
];

export const statusOrders = [
  {
    label: "Cancelled",
    value: "Cancelled",
  },
  {
    label: "Succeed",
    value: "Succeed",
  },
];
