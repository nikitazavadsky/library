import Loader from "@/components/loader";
import useCheckoutMutation from "@/mutations/useCheckout";
import { useAuthStore } from "@/stores/auth";
import { type NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import useCartStore from "../stores/cart";

const NUMBERS_AFTER_DECIMAL = 2;

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

  const totalPrice = items
    .reduce((total, item) => total + item.price * item.quantity, 0)
    .toFixed(NUMBERS_AFTER_DECIMAL);

  const onSuccessfulCheckout = () => {
    clearCart();
    void router.push("/home");
  };

  const cartMutation = useCheckoutMutation(onSuccessfulCheckout);

  const handleCheckout = () => {
    const preparedItems = items.map((item) => ({
      item_id: item.id,
      quantity: item.quantity,
    }));
    const preparedCart = {
      items: preparedItems,
      total: parseFloat(totalPrice),
    };

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
        <h2 className="mb-4 text-xl font-bold">Shopping Cart</h2>
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
                  {item.name}{" "}
                  <span className="font-bold">x {item.quantity}</span>
                </p>
                <p>
                  {(item.price * item.quantity).toFixed(NUMBERS_AFTER_DECIMAL)}{" "}
                  BYN
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
              <p className="mr-2 font-bold">Total:</p>
              <p className="font-bold">{totalPrice} BYN</p>
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
                Checkout
              </button>
              <button
                className="btn-error btn rounded px-4 py-2"
                onClick={clearCart}
              >
                Clear Cart
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Cart;
