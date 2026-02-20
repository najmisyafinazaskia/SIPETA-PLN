import React from "react";
import RegionMap from "./RegionMap";

interface KecamatanMapProps {
  activeFilters: { stable: boolean; warning: boolean };
  disableWarning?: boolean;
  filterLocations?: string[];
}

const KecamatanMap: React.FC<KecamatanMapProps> = (props) => {
  return (
    <RegionMap
      {...props}
      markerLevel="kecamatan"
      dataSourceUrl="/api/locations/map/kecamatan-points"
    />
  );
};

export default KecamatanMap;
