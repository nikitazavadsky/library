import Link from "next/link";
import { Item } from "@/schemas/itemSchema";

type Props = {
  searchText: string;
  searchResults: Item[];
  clearSearchbar: () => void;
};

const SearchSuggestions = ({
  searchText,
  searchResults,
  clearSearchbar,
}: Props) => {
  return searchResults ? (
    <ul className="dropdown-content menu absolute z-50 mt-1 w-64 rounded-md py-1 shadow-lg">
      {searchResults.map((item) => {
        const complectation = item.complectations.find(complectation => complectation.model.toLowerCase().includes(searchText.toLowerCase()));
        return (
          <li
            key={item.id}
            className="block w-64 cursor-pointer rounded-md bg-base-100 text-sm transition duration-200"
            onClick={clearSearchbar}
          >
            <Link href={`/item/${item.id}`}>
              {`${item.category} - ${item.manufacturer} ${complectation?.model}`}
            </Link>
          </li>
        );
      })}
    </ul>
  ) : null;
};

export default SearchSuggestions;