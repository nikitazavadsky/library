import Loader from "@/components/loader";
import useCheckoutMutation from "@/mutations/useCheckout";
import { useAuthStore } from "@/stores/auth";
import { type NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import useCartStore from "../stores/cart";
import ErrorMessage from "@/components/errorMessage";

const Cart: NextPage = () => {
  const items = useCartStore((state) => state.items);
  const [isHydrated, setIsHydrated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isHydrated) {
      setIsHydrated(true);
    }
  }, [isHydrated]);

  const clearCart = useCartStore((state) => state.clearCart);
  const removeItem = useCartStore((state) => state.removeItem);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const onSuccessfulCheckout = () => {
    clearCart();
    void router.push("/home");
  };

  const cartMutation = useCheckoutMutation(onSuccessfulCheckout);

  const handleCheckout = () => {
    const preparedItems = items.map((item) => item.id);
    const preparedCart = preparedItems;

    cartMutation.mutate(preparedCart);
  };

  if (!isHydrated) {
    return <Loader />;
  }

  return (
    <>
      <Head>
        <title>{`Cart (${items.length})`}</title>
      </Head>
      <div className="p-4">
        <h2 className="mb-4 text-2xl font-bold text-blue-700">
          Your Book Wishlist
        </h2>
        {items.length === 0 ? (
          <p className="text-gray-700">No books to request</p>
        ) : (
          <>
            <div className="rounded-lg bg-white p-6 shadow-lg">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="mb-4 flex items-center justify-between border-b-2 pb-2"
                >
                  <p className="font-semibold text-blue-900">
                    {item.title} - {item.num_pages} pages -{" "}
                    <span className="text-gray-600">
                      ({item.authors[0]?.first_name}{" "}
                      {item.authors[0]?.last_name})
                    </span>
                    <span>
                      <span className="text-secondary"> | ISBN:</span>{" "}
                      {item.isbn}
                    </span>
                  </p>
                  <p>
                    <button
                      className="ml-4 rounded bg-red-500 px-2 py-1 font-bold text-white hover:bg-red-600"
                      onClick={() => removeItem(item.id)}
                    >
                      Remove
                    </button>
                  </p>
                </div>
              ))}
              <div className="flex items-center justify-end">
                <p className="mr-2 font-bold text-blue-700">Total books:</p>
                <p className="font-bold text-blue-700">{items.length}</p>
              </div>
            </div>
            {cartMutation.isError && (
              <ErrorMessage error={cartMutation.error.message} />
            )}
            <hr className="my-4" />
            <div className="ml-auto w-fit">
              <button
                className="btn-success btn mr-2 rounded px-4 py-2 hover:bg-green-600"
                onClick={() => {
                  if (!isAuthenticated) {
                    alert("Please login to checkout");
                    return;
                  }
                  handleCheckout();
                }}
              >
                Request Books
              </button>
              <button
                className="btn-error btn rounded px-4 py-2 hover:bg-red-600"
                onClick={clearCart}
              >
                Clear Wishlist
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Cart;
