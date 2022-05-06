import { useRef, useState, useEffect } from 'react';
import T from 'prop-types';

import mapbox from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import StaticMode from '@mapbox/mapbox-gl-draw-static-mode';
import DrawRectangle from 'mapbox-gl-draw-rectangle-mode';
import 'mapbox-gl/dist/mapbox-gl.css';


mapbox.accessToken = process.env.REACT_APP_MAPBOX_TOKEN || '';

const addDrawControl = (map, drawingCompleted) => {
  const { modes } = MapboxDraw;

  const options = {
    modes: {
      ...modes,
      draw_rectangle: DrawRectangle,
      static: StaticMode
    },
    boxSelect: false,
    displayControlsDefault: false,
  };
  const draw = new MapboxDraw(options);
  map.addControl(draw);
  map.on('draw.create', (e) => {
    const { features } = e;
    const feature = features[0];
    map.getCanvas().style.cursor = '';
    setTimeout(() => draw.changeMode('static'), 0);
    drawingCompleted(feature);
  });
  return draw;
};

function Map ({ className, isBboxDrawEnabled, handleDrawComplete }) {
  const mapContainerRef = useRef();
  const drawControleRef = useRef();
  const [ map, setMap ] = useState();

  useEffect(() => {
    const m = new mapbox.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/dark-v10',
      center: [-99.31640625, 40.04443758460856],
      zoom: 3,
      dragRotate: false,
      touchZoomRotate: false,
      attributionControl: true,
    });

    const onLoad = () => setMap(m);
    m.on('load', onLoad);
    drawControleRef.current = addDrawControl(m, handleDrawComplete)

    return () => {
      m.off('load', onLoad);
      if (map) {
        map.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (isBboxDrawEnabled) {
      drawControleRef.current.deleteAll();
      drawControleRef.current.changeMode('draw_rectangle');
      map.getCanvas().style.cursor = 'crosshair';
    }
  }, [isBboxDrawEnabled, map]);

  return <div ref={mapContainerRef} id='map' className={`h-screen ${className}`}>Map</div>
}

Map.propTypes = {
  className: T.string,
  isBboxDrawEnabled: T.bool,
  handleDrawComplete: T.func.isRequired
};

export default Map;
