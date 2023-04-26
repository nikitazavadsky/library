import { useAuthStore } from "@/stores/auth";
import useCartStore from "@/stores/cart";
import Link from "next/link";

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
        <div className="initials flex h-10 w-10 items-center justify-center rounded bg-white text-xl">
          {user?.first_name ? user?.first_name[0] : ""}
          {user?.last_name ? user?.last_name[0] : ""}
        </div>
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
        <li
          onClick={() => {
            if (document.activeElement instanceof HTMLElement) {
              document.activeElement.blur();
            }
          }}
        >
          <Link href={"/orders"}>My Book Requests</Link>
        </li>
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
