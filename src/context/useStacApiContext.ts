import { useContext } from "react";
import { StacApiContext } from "./context";

export function useStacApiContext() {
  const { stacApi, collections, setCollections, getItem, addItem, deleteItem } =
    useContext(StacApiContext);

  return {
    stacApi,
    collections,
    setCollections,
    getItem,
    addItem,
    deleteItem,
  };
}
