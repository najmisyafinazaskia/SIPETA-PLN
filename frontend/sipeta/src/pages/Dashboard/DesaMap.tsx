import React from "react";
import RegionMap from "./RegionMap";

interface DesaMapProps {
  activeFilters: { stable: boolean; warning: boolean };
  disableWarning?: boolean;
  filterLocations?: string[];
  dataSourceUrl?: string;
}

const DesaMap: React.FC<DesaMapProps> = (props) => {
  return <RegionMap {...props} />;
};

export default DesaMap;
