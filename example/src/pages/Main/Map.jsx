import T from 'prop-types';
import Panel from "../../layout/Panel";

function Map ({ className }) {
  return <Panel className={className}>Map</Panel>
}

Map.propTypes = {
  className: T.string
};

export default Map;
