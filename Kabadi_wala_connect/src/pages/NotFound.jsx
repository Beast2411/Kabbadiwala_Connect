import React from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { FaHome } from "react-icons/fa";

export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 max-w-md mx-auto">
      <Card className="p-8 text-center space-y-4">
        <div className="text-6xl">🧭</div>
        <h2 className="text-2xl font-extrabold text-gray-900">Page Not Found</h2>
        <p className="text-sm text-gray-600">
          The page you are looking for does not exist or has been moved.
        </p>
        <Button onClick={() => navigate("/dashboard")} variant="primary" icon={FaHome}>
          Return to Dashboard
        </Button>
      </Card>
    </div>
  );
};
