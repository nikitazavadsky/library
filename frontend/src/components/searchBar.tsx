import { useApplyFiltersQuery } from "@/queries/useItems";
import { type ChangeEvent, useState } from "react";
import SearchSuggestions from "./searchSuggestion";

const SearchBar = () => {
  const [searchText, setSearchText] = useState("");
  const [searchParams, setSearchParams] = useState(new URLSearchParams());

  const { data, refetch } = useApplyFiltersQuery(searchParams);

  const handleSearchQueryChange = (event: ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;

    if (query.length > 0) {
      const params = new URLSearchParams();
      params.set("search_term", query);
      setSearchParams(params);
      setSearchText(query);
      // call the refetch method to trigger a new fetch for the filtered items based on the new search query
      void refetch();
    } else {
      setSearchParams(new URLSearchParams());
      setSearchText("");
    }
  };

  return (
    <div>
      <input
        type="text"
        className="input-secondary input w-full max-w-sm"
        value={searchText}
        onChange={handleSearchQueryChange}
        placeholder="Search for items"
      />
      {data && searchText && (
        <SearchSuggestions
          searchText={searchText}
          searchResults={data}
          clearSearchbar={() => setSearchText("")}
        />
      )}
    </div>
  );
};

export default SearchBar;
