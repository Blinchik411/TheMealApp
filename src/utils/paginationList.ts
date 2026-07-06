import { type Meal } from "../types/meal.types";

interface PaginationResult {
    paginatedItems: Meal[];
    totalPages: number;
}

 const getPaginatedData = (items: Meal[], currentPage: number, itemsPerPage: number): PaginationResult => {

    const startIndex = (currentPage - 1) * itemsPerPage;

    const endIndex = startIndex + itemsPerPage;

    const paginatedItems = items.slice(startIndex, endIndex);

    const totalPages = Math.ceil(items.length / itemsPerPage);

    return {
        paginatedItems,
        totalPages
    };
};

export default getPaginatedData