import React from "react";

export const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const handlePrevious = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  return (
    <div className="flex justify-center items-center mt-4">
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className="px-4 py-2 border rounded-l disabled:opacity-50"
      >
        Previous
      </button>
      <span className="px-4 py-2 border-t border-b">
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="px-4 py-2 border rounded-r disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
};
