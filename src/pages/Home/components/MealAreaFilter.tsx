import React from "react";
import useFetch from "@/hooks/useFetch";
import type { AreaResponse } from "@/types/meal.types";
import { API_ENDPOINTS } from "@/api/endpoints";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../../../@/components/ui/select.tsx';

interface MealAreaFilterProps {
    value: string;
    onSelectedArea: (area: string) => void;
}

const MealAreaFilter: React.FC<MealAreaFilterProps> = ({ value, onSelectedArea }) => {
    const { data, isLoading, error } = useFetch<AreaResponse>(API_ENDPOINTS.getAreaList());

    if (isLoading) return <p className="text-sm text-muted-foreground">Loading countries...</p>;
    if (error) return <p className="text-sm text-destructive">Failed to load countries</p>;

    const areas = data?.meals || [];


    const handleValueChange = (newValue: string | null) => {
        onSelectedArea(newValue ?? "");
    };

    return (
        <Select value={value} onValueChange={handleValueChange}>
            <SelectTrigger className="w-full max-w-60 !h-10 text-sm ">
                <SelectValue placeholder="All countries" />
            </SelectTrigger>

            <SelectContent>
                <SelectGroup>
                    <SelectItem
                        value=""
                        className="text-sm"
                    >
                        All countries
                    </SelectItem>

                    {areas.map((area) => (
                        <SelectItem
                            key={area.strCountry}
                            value={area.strCountry}
                            className="text-sm"
                        >
                            {area.strCountry}
                        </SelectItem>
                    ))}
                </SelectGroup>
            </SelectContent>
        </Select>
    );
};

export default React.memo(MealAreaFilter);