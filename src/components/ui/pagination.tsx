import * as React from "react";
import { cn } from "@/lib/utils";

export interface PaginationProps extends React.HTMLAttributes<HTMLDivElement> {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  className,
  ...props
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPages = () => {
    const pages: (number | string)[] = [];

    // Nếu tổng số trang <= 4, hiển thị tất cả
    if (totalPages <= 4) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    const prevPage = page - 1;
    const nextPage = page + 1;
    const endPage = totalPages;

    // Luôn hiển thị trang đầu (1)
    pages.push(1);

    // Xử lý phần giữa: prev, current, next
    if (page === 1) {
      // Trang 1: 1, 2, ..., end
      if (nextPage <= endPage) {
        pages.push(nextPage);
      }
      if (nextPage < endPage - 1) {
        pages.push("...");
      }
      // Thêm trang cuối
      if (endPage > 1) {
        pages.push(endPage);
      }
    } else if (page === endPage) {
      // Trang cuối: 1, ..., prev, end
      if (prevPage > 2) {
        pages.push("...");
      } else if (prevPage === 2) {
        pages.push(2);
      }
      if (prevPage > 1) {
        pages.push(prevPage);
      }
      // Thêm trang cuối
      pages.push(endPage);
    } else {
      // Trang ở giữa: 1, ..., prev, current, next, ..., end
      if (prevPage > 2) {
        pages.push("...");
      } else if (prevPage === 2) {
        pages.push(2);
      }
      // Chỉ thêm prev nếu nó khác 1 (vì 1 đã có rồi)
      if (prevPage > 1) {
        pages.push(prevPage);
      }
      // Thêm trang hiện tại
      pages.push(page);
      // Thêm trang sau
      if (nextPage < endPage) {
        pages.push(nextPage);
      }
      // Thêm "..." nếu có khoảng cách
      if (nextPage < endPage - 1) {
        pages.push("...");
      }
      // Thêm trang cuối
      if (endPage > page) {
        pages.push(endPage);
      }
    }

    return pages;
  };

  return (
    <nav
      role="navigation"
      aria-label="pagination navigation"
      className={cn("flex justify-center", className)}
      {...props}
    >
      <ul className="inline-flex items-center -space-x-px">
        <li>
          <button
            className="px-3 text-sm h-10 min-w-10 flex items-center justify-center ml-0 leading-tight text-neutral-300 bg-darkBorderV1 border border-darkBackgroundV1 rounded-l-lg hover:bg-gray-700"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
          >
            Trước đó
          </button>
        </li>
        {getPages().map((p, index) => (
          <li key={typeof p === "number" ? p : `ellipsis-${index}`}>
            {p === "..." ? (
              <span className="px-3 text-sm h-10 min-w-10 flex items-center justify-center leading-tight text-neutral-300 bg-darkBorderV1 border border-darkBackgroundV1">
                ...
              </span>
            ) : (
              <button
                className={cn(
                  "px-3 text-sm h-10 min-w-10 flex items-center justify-center leading-tight border border-darkBackgroundV1",
                  p === page
                    ? "bg-mainTextHoverV1 text-neutral-300"
                    : "bg-darkBorderV1 text-neutral-300 hover:bg-gray-700"
                )}
                onClick={() => onPageChange(p as number)}
                aria-current={p === page ? "page" : undefined}
              >
                {p}
              </button>
            )}
          </li>
        ))}
        <li>
          <button
            className="px-3 text-sm h-10 min-w-10 flex items-center justify-center leading-tight text-neutral-300 bg-darkBorderV1 border border-darkBackgroundV1 rounded-r-lg hover:bg-gray-700"
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
          >
            Tiếp theo
          </button>
        </li>
      </ul>
    </nav>
  );
}
