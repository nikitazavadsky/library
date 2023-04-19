import useFiltersQuery, { type Filters } from "@/queries/useFilters";
import { Author } from "@/schemas/authorSchema";
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
  const [pageNumRange, setPageNumRange] = useState<[number, number]>([0, 0]);
  const [authors, setAuthors] = useState<{ value: number; label: string }[]>([]);
  const [availability, setAvailability] = useState<{ value: boolean | 'any'; label: string }[]>([
    {value: true, label: 'Available'},
    {value: false, label: 'Not available'},
    {value: 'any', label: 'Any'},
  ]);

  // // Selects
  const [selectedAvailability, setSelectedAvailability] = useState<boolean | null>(null);
  const [selectedAuthors, setSelectedAuthors] = useState<{ value: number; label: string }[]>([]);

  const onSuccessQuery = (filterData: Filters) => {
    const { num_pages, authors } = filterData;

    setPageNumRange([num_pages.min, num_pages.max]);
    setAuthors(
      authors.map((author) => ({
        value: author.id,
        label: `${author.first_name} ${author.last_name}`,
      }))
    );
    setAvailability(
      [
        {value: true, label: 'Available'},
        {value: false, label: 'Not available'},
        {value: 'any', label: 'Any'},
      ]
    )
  };

  const { data: filters } = useFiltersQuery(onSuccessQuery);
  return (
    <div className="border border-accent p-4 shadow-2xl md:mr-4">
      <div className="mb-4">
        <h2 className="mb-8 text-center font-semibold">Price Range</h2>
        <RangeSlider
          defaultValue={pageNumRange}
          value={pageNumRange}
          min={filters?.num_pages.min}
          max={filters?.num_pages.max}
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
          data={availability}
        />
      </div>

      <div className="mb-4">
        <MultiSelect
          label="Select authors"
          placeholder="Pick one or more"
          searchable
          value={selectedAuthors}
          onChange={(value) => setSelectedAuthors(value)}
          nothingFound="No options"
          data={authors}
        />
      </div>

      <div className="flex flex-wrap justify-end gap-4">
        <button
          className="btn-success btn"
          onClick={() => {
            handleApplyFilters({
              availability: selectedAvailability,
              authors: selectedAuthors,
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
            setSelectedAuthors([]);
            setSelectedAvailability(null);
            setPageNumRange([200, 500]);
            if (filters) onSuccessQuery(filters);
          }}
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
};

export default ProductFilter;
