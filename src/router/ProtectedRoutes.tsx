import { Outlet, useNavigate } from "react-router-dom";
import { Loader } from "@ucc/common-ui";
import { verifySessionTokens } from "@/utils/sessionGuard";
import { useEffect, useState } from "react";

export default function ProtectedRoutes() {
  const navigate = useNavigate();
  const [checkingSession, setCheckingSession] = useState(true);
  const [sessionValid, setSessionValid] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const ok = await verifySessionTokens(); // waits 2s
        if (!mounted) return;
        if (!ok) {
          // Redirect to login/root when tokens missing
          navigate("/login", { replace: true });
        } else {
          setSessionValid(true);
        }
      } catch {
        if (mounted) navigate("/login", { replace: true });
      } finally {
        if (mounted) setCheckingSession(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [navigate]);

  if (checkingSession) {
    return <Loader text="Verifying session..." />; // 2s loader while checking
  }

  if (!sessionValid) {
    // We triggered a redirect already; render nothing (or a minimal placeholder)
    return null;
  }
  return (
    <>
      <Outlet />
    </>
  );
}
