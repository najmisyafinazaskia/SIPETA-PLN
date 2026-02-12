import React from "react";
import RegionMap from "./RegionMap";

interface DusunMapProps {
    activeFilters: { stable: boolean; warning: boolean };
    filterLocations?: string[];
    dataSourceUrl?: string; // Add this
}

const DusunMap: React.FC<DusunMapProps> = (props) => {
    return <RegionMap {...props} hideStatus={true} />;
};

export default DusunMap;
