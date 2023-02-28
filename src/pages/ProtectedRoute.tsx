import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useReactiveVar } from "@apollo/client";
import { isLoggedInVar } from "../apollo";

type ProtectedRouteProps = {
  children: ReactNode;
};

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const isLoggedIn = useReactiveVar(isLoggedInVar);

  if (!isLoggedIn) {
    alert("로그인이 필요한 서비스입니다.");
    return <Navigate to="/login" />;
  }
  return <>{children}</>;
};
