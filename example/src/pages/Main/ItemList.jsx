import T from 'prop-types';
import { TItemList } from "./proptypes";

import { H2 } from "../../components/headers";
import Panel from "../../layout/Panel";
import { Button } from "../../components/buttons";



function PaginationButton ({disabled, onClick, children}) {
  return (
    <Button
      disabled={disabled}
      onClick={onClick}
      className="bg-slate-500 text-white"
    >
      {children}
    </Button>
  );
}

PaginationButton.propTypes = {
  disabled: T.bool,
  onClick: T.func.isRequired,
  children: T.node.isRequired
}



function ItemList ({ items, isLoading, error, nextPage, previousPage }) {
  return (
    <Panel className="grid grid-rows-[1fr_min-content] p-4">
      <div className="overflow-x-clip">
        <H2>Item List</H2>
        {isLoading && (<p>Loading...</p>)}
        {error && (<p>{ error }</p>)}
        {items && (
          <ul>
            {items.features.map(({ id }) => (
              <li key={id}>{ id }</li>
            ))}
          </ul>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <PaginationButton disabled={!previousPage} onClick={previousPage}>Previous page</PaginationButton>
        <PaginationButton disabled={!nextPage} onClick={nextPage}>Next page</PaginationButton>
      </div>
    </Panel>
  );
}

ItemList.propTypes = {
  items: TItemList,
  isLoading: T.bool,
  error: T.string,
  previousPage: T.func,
  nextPage: T.func
}

export default ItemList;
