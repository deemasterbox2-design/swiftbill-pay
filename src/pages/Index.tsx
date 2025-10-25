// File: Index.tsx | Path: src/pages/Index.tsx
// Function: Root index page that redirects to home page
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/home");
  }, [navigate]);

  return (
    <div className="bg-muted/50 text-xs text-muted-foreground text-center py-1 px-2">
      File: src/pages/Index.tsx
    </div>
  );
};

export default Index;
