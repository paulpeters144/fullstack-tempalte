import type { LinksFunction } from "@remix-run/node";
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "@remix-run/react";

import "./tailwind.css";

export const links: LinksFunction = () => [
   { rel: "preconnect", href: "https://fonts.googleapis.com" },
   {
      rel: "preconnect",
      href: "https://fonts.gstatic.com",
      crossOrigin: "anonymous",
   },
   {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
   },
];

export function Layout({ children }: { children: React.ReactNode }) {
   return (
      <html lang="en">
         <head>
            <meta charSet="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <Meta />
            <Links />
         </head>
         <body>
            {children}
            <ScrollRestoration />
            <Scripts />
         </body>
      </html>
   );
}

export default function App() {
   return <Outlet />;
}

export function HydrateFallback() {
   return (
      <div className="min-h-screen flex items-center justify-center p-4">
         <div className="flex flex-col items-center space-y-6 bg-white border-2 border-gray-300 rounded-lg p-8 sm:p-12 max-w-sm w-full transform transition-all duration-300 ease-in-out scale-100 animate-fade-in">
            <div className="flex space-x-3">
               <div className="w-4 h-4 bg-black rounded-full animate-pulse-delay-1" />
               <div className="w-4 h-4 bg-black rounded-full animate-pulse-delay-2" />
               <div className="w-4 h-4 bg-black rounded-full animate-pulse-delay-3" />
            </div>
            <p className="text-xl sm:text-2xl font-semibold text-gray-800 tracking-wide animate-fade-in-text">
               Loading Content...
            </p>
         </div>

         <style>
            {`
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(0.75); }
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }

          @keyframes fadeInText {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          .animate-pulse-delay-1 {
            animation: pulse 1.5s infinite ease-in-out;
          }
          .animate-pulse-delay-2 {
            animation: pulse 1.5s infinite ease-in-out 0.2s; /* 0.2s delay */
          }
          .animate-pulse-delay-3 {
            animation: pulse 1.5s infinite ease-in-out 0.4s; /* 0.4s delay */
          }
          .animate-fade-in {
            animation: fadeIn 0.8s ease-out forwards;
          }
          .animate-fade-in-text {
            animation: fadeInText 1s ease-out forwards 0.5s; /* Delay text fade-in slightly */
          }
        `}
         </style>
      </div>
   );
}
