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
        return (
          <li
            key={item.id}
            className="block w-64 cursor-pointer rounded-md bg-base-100 text-sm transition duration-200"
            onClick={clearSearchbar}
          >
            <Link href={`/books/${item.id}`}>
              {`${item?.title} - ${item?.authors[0]?.first_name[0]}. ${item?.authors[0]?.last_name}`}
            </Link>
          </li>
        );
      })}
    </ul>
  ) : null;
};

export default SearchSuggestions;