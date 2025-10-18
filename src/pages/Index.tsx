// File: Index.tsx | Path: src/pages/Index.tsx
// Function: Root index page that redirects to home page
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/home");
  }, [navigate]);

  return null;
};

export default Index;
