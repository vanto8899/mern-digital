import React, { useEffect, useState } from "react";

const useDebounce = (value, ms) => {
  const [decounceValue, setDecounceValue] = useState("");
  useEffect(() => {
    const setTimeoutId = setTimeout(() => {
      setDecounceValue(value);
    }, ms);
    return () => {
      clearTimeout(setTimeoutId);
    };
  }, [value, ms]);
  return decounceValue;
};

export default useDebounce;

/* 
Dung de giai quyet issue goi api lien tuc khi nhap price
tach price thanh 2 bien:
1- cho UI
2- call api => set timeout
*/
