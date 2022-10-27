import T from 'prop-types';
import { TItemList } from "./proptypes";

import { H2 } from "../../components/headers";
import Panel from "../../layout/Panel";



function ItemList ({ items, isLoading }) {
  return (
    <Panel>
      <H2>Item List</H2>
      {isLoading && (<p>Loading...</p>)}
      {items && (
        <ul>
          {items.features.map(({ id }) => (
            <li key={id}>{ id }</li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

ItemList.propTypes = {
  items: TItemList,
  isLoading: T.bool
}

export default ItemList;
