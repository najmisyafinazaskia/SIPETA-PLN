import React from "react";
import RegionMap from "./RegionMap";

interface KecamatanMapProps {
  activeFilters: { stable: boolean; warning: boolean };
  disableWarning?: boolean;
}

const KecamatanMap: React.FC<KecamatanMapProps> = (props) => {
  return <RegionMap {...props} />;
};

export default KecamatanMap;
