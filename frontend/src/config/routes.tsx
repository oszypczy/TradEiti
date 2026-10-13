import { Navigate } from "react-router-dom";
import { Home } from "../pages/Home";
import { Login } from "../pages/Login";
import { Register } from "../pages/Register";
import { UsosConnect } from "../pages/UsosConnect";
import { Market } from "../pages/Market";
import { MyOffers } from "../pages/MyOffers";
import { AddOffer } from "../pages/AddOffer";
import { Requests } from "../pages/Requests";
import { Finalized } from "../pages/Finalized";
import { Chat } from "../pages/Chat";
import { Courses } from "../pages/Courses";
import { Profile } from "../pages/Profile";
import { EditProfile } from "../pages/EditProfile";

export const routes = [
  { path: "/", element: <Home /> },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/usos-connect", element: <UsosConnect /> },
  { path: "/offers", element: <Market /> },
  { path: "/fittingOffers", element: <Navigate to="/offers?tab=fit" replace /> },
  { path: "/myOffers", element: <MyOffers /> },
  { path: "/myOffers/new", element: <AddOffer /> },
  { path: "/offerRequests", element: <Requests /> },
  { path: "/finalizedOffers", element: <Finalized /> },
  { path: "/finalizedOffers/:offerId", element: <Chat /> },
  { path: "/courses", element: <Courses /> },
  { path: "/userPage", element: <Profile /> },
  { path: "/modifyUser", element: <EditProfile /> },
  { path: "*", element: <Navigate to="/" replace /> },
];
