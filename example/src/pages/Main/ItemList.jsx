import { TItemList } from "./proptypes";

import { H2 } from "../../components/headers";
import Panel from "../../layout/Panel";



function ItemList ({ items }) {
  return (
    <Panel>
      <H2>Item List</H2>
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
  items: TItemList
}

export default ItemList;
