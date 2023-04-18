import useFiltersQuery, { type Filters } from "@/queries/useFilters";
import { MultiSelect, RangeSlider, Select } from "@mantine/core";
import { useState } from "react";

interface Props {
  handleApplyFilters: (filterObj: Record<string, unknown>) => void;
  handleResetFilters: () => void;
}

const ProductFilter: React.FC<Props> = ({
  handleApplyFilters,
  handleResetFilters,
}) => {
  // Data from BE
  // const [categories, setCategories] = useState<
  //   { value: string; label: string }[]
  // >([]);
  // const [manufacturers, setManufacturers] = useState<
  //   { value: string; label: string }[]
  // >([]);

  // // RangeSlider
  // const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);

  // // Selects
  // const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  // const [selectedManufacturers, setSelectedManufacturers] = useState<string[]>(
  //   []
  // );

  // const onSuccessQuery = (filterData: Filters) => {
  //   const { category, manufacturer } = filterData;

  //   setCategories(
  //     category.map((category) => ({
  //       value: category,
  //       label: category,
  //     }))
  //   );

  //   setManufacturers(
  //     manufacturer.map((manufacturer) => ({
  //       value: manufacturer,
  //       label: manufacturer,
  //     }))
  //   );

  //   setPriceRange([filterData.price.min, filterData.price.max]);
  // };

  // const { data: filters } = useFiltersQuery(onSuccessQuery);
    return (<div></div>)
  // return (
  //   <div className="border border-accent p-4 shadow-2xl md:mr-4">
  //     <div className="mb-4">
  //       <h2 className="mb-8 text-center font-semibold">Price Range</h2>
  //       <RangeSlider
  //         defaultValue={priceRange}
  //         value={priceRange}
  //         min={filters?.price.min}
  //         max={filters?.price.max}
  //         onChange={(value) =>
  //           setPriceRange([
  //             Number(value[0].toFixed(2)),
  //             Number(value[1].toFixed(2)),
  //           ])
  //         }
  //         step={0.01}
  //         labelAlwaysOn
  //       />
  //     </div>

  //     <div className="mb-4">
  //       <Select
  //         label="Select item category"
  //         placeholder="Pick one"
  //         searchable
  //         value={selectedCategory}
  //         onChange={(value) => setSelectedCategory(value)}
  //         nothingFound="No options"
  //         data={categories}
  //       />
  //     </div>

  //     <div className="mb-4">
  //       <MultiSelect
  //         label="Select manufacturer"
  //         placeholder="Pick one or more"
  //         searchable
  //         value={selectedManufacturers}
  //         onChange={(value) => setSelectedManufacturers(value)}
  //         nothingFound="No options"
  //         data={manufacturers}
  //       />
  //     </div>

  //     <div className="flex flex-wrap justify-end gap-4">
  //       <button
  //         className="btn-success btn"
  //         onClick={() => {
  //           handleApplyFilters({
  //             category: selectedCategory,
  //             manufacturer: selectedManufacturers,
  //             price: {
  //               minPrice: priceRange[0],
  //               maxPrice: priceRange[1],
  //             },
  //           });
  //         }}
  //       >
  //         Apply Filters
  //       </button>
  //       <button
  //         className="btn-error btn"
  //         onClick={() => {
  //           handleResetFilters();
  //           if (filters) onSuccessQuery(filters);
  //         }}
  //       >
  //         Reset Filters
  //       </button>
  //     </div>
  //   </div>
  // );
};

export default ProductFilter;
