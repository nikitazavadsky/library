import Head from "next/head";
import { type NextPage } from "next";
import { useState } from "react";
import ItemCard from "@/components/itemCard";
import ProductFilter from "@/components/productFilter";
import { useApplyFiltersQuery, useItemsQuery } from "@/queries/useItems";
import Loader from "@/components/loader";
import { flattenFilters } from "@/utils/objectHelpers";

const Home: NextPage = () => {
  const [filters, setFilters] = useState<URLSearchParams>();
  const [isFiltered, setIsFiltered] = useState(false);

  const { data: allItems, isLoading: isLoadingAllItems } = useItemsQuery();
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
  const isLoading = isFiltered ? isLoadingFilteredItems : isLoadingAllItems;

  return (
    <>
      <Head>
        <title>Home Page</title>
      </Head>
      <div className="mx-2 mt-4 grid grid-cols-1 md:grid-cols-3 lg:mx-16 lg:grid-cols-4">
        <div className="col-span-1">
            <ProductFilter
              handleApplyFilters={handleApplyFilters}
              handleResetFilters={handleResetFilters}
            />
        </div>
        <div className="col-span-1 md:col-span-2 lg:col-span-3">
          {/* TEST ITEM */}
          {/* <ItemCard
            item={{
              id: 1,
              category: "Laptop",
              manufacturer: "Apple",
              complectations: [
                {
                  id: 1,
                  description: 'Apple MacBook Pro 13.3" 2020 M1 8GB 256GB',
                  price: 1000,
                  model: "Apple MacBook Pro 13.3",
                },
                {
                  id: 2,
                  description: 'Apple MacBook Pro 13.3" 2020 M1 8GB 512GB',
                  price: 1200,
                  model: "Apple MacBook Pro 13.3",
                },
                {
                  id: 3,
                  description: 'Apple MacBook Pro 13.3" 2020 M1 16GB 512GB',
                  price: 1400,
                  model: "Apple MacBook Pro 13.3",
                },
              ],
              imageUrl: NO_IMAGE_LINK,
            }}
          /> */}
          {isLoading ? (
            <Loader />
          ) : (
            items?.length !== 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {items?.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <p className="alert alert-info text-xl">
              Looks like there are no items to buy... Yet!
            </p>
          ))}
        </div>
      </div>
    </>
  );
};

export default Home;
