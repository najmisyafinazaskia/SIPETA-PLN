import React from "react";
import RegionMap from "./RegionMap";

interface DusunMapProps {
    activeFilters: { stable: boolean; warning: boolean };
}

const DusunMap: React.FC<DusunMapProps> = (props) => {
    return <RegionMap {...props} />;
};

export default DusunMap;
