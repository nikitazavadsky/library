import Head from "next/head";
import { type NextPage } from "next";
import { useState } from "react";
import ItemCard from "@/components/itemCard";
import ProductFilter from "@/components/productFilter";
import { useApplyFiltersQuery, useItemsQuery, useUnavailableItemsQuery } from "@/queries/useItems";
import Loader from "@/components/loader";
import { flattenFilters } from "@/utils/objectHelpers";

const Home: NextPage = () => {
  const [filters, setFilters] = useState<URLSearchParams>();
  const [isFiltered, setIsFiltered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const { data: allItems, isLoading: isLoadingAllItems } = useItemsQuery();
  const { data: allUnavailableItems, isLoading: isLoadingAllUnavailableItems } = useUnavailableItemsQuery();

  const {
    data: filteredItems,
    isLoading: isLoadingFilteredItems,
    refetch,
  } = useApplyFiltersQuery(filters);

  const handleApplyFilters = (filterObj: Record<string, unknown>) => {
    const flatFilters = flattenFilters(filterObj);
    console.log(filterObj)
    console.log(flatFilters)

    const params = new URLSearchParams();
    Object.entries(flatFilters).forEach(([key, value]) => {
      params.set(key, String(value));
    });

    setFilters(params);
    setIsFiltered(true);
    void refetch();
  };

  const handleResetFilters = () => {
    setFilters(undefined);
    setIsFiltered(false);
  };

  const items = isFiltered ? filteredItems : allItems;
  const isLoading = isFiltered ? isLoadingFilteredItems : isLoadingAllItems && isLoadingAllUnavailableItems;

  return (
    <>
      <Head>
        <title>Home Page</title>
      </Head>
      <div className="mx-2 mt-4 grid grid-cols-1 md:grid-cols-3 lg:mx-16 lg:grid-cols-4">
      <div className="col-span-1">
          <div className="flex justify-end">
            <button
              className="px-2 py-1 w-60 mr-3 mb-4 btn btn-success rounded-md"
              onClick={() => setIsOpen(!isOpen)} // toggle isOpen when clicked
            >
              {isOpen ? "Hide Filters" : "Show Filters"}
            </button>
          </div>
          {isOpen && ( // conditionally render ProductFilter based on isOpen
            <ProductFilter
              handleApplyFilters={handleApplyFilters}
              handleResetFilters={handleResetFilters}
            />
          )}
        </div>
        <div className="col-span-1 md:col-span-2 lg:col-span-3">
          {isLoading ? (
            <Loader />
          ) : (
            items?.length !== 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {items?.map((item) => (
                <ItemCard key={item.id} item={item} disabled={allUnavailableItems ? allUnavailableItems?.some(currentItem => currentItem.id === item.id) : false}/>
              ))}
            </div>
          ) : (
            <p className="alert alert-info text-xl">
              Unfortunately, there are no books you search...
            </p>
          ))}
        </div>
      </div>
    </>
  );
};

export default Home;
