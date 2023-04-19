import Image from "next/image";
import Link from "next/link";
import SignIn from "@/components/signIn";
import SignUp from "@/components/signUp";
import { useAuthStore, useFakeAuthStore } from "@/stores/auth";
import { useEffect, useState } from "react";
import Loader from "./loader";
import AvatarDropdown from "./avatarDropdown";
import { ShoppingCartIcon } from "@heroicons/react/24/solid";
import useCartStore from "@/stores/cart";
import { env } from "@/env.mjs";
import SearchBar from "./searchBar";

export default function Header() {
  const { isAuthenticated, user } = useAuthStore();
  const { items } = useCartStore();
  const [isRehydrated, setIsRehydrated] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const totalLength = items.length;

  const fakeAuth = useFakeAuthStore((state) => state.setIsAuthenticated);

  const showSuccessMessage = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  // Workaround for this issue:
  // https://github.com/pmndrs/zustand/issues/938
  // https://github.com/pmndrs/zustand/issues/1145
  useEffect(() => {
    setIsRehydrated(true);
  }, []);

  if (!isRehydrated) return <Loader />;

  return (
    <>
      <header className="bg-primary">
        <nav className="mx-auto max-w-7xl px-6 lg:px-8" aria-label="Top">
          <div className="flex w-full items-center justify-between py-6">
            <div className="flex items-center">
              <Link href="/home">
                <span className="sr-only">Your Company</span>
                <Image
                  className="h-10 w-auto"
                  width={40}
                  height={40}
                  src="/book.png"
                  alt="Logo icon"
                />
              </Link>
            </div>
            {env.NEXT_PUBLIC_CLIENT_MODE === "development" && (
              <button
                className="btn"
                onClick={() => fakeAuth(!isAuthenticated)}
              >
                Fake Auth
              </button>
            )}
            <SearchBar />
            <div className="flex items-center">
              <div className="indicator mr-10">
                <span className="badge-info badge indicator-item pointer-events-none">
                  {totalLength}
                </span>
                <Link href="/cart">
                  <ShoppingCartIcon className="h-8 w-8 text-accent-content" />
                </Link>
              </div>
              {isAuthenticated ? (
                <AvatarDropdown />
              ) : (
                <>
                  <SignIn showSuccessMessage={showSuccessMessage} />
                  <SignUp />
                </>
              )}
            </div>
          </div>
        </nav>
      </header>
      {showSuccess && (
        <div className="toast-end toast absolute z-50">
          <div className="alert alert-success">
            <div>
              <span>Welcome back, {user?.first_name ?? "customer!"}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
