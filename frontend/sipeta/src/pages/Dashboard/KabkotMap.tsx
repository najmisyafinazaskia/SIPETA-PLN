import React from "react";
import RegionMap from "./RegionMap";

interface CountryMapProps {
  activeFilters: { stable: boolean; warning: boolean };
  disableWarning?: boolean;
}

const CountryMap: React.FC<CountryMapProps> = (props) => {
  return <RegionMap {...props} />;
};

export default CountryMap;