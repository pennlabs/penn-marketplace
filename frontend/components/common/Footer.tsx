import { HeartIcon } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="text-center text-sm text-gray-600 pb-6">
      Made with <HeartIcon className="w-4 h-4 inline-block text-red-400 fill-red-400" /> by <a href="https://pennlabs.org" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Penn Labs</a>
    </footer>
  );
};