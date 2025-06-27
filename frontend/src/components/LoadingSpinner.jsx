import React from "react";
import { Loader2 } from "lucide-react";

const LoadingSpinner = ({
  size = "md",
  text = "جاري التحميل...",
  className = "",
  fullScreen = false,
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  const spinnerComponent = (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex flex-col items-center space-y-3">
        <Loader2
          className={`${sizeClasses[size]} text-blue-600 animate-spin`}
        />
        {text && <p className="text-gray-600 text-sm font-medium">{text}</p>}
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        {spinnerComponent}
      </div>
    );
  }

  return spinnerComponent;
};

export default LoadingSpinner;
