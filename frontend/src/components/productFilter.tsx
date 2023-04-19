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
  // RangeSlider
  const [pageNumRange, setPageNumRange] = useState<[number, number]>([200, 500]);

  // // Selects
   const [selectedAvailability, setSelectedAvailability] = useState<string | null>(null);

  // const onSuccessQuery = (filterData: Filters) => {

  //   setPageNumRange([filterData.price.min, filterData.price.max]);
  // };

  // const { data: filters } = useFiltersQuery(onSuccessQuery);
  return (
    <div className="border border-accent p-4 shadow-2xl md:mr-4">
      <div className="mb-4">
        <h2 className="mb-8 text-center font-semibold">Price Range</h2>
        <RangeSlider
          defaultValue={[200, 300]}
          value={pageNumRange}
          min={1}
          max={1000}
          onChange={(value) =>
            setPageNumRange([
              Number(value[0].toFixed(2)),
              Number(value[1].toFixed(2)),
            ])
          }
          step={1}
          labelAlwaysOn
        />
      </div>

      <div className="mb-4">
        <Select
          label="Select availability"
          placeholder="Pick one or more"
          searchable
          value={selectedAvailability}
          onChange={(value) => setSelectedAvailability(value)}
          nothingFound="No options"
          data={['Available', 'Not available']}
        />
      </div>

      <div className="flex flex-wrap justify-end gap-4">
        <button
          className="btn-success btn"
          onClick={() => {
            handleApplyFilters({
              availability: selectedAvailability,
              num_range: {
                min: pageNumRange[0],
                max: pageNumRange[1],
              },
            });
          }}
        >
          Apply Filters
        </button>
        <button
          className="btn-error btn"
          onClick={() => {
            handleResetFilters();
            // if (filters) onSuccessQuery(filters);
          }}
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
};

export default ProductFilter;
