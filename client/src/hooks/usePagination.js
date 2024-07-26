import { useMemo } from "react";
import { generateRange } from "utils/helpers";
import { HiDotsHorizontal } from "react-icons/hi";

const usePagination = (totalProductCount, currentPage, siblingCount = 1) => {
  const paginationArray = useMemo(() => {
    const pageSize = process.env.REACT_APP_PRODUCT_LIMIT || 10;
    const TOTAL_FIXED_PAGINATION_ITEMS = 5;
    const paginationCount = Math.ceil(totalProductCount / pageSize);
    const totalPaginationItem = siblingCount + TOTAL_FIXED_PAGINATION_ITEMS;

    if (paginationCount <= totalPaginationItem)
      return generateRange(1, paginationCount);

    const isShowLeft = currentPage - siblingCount > 2;
    const isShowRight = currentPage + siblingCount < paginationCount - 1;

    if (isShowLeft && !isShowRight) {
      const rightStart = paginationCount - 4;
      const rightRange = generateRange(rightStart, paginationCount);
      return [1, <HiDotsHorizontal size={20} />, ...rightRange];
    }
    if (!isShowLeft && isShowRight) {
      const leftRange = generateRange(1, 5);
      return [...leftRange, <HiDotsHorizontal size={20} />, paginationCount];
    }

    if (isShowLeft && isShowRight) {
      const siblingLeft = Math.max(currentPage - siblingCount, 1);
      const siblingRight = Math.min(
        currentPage + siblingCount,
        paginationCount - 1
      );
      const middleRange = generateRange(siblingLeft, siblingRight);
      return [
        1,
        <HiDotsHorizontal size={20} />,
        ...middleRange,
        <HiDotsHorizontal size={20} />,
        paginationCount,
      ];
    }
  }, [totalProductCount, currentPage, siblingCount]);

  return paginationArray;
};

export default usePagination;

/* first-last-current-sibling-dots
min = 6 =sibling + 5
totalPagination = 66, limit=10 =>7 (66/10=6.2 => 6 & 0.2*10) pages
totalPaginationItem = sibling + 5
[1,2,3,4,5,6]
[1,...,6,7,8,9,10]
[1,2,3,4,5,...,10]
[1,...5,6,7,...,10]
 */
