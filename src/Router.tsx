import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import { NotFound } from "./pages/NotFound";
import { Login } from "./pages/users/Login";
import { InGame } from "./pages/ingame/InGame";
import { CreateAccount } from "./pages/users/CreateAccount";
import { GuestLogin } from "./pages/users/GuestLogin";

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
        path: "dungeon",
        element: <InGame />,
      },
    ],
    errorElement: <NotFound />,
  },
]);

export default router;
