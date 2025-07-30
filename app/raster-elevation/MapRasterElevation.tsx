import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import styles from './MapRasterElevation.module.css';
import { useEffect, useRef, useState } from 'react';
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import ImageryTileLayer from "@arcgis/core/layers/ImageryTileLayer.js";
import SimpleRenderer from "@arcgis/core/renderers/SimpleRenderer.js";
import SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol";
import SimpleLineSymbol from "@arcgis/core/symbols/SimpleLineSymbol";
import TileInfo from "@arcgis/core/layers/support/TileInfo"
import * as rasterFunctionUtils from "@arcgis/core/layers/support/rasterFunctionUtils.js";
import * as geometryEngine from "@arcgis/core/geometry/geometryEngine.js";
import { CalciteSlider } from "@esri/calcite-components-react";
import "@esri/calcite-components/dist/components/calcite-slider";
import "@esri/calcite-components/dist/calcite/calcite.css";
import Query from "@arcgis/core/rest/support/Query";
// -------- typing --------
type RgbaArray = [number, number, number, number];

// ________ typing ________
// -------- Functions --------
// Creating a rendering function to apply on certain feature layers
function rendering(fill_rgbaArray: RgbaArray, width:number, line_rgbaArray: RgbaArray) {
  return new SimpleRenderer( {
      symbol: new SimpleFillSymbol({
          color: fill_rgbaArray,
          outline:new SimpleLineSymbol( {
              width: width,
              color: line_rgbaArray
          })
      })
  })
}
// ________ Functions ________
// -------- Main --------
const MapRasterElevation = () => {
const mapRef = useRef<HTMLDivElement | null>(null);
const viewRef = useRef<__esri.MapView | null>(null);
const [sliderMinValue, setSliderMinValue] = useState(0);
const [sliderMaxValue, setSliderMaxValue] = useState(2);
 
useEffect(() => {

const createCustomAnalysis = (
  minValue: number,
  maxValue: number,
  geometry: __esri.Geometry,
): __esri.RasterFunctionProperties => {
  const clipper = rasterFunctionUtils.clip({
    geometry: geometry as __esri.Extent,
    keepOutside: false,
  });

  const elevationMask = rasterFunctionUtils.mask({
    includedRanges: [[minValue, maxValue]],
    noDataValues: [[-9999]],
    noDataInterpretation: "match-any",
    raster: clipper
  })

  return elevationMask
};

const boundary_LCC = new FeatureLayer({
  url: 'https://services.arcgis.com/3vStCH7NDoBOZ5zn/ArcGIS/rest/services/Woongoolba_flood_mitigation_catchment_area/FeatureServer',
  outFields: ['*'],
  title: 'Boundary',
  renderer:rendering([255, 128, 0, 0], 2, [255, 255, 0, 0.85]),
})

const boundary_LCC2 = new FeatureLayer({
  url: 'https://services.arcgis.com/3vStCH7NDoBOZ5zn/ArcGIS/rest/services/Woongoolba_flood_mitigation_catchment_area/FeatureServer',
  outFields: ['*'],
  title: 'Boundary',
  renderer:rendering([255, 128, 0, 0], 3, [255, 255, 255, 0.85]),
})

const rast_lyr = new ImageryTileLayer({
                    url: "https://spatial-img.information.qld.gov.au/arcgis/rest/services/Elevation/QldDem/ImageServer",
                    minScale: 1000000,
                    maxScale: 0,   
                    opacity: 0.8, 
                  });

    if (mapRef.current) {
        (async () => {
            const map=new Map({
                basemap: 'hybrid',
                layers: [boundary_LCC2,boundary_LCC]
            })
            const mapView=new MapView({
                container: mapRef.current as HTMLDivElement,
                map: map,
                center: [153.27,-27.77],
                zoom: 12,
                constraints: {
                  minScale: 1000000,
                  maxScale: 0,
                  rotationEnabled: false,
                  lods: TileInfo.create().lods
                },
            })

            boundary_LCC.when(() => {
              // mapView.constraints.geometry=boundary_LCC.fullExtent
              map.add(rast_lyr,-2);

              rast_lyr.rasterFunction = createCustomAnalysis(sliderMinValue, sliderMaxValue,boundary_LCC.fullExtent as __esri.Geometry);
            })

            viewRef.current = mapView;

            return () => {
              if (mapView) {
                mapView.destroy();
                viewRef.current = null;
              }
            };
        })();
        
    }
const elevationSlider = document.getElementById("elevationSlider") as HTMLCalciteSliderElement | null;
if (elevationSlider) {
  elevationSlider.addEventListener("calciteSliderChange", (event: Event) => {
    const target = event.target as HTMLCalciteSliderElement;
    const minValue = target.minValue;
    const maxValue = target.maxValue;
    // console.log("Slider changed:", { minValue, maxValue });
    // Assuming createCustomAnalysis is a function you've defined elsewhere
    rast_lyr.rasterFunction = createCustomAnalysis(minValue, maxValue,boundary_LCC.fullExtent as __esri.Geometry);
  });
} else {
  console.warn("Elevation slider element not found.");
}

  }, []);

  return (
    <div>
      <div className={styles.mapDiv} ref={mapRef}></div>
          <div className={styles.sliderContainer}>
                      Elevation Range
                      <CalciteSlider
                        id="elevationSlider"
                        min-value={sliderMinValue}
                        max-value={sliderMaxValue}
                        min={-1}
                        max={10}
                        ticks={1}
                        step={1}
                        snap
                        label-handles
                        max-label="Max Elevation"
                        min-label="Min Elevation"
                        // onCalciteSliderChange={handleSliderChange}
                        ></CalciteSlider>


        </div>
    </div>
    
  );

};
// ________ Main ________
export default MapRasterElevation;