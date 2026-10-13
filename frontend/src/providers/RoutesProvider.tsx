import { Route, Routes } from "react-router-dom";
import { routes } from "../config/routes";

// Provider for routes mapping to components
export const RoutesProvider = () => {
  return (
    <Routes>
      {routes.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}
    </Routes>
  );
};
