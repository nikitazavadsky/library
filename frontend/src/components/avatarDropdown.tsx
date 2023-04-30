import { useAuthStore } from "@/stores/auth";
import useCartStore from "@/stores/cart";
import Link from "next/link";
import Image from "next/image";

const AvatarDropdown = () => {
  const { signOut, user } = useAuthStore();
  const { clearCart } = useCartStore();

  const isAdmin = useAuthStore((state) => state.isAdmin());

  const handleSignOut = () => {
    signOut();
    clearCart();
  };

  return (
    <div className="dropdown-end dropdown">
      <label tabIndex={0} className="cursor-pointer">
      <Image
                  className="h-10 w-auto"
                  width={40}
                  height={40}
                  src="/profile.png"
                  alt="Profile icon"
                />
      </label>
      
      <ul
        tabIndex={0}
        className="dropdown-content menu rounded-box mt-4 w-52 bg-base-100 p-2 shadow-2xl"
      >
        <li
          onClick={() => {
            if (document.activeElement instanceof HTMLElement) {
              document.activeElement.blur();
            }
          }}
        >
          <Link href={"/profile"}>Profile</Link>
        </li>
        {!isAdmin && (
          <li
            onClick={() => {
              if (document.activeElement instanceof HTMLElement) {
                document.activeElement.blur();
              }
            }}
          >
            <Link href={"/orders"}>My Book Requests</Link>
          </li>
        )}
        {isAdmin && (
          <li
            onClick={() => {
              if (document.activeElement instanceof HTMLElement) {
                document.activeElement.blur();
              }
            }}
          >
            <Link href={"/admin"}>Admin Panel</Link>
          </li>
        )}
        <li>
          <button className="active:bg-error" onClick={() => handleSignOut()}>
            Sign Out
          </button>
        </li>
      </ul>
    </div>
  );
};

export default AvatarDropdown;
