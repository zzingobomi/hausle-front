import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authTokenVar, isLoggedInVar } from "../../apollo";
import { LOCALSTORAGE_TOKEN } from "../../constants";

export const SocialLoginSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      localStorage.setItem(LOCALSTORAGE_TOKEN, token);
      authTokenVar(token);
      isLoggedInVar(true);
      navigate("/dungeon");
    }
  }, [searchParams, navigate]);

  return <div>social login</div>;
};
