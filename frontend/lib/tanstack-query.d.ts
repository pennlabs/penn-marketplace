import "@tanstack/react-query";

// TanStack Query types meta as Record<string, unknown>, so suppressErrorToast would need a type
// assertion everywhere. The .d.ts file uses TanStack Query's Register interface to tell TypeScript that
// mutationMeta includes { suppressErrorToast?: boolean }. This gives you autocomplete and type safety when
// setting meta on any mutation.
declare module "@tanstack/react-query" {
  interface Register {
    mutationMeta: { suppressErrorToast?: boolean };
  }
}
