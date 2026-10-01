import { useItem } from 'stac-react';

import { H2 } from '../../components/headers';
import Panel from '../../layout/Panel';
import { Button } from '../../components/buttons';

function ItemDetails({ item, onClose }) {
  const itemUrl = item.links.find((r) => r.rel === 'self')?.href;
  const { item: newItem, isLoading, error, reload } = useItem(itemUrl);

  return (
    <Panel className="grid grid-rows-[1fr_min-content] p-4 h-[calc(100vh_-_90px)] overflow-y-scroll w-full overflow-hidden">
      <div className="w-full overflow-hidden">
        <div className="flex flex-wrap items-start gap-2">
          <H2 className="whitespace-normal break-words flex-1">Selected Item</H2>
          <Button
            type="button"
            onClick={onClose}
            aria-label="Close selected item panel"
            title="Close"
            className="p-2 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </Button>
        </div>
        {isLoading && <p className="whitespace-normal break-words">Loading...</p>}
        {error && <p className="whitespace-normal break-words">{error}</p>}
        {newItem && (
          <pre className="bg-gray-100 p-2 rounded  w-full whitespace-pre-wrap break-words overflow-x-auto text-xs">
            {JSON.stringify(newItem, null, 2)}
          </pre>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Button type="button" onClick={reload}>
          Reload
        </Button>
      </div>
    </Panel>
  );
}
export default ItemDetails;
