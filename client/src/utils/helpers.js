import icons from "./icons";

const { AiFillStar, AiOutlineStar } = icons;

export const createSlug = (String) =>
  String.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .split(" ")
    .join("-");

export const formatMoney = (number) => {
  if (isNaN(number)) return "0";
  return Number(number.toFixed(1)).toLocaleString();
};

export const renderStarFromNumber = (number, size) => {
  // Nếu number là NaN hoặc nhỏ hơn 0, đặt number là 0
  if (isNaN(number) || number < 0) {
    number = 0;
  }
  const stars = [];
  number = Math.round(number);
  for (let i = 0; i < +number; i++)
    stars.push(<AiFillStar color="orange" key={i} size={size || 16} />);
  for (let i = 5; i > +number; i--)
    stars.push(<AiOutlineStar key={i} size={size || 16} />);
  return stars;
};

export function secondsToHms(deltaTime) {
  let totalSeconds = Math.floor(deltaTime / 1000);
  const h = Math.floor(totalSeconds / 3600);
  totalSeconds %= 3600;
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return { h, m, s };
}

// Format the remaining time as MM:SS
export const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
};

// validate form login/signin
export const validate = (payload, setInvalidFields) => {
  let invalids = 0;
  const formatPayload = Object.entries(payload);
  // Clear previous errors
  setInvalidFields([]);
  formatPayload.forEach(([key, value]) => {
    // Ensure value is a string for fields where we expect strings
    const valueStr = typeof value === "string" ? value : "";
    switch (key) {
      case "email":
        if (valueStr.trim() === "") {
          invalids++;
          setInvalidFields((prev) => [
            ...prev,
            { name: key, message: "Input required!" },
          ]);
        } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(valueStr)) {
          invalids++;
          setInvalidFields((prev) => [
            ...prev,
            { name: key, message: "Invalid email format!" },
          ]);
        }
        break;

      case "mobile":
        if (valueStr.trim() === "") {
          invalids++;
          setInvalidFields((prev) => [
            ...prev,
            { name: key, message: "Input required!" },
          ]);
        } else if (!/^(0|\+84)[3|5|7|8|9][0-9]{8}$/.test(valueStr)) {
          invalids++;
          setInvalidFields((prev) => [
            ...prev,
            { name: key, message: "Invalid phone number format!" },
          ]);
        }
        break;

      case "password":
        if (valueStr.trim() === "") {
          invalids++;
          setInvalidFields((prev) => [
            ...prev,
            { name: key, message: "Input required!" },
          ]);
        } else if (valueStr.length < 6) {
          invalids++;
          setInvalidFields((prev) => [
            ...prev,
            {
              name: key,
              message: "Password must be at least 6 characters long!",
            },
          ]);
        }
        break;

      default:
        if (valueStr.trim() === "") {
          invalids++;
          setInvalidFields((prev) => [
            ...prev,
            { name: key, message: "Input required!" },
          ]);
        }
        break;
    }
  });

  return invalids;
};

export const formatPrice = (number) => Math.round(number / 1000) * 1000;

// input 3,6 => 3,4,5,6
export const generateRange = (start, end) => {
  const length = end + 1 - start;
  return Array.from({ length }, (_, index) => start + index);
};

export function getBase64(file) {
  if (!file) return "";
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

export const formatPriceVND = (price) => {
  // Assuming this function returns a number
  return parseFloat(price);
};

export const formatMoneyVND = (amount) => {
  // Assuming this function formats a number as a currency string
  return amount.toLocaleString("vi-VN");
};
