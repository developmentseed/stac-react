import ItemList from "./ItemList";
import Map from "./Map";
import QueryBuilder from "./QueryBuilder";

function Main() {
  return (
    <div className='grid grid-cols-4 gap-4 m-4'>
      <QueryBuilder />
      <ItemList />
      <Map className='col-span-2' />
    </div>
  );
}

export default Main;
