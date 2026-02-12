import React from "react";
import RegionMap from "./RegionMap";

interface UlpMapProps {
    filters: {
        stable: boolean;
        warning: boolean;
        locations: string[];
    };
    disableWarning?: boolean;
    showUlpMarkers?: boolean;
}

const UlpMap: React.FC<UlpMapProps> = ({ filters, disableWarning, showUlpMarkers = true }) => {
    return (
        <div className="w-full h-full">
            <RegionMap
                activeFilters={{ stable: filters.stable, warning: filters.warning }}
                disableWarning={disableWarning}
                filterLocations={filters.locations}
                markerLevel="ulp"
                showUlpMarkers={showUlpMarkers}
                showUp3Markers={false} // Only show ULP markers, hide UP3 context
            />
        </div>
    );
};

export default UlpMap;
