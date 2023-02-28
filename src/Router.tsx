import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "./App";
import { NotFound } from "./pages/NotFound";
import { Login } from "./pages/users/Login";
import { InGame } from "./pages/ingame/InGame";
import { CreateAccount } from "./pages/users/CreateAccount";
import { GuestLogin } from "./pages/users/GuestLogin";
import { ProtectedRoute } from "./pages/ProtectedRoute";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "",
        element: <Login />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "guest-login",
        element: <GuestLogin />,
      },
      {
        path: "create-account",
        element: <CreateAccount />,
      },
      {
        path: "google-oauth-success-redirect",
        element: <Navigate replace to="/guest-login" />,
      },
      {
        path: "dungeon",
        element: (
          <ProtectedRoute>
            <InGame />
          </ProtectedRoute>
        ),
      },
    ],
    errorElement: <NotFound />,
  },
]);

export default router;
