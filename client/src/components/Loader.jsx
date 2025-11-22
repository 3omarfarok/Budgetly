import { Loader2 } from "lucide-react";

const Loader = ({ text = "بنحمّل..." }) => {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-[50vh] w-full p-8"
      role="status"
      aria-live="polite"
    >
      <div className="relative">
        <div className="absolute inset-0 bg-ios-primary/20 blur-xl rounded-full animate-pulse"></div>
        <Loader2 className="w-12 h-12 text-ios-primary animate-spin relative z-10" />
      </div>
      <p className="mt-4 text-ios-secondary font-medium animate-pulse">
        {text}
      </p>
    </div>
  );
};

export default Loader;
