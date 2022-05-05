import { useRef, useState, useEffect } from 'react';
import T from 'prop-types';

import mapbox from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';


mapbox.accessToken = process.env.REACT_APP_MAPBOX_TOKEN || '';

function Map ({ className }) {
  const mapContainerRef = useRef();
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

    return () => {
      m.off('load', onLoad);
      if (map) {
        map.remove();
      }
    };
  }, []);

  return <div ref={mapContainerRef} id='map' className={`h-screen ${className}`}>Map</div>
}

Map.propTypes = {
  className: T.string
};

export default Map;
