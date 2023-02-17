import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import { NotFound } from "./pages/NotFound";
import { Login } from "./pages/users/Login";
import { InGame } from "./pages/ingame/InGame";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "",
        element: <InGame />,
      },
      {
        path: "login",
        element: <Login />,
      },
    ],
    errorElement: <NotFound />,
  },
]);

export default router;
