import Loader from "@/components/loader";
import useCheckoutMutation from "@/mutations/useCheckout";
import { useAuthStore } from "@/stores/auth";
import { type NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import useCartStore from "../stores/cart";

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
    const preparedItems = items.map((item) => (item.id));
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
      <div className="mx-16 p-4">
        <h2 className="mb-4 text-xl font-bold">Books to request</h2>
        {items.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <>
            {items.map((item) => (
              <div
                key={item.id}
                className="mb-2 flex items-center justify-between"
              >
                <p>
                  {item.title}{" "}{item.authors[0]?.first_name[0]}{". "}{item.authors[0]?.last_name}
                </p>
                <p>
                  <button
                    className="ml-4 rounded bg-error px-1 font-bold text-white"
                    onClick={() => removeItem(item.id)}
                  >
                    X
                  </button>
                </p>
              </div>
            ))}
            <hr className="my-2" />
            <div className="flex items-center justify-end">
              <p className="mr-2 font-bold">Total books:</p>
              <p className="font-bold">{items.length}</p>
            </div>
            <div className="ml-auto w-fit">
              <button
                className="btn-success btn mr-2 rounded px-4 py-2 "
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
                className="btn-error btn rounded px-4 py-2"
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
