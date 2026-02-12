import React from "react";
import RegionMap from "./RegionMap";

interface Up3MapProps {
    filters: {
        stable: boolean;
        warning: boolean;
        locations: string[];
    };
    showUp3Markers?: boolean;
    disableWarning?: boolean;
}

const Up3Map: React.FC<Up3MapProps> = ({ filters, showUp3Markers, disableWarning }) => {
    return (
        <div className="w-full h-full">
            <RegionMap
                activeFilters={{ stable: filters.stable, warning: filters.warning }}
                disableWarning={disableWarning}
                filterLocations={filters.locations}
                showUp3Markers={showUp3Markers}
                markerLevel="up3"
            />
        </div>
    );
};

export default Up3Map;
