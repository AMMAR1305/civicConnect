import { Navigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const ProtectedRoute = ({ children, role }) => {
  const location = useLocation();
  const token = localStorage.getItem("token");

  // Not logged in
  if (!token) {
    return (
      <Navigate
        to="/"
        state={{ message: "Please login to continue", from: location.pathname }}
        replace
      />
    );
  }

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;

    // Token expired
    if (decoded.exp < currentTime) {
      localStorage.clear();
      return (
        <Navigate
          to="/"
          state={{ message: "Session expired. Please login again." }}
          replace
        />
      );
    }

    // Role mismatch
    if (role && decoded.Role !== role) {
      return (
        <Navigate
          to="/"
          state={{ message: "Access denied. Unauthorized role." }}
          replace
        />
      );
    }

    return children;
  } catch (err) {
    localStorage.clear();
    return (
      <Navigate
        to="/"
        state={{ message: "Authentication error. Please login again." }}
        replace
      />
    );
  }
};

export default ProtectedRoute;
