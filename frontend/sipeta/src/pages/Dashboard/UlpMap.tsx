import React from "react";
import RegionMap from "./RegionMap";

interface UlpMapProps {
    filters: {
        stable: boolean;
        warning: boolean;
        locations: string[];
    };
    disableWarning?: boolean;
}

const UlpMap: React.FC<UlpMapProps> = ({ filters, disableWarning }) => {
    return (
        <div className="w-full h-full">
            <RegionMap
                activeFilters={{ stable: filters.stable, warning: filters.warning }}
                disableWarning={disableWarning}
            />
        </div>
    );
};

export default UlpMap;
