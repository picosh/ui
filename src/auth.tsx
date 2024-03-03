import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { useLoader } from "starfx/react";
import { fetchUser, selectHasRegistered, useSelector } from "./api.ts";
import { signupUrl } from "./router.tsx";

export function AuthRequired({ children }: { children?: React.ReactNode }) {
  const hasRegistered = useSelector(selectHasRegistered);
  const navigate = useNavigate();
  const loader = useLoader(fetchUser);
  const location = useLocation();

  useEffect(() => {
    if (loader.isInitialLoading) return;
    if (loader.isLoading) return;
    if (!hasRegistered) {
      navigate(signupUrl(location.pathname));
      return;
    }
  }, [loader.status, hasRegistered]);

  return children || <Outlet />;
}
