import { HeartIcon } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="pb-6 text-center text-sm text-gray-600">
      Made with <HeartIcon className="inline-block h-4 w-4 fill-red-400 text-red-400" /> by{" "}
      <a
        href="https://pennlabs.org"
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline"
      >
        Penn Labs
      </a>
    </footer>
  );
};
