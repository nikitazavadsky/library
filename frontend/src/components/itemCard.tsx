import { type Item } from "@/schemas/itemSchema";
import useCartStore from "@/stores/cart";
import { checkTruthy } from "@/utils/objectHelpers";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export const NO_IMAGE_LINK =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT3u0UEA-Gfpsphl2gdxxbhnVoJ1NP_o0LV3Q&usqp=CAU";

export default function ItemCard({
  item,
  disabled,
}: {
  item: Item;
  disabled: boolean;
}) {
  const [showError, setShowError] = useState(false);
  const addToCart = useCartStore((state) => state.addItem);

  const handleDataSubmit = (data: Item) => {
    const validData = checkTruthy(data);

    if (validData !== null) {
      addToCart(validData);
    } else {
      setShowError(true);
      console.error(
        "Invalid data:",
        data,
        "with id",
        data.id,
        "Make sure all fields are filled."
      );
    }
  };

  return (
    <>
      <div className="card bg-base-300 shadow-xl">
        <Link href={`books/${item.id}`}>
          <Image
            src={item.image_url ? item.image_url : NO_IMAGE_LINK}
            alt={item.title}
            width={350}
            height={300}
            className="mx-auto p-4"
          />
        </Link>
        <div className="card-body">
          <Link href={`books/${item.id}`}>
            <h2 className="link-hover link card-title truncate text-4xl font-extrabold leading-tight">
              {item.title}
            </h2>
          </Link>
          <div className="text-2xl">{item.num_pages} Pages</div>
          <div className="text-lg">ISBN: {item.isbn}</div>
          <div className="card-actions flex-col content-end justify-end">
            {!showError ? (
              <button
                className="btn-primary btn"
                disabled={disabled}
                title={
                  disabled
                    ? "Unfortunately, this book is currently unavailable"
                    : undefined
                }
                onClick={() => {
                  handleDataSubmit(item);
                }}
              >
                Add to Wishlist
              </button>
            ) : (
              <button
                className="btn-error btn"
                onClick={() => {
                  setShowError(false);
                }}
              >
                Error! Check console for details.
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
