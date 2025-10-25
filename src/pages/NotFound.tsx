// File: NotFound.tsx | Path: src/pages/NotFound.tsx
// Function: 404 error page for non-existent routes
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-gray-100">
      <div className="bg-muted/50 text-xs text-muted-foreground text-center py-1 px-2">
        File: src/pages/NotFound.tsx
      </div>
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold">404</h1>
          <p className="mb-4 text-xl text-gray-600">Oops! Page not found</p>
          <a href="/" className="text-blue-500 underline hover:text-blue-700">
            Return to Home
          </a>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
