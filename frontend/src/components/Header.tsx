import { useState } from "react";

const Header = () => {
  const [isConnected, setIsconnected] = useState(true);
  
  return (
    <header className="w-full border-b-4 border-black bg-blue-300 shadow-[4px_4px_0px_black]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        {/* Logo Section */}
        <div>
          <h1 className="text-4xl font-black tracking-tight text-black">
            Sportz<span className="text-white">~!</span>
          </h1>

          <p className="mt-1 text-sm font-medium text-zinc-800">
            Real-time match data demo
          </p>
        </div>

        {/* Status */}
        <div className="flex items-center gap-3 rounded-2xl border-4 border-black bg-white px-5 py-3 shadow-[4px_4px_0px_black]">
          <div
            className={`h-3 w-3 animate-pulse rounded-full   ${isConnected ? `bg-green-500` : `bg-red-500`}`}
          ></div>
          {isConnected ? (
            <span className="text-sm font-bold uppercase tracking-wide text-black">
              Live Connected
            </span>
          ) : (
            <span className="text-sm font-bold uppercase tracking-wide text-black">
              Live Disconnected
            </span>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
