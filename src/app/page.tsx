"use client";

import React, { useState } from "react";
import MoviesView from "@/components/MoviesView";
import RewatchPlanView from "@/components/RewatchPlanView";
import BookingView from "@/components/BookingView";
import { Film, ListOrdered, Ticket, ShieldAlert } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"movies" | "rewatch" | "booking">("movies");
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const handleMovieUpdated = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-emerald-500 selection:text-black">
      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 via-amber-600 to-indigo-600 p-0.5 shadow-lg shadow-red-950/50">
              <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-red-500" />
              </div>
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                DOOMSDAY READY
              </span>
              <span className="text-[10px] block font-mono uppercase tracking-widest text-emerald-400">
                Avengers Rewatch & Booking
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-zinc-900/90 p-1.5 rounded-xl border border-zinc-800">
            <button
              onClick={() => setActiveTab("movies")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                activeTab === "movies"
                  ? "bg-emerald-500 text-zinc-950 font-semibold shadow-md"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
              }`}
            >
              <Film className="w-4 h-4" />
              <span>1. Movies</span>
            </button>

            <button
              onClick={() => setActiveTab("rewatch")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                activeTab === "rewatch"
                  ? "bg-indigo-500 text-white font-semibold shadow-md"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
              }`}
            >
              <ListOrdered className="w-4 h-4" />
              <span>2. Rewatch Plan</span>
            </button>

            <button
              onClick={() => setActiveTab("booking")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                activeTab === "booking"
                  ? "bg-amber-500 text-zinc-950 font-semibold shadow-md"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
              }`}
            >
              <Ticket className="w-4 h-4" />
              <span>3. Watch Party Booking</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "movies" && (
          <MoviesView onMovieUpdated={handleMovieUpdated} />
        )}
        {activeTab === "rewatch" && (
          <RewatchPlanView refreshTrigger={refreshKey} />
        )}
        {activeTab === "booking" && <BookingView />}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-zinc-900 py-8 text-center text-xs text-zinc-500">
        <p>Blinto Talent Accelerator 2027 Full-Stack Assessment — Doomsday Ready</p>
        <p className="mt-1 text-zinc-600">Built with Next.js, Node.js Express, TypeScript, and PostgreSQL</p>
      </footer>
    </div>
  );
}
