import ErrorMessage from "@/components/errorMessage";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAuthStore } from "./auth";

const withAuth = <P extends Record<string, unknown>>(
  WrappedComponent: React.FC<P>
): React.FC<P> => {
  const AuthWrapper: React.FC<P> = (props) => {
    const router = useRouter();
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
      if (!isHydrated) {
        setIsHydrated(true);
      }
    }, [isHydrated]);

    useEffect(() => {
      if (!isAuthenticated && isHydrated) {
        void router.replace("/home");
      }
    }, [isAuthenticated, router, isHydrated]);

    if (isAuthenticated && isHydrated) {
      return <WrappedComponent {...props} />;
    } else {
      return <ErrorMessage error="You are not authorized to view this page" />;
    }
  };

  return AuthWrapper;
};

export default withAuth;
