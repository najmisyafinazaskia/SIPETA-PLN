import React from "react";
import RegionMap from "./RegionMap";

interface Up3MapProps {
    filters: {
        stable: boolean;
        warning: boolean;
        locations: string[];
    };
    disableWarning?: boolean;
}

const Up3Map: React.FC<Up3MapProps> = ({ filters, disableWarning }) => {
    return (
        <div className="w-full h-full">
            <RegionMap
                activeFilters={{ stable: filters.stable, warning: filters.warning }}
                disableWarning={disableWarning}
                filterLocations={filters.locations}
            />
        </div>
    );
};

export default Up3Map;
