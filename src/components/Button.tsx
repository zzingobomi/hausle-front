import React from "react";

interface IButtonProps {
  canClick: boolean;
  loading: boolean;
  actionText: string;
}

export const Button: React.FC<IButtonProps> = ({
  canClick,
  loading,
  actionText,
}) => (
  <div className="text-center mt-6">
    <button
      className={`panel-button ${
        canClick
          ? "bg-blue-500 hover:bg-blue-700"
          : "bg-gray-900 pointer-events-none"
      }`}
      type="submit"
      style={{ transition: "all .15s ease" }}
    >
      {loading ? "Loading..." : actionText}
    </button>
  </div>
);
