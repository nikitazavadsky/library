import Image from "next/image";
import Link from "next/link";
import SignIn from "@/components/signIn";
import SignUp from "@/components/signUp";
import { useAuthStore, useFakeAuthStore } from "@/stores/auth";
import { useEffect, useState } from "react";
import Loader from "./loader";
import AvatarDropdown from "./avatarDropdown";
import { BookOpenIcon } from "@heroicons/react/24/solid";
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
      <header className="bg-lime-400 font-sans text-lg">
        <nav className="mx-auto max-w-1xl px-6 lg:px-5" aria-label="Top">
          <div className="flex w-full items-center justify-between py-2">
            <div className="flex items-center">
              <Link href="/home">
                <span className="sr-only">Your Company</span>
                <Image
                  className="h-12 w-auto"
                  width={120}
                  height={78}
                  src="/logo2.png"
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
            
            <div className="flex items-center justify-end">
              <div className="mr-8">
                <SearchBar />
              </div>
              <div className="indicator mr-10">
                <span className="bg-lime-600 badge-info badge indicator-item pointer-events-none">
                  <p className="text-white">{totalLength}</p>
                </span>
                <Link href="/cart">
                  <BookOpenIcon className="h-8 w-8 text-accent-content" />
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
