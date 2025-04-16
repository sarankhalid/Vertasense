"use client";

interface DocumentLoadingStateProps {
  message?: string;
}

export function DocumentLoadingState({
  message = "Loading documents for the selected certificate...",
}: DocumentLoadingStateProps) {
  return (
    <div className="flex items-center justify-center h-64 bg-white rounded-lg shadow">
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
