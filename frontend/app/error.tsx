"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex w-full flex-col items-center space-y-4 py-24">
      <h2 className="text-lg font-semibold">Something went wrong</h2>
      <p className="text-muted-foreground text-sm">An unexpected error occurred.</p>
      <button
        onClick={reset}
        className="bg-brand hover:bg-brand-hover rounded-md px-4 py-2 text-sm text-white"
      >
        Try again
      </button>
      {process.env.NODE_ENV === "development" && (
        <details className="text-muted-foreground mt-4 max-w-lg text-xs">
          <summary className="cursor-pointer">Error details</summary>
          <pre className="mt-2 overflow-auto rounded bg-gray-100 p-3 dark:bg-gray-900">
            {error.message}
            {error.digest && `\nDigest: ${error.digest}`}
          </pre>
        </details>
      )}
    </div>
  );
}
