"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Cinema,
  BookingQuoteData,
  fetchCinemas,
  fetchBookingQuote,
  createCinema,
} from "../services/api";
import {
  Ticket,
  Users,
  Building2,
  CheckCircle2,
  XCircle,
  PlusCircle,
  AlertCircle,
  Layers,
  Sparkles,
  X,
} from "lucide-react";

export default function BookingView() {
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [selectedCinemaId, setSelectedCinemaId] = useState<number | null>(null);
  const [groupSize, setGroupSize] = useState<number>(6);
  const [quote, setQuote] = useState<BookingQuoteData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New Cinema Modal
  const [showAddCinema, setShowAddCinema] = useState(false);
  const [newCinemaName, setNewCinemaName] = useState("");
  const [newBundleSizes, setNewBundleSizes] = useState("2, 5");
  const [modalError, setModalError] = useState<string | null>(null);

  const loadCinemas = useCallback(async () => {
    try {
      const data = await fetchCinemas();
      setCinemas(data);
      if (data.length > 0 && selectedCinemaId === null) {
        setSelectedCinemaId(data[0]?.id ?? null);
      }
    } catch (err: unknown) {
      const errorObj = err as Error;
      setError(errorObj.message || "Failed to load cinemas");
    }
  }, [selectedCinemaId]);

  useEffect(() => {
    loadCinemas();
  }, [loadCinemas]);

  const handleGetQuote = useCallback(async (cinemaId: number, size: number) => {
    if (!cinemaId) return;
    if (isNaN(size) || size < 1 || size > 10000) {
      setError("Group size must be between 1 and 10,000.");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await fetchBookingQuote(cinemaId, size);
      setQuote(data);
    } catch (err: unknown) {
      const errorObj = err as Error;
      setError(errorObj.message || "Failed to calculate booking quote");
      setQuote(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedCinemaId && groupSize >= 1 && groupSize <= 10000) {
      handleGetQuote(selectedCinemaId, groupSize);
    }
  }, [selectedCinemaId, groupSize, handleGetQuote]);

  const handleCreateCinema = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    try {
      const parsedSizes = newBundleSizes
        .split(",")
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => !isNaN(n));

      if (parsedSizes.length === 0) {
        setModalError("Please provide at least 1 valid integer bundle size.");
        return;
      }

      const created = await createCinema({
        name: newCinemaName,
        bundle_sizes: parsedSizes,
      });

      setShowAddCinema(false);
      setNewCinemaName("");
      setNewBundleSizes("2, 5");
      await loadCinemas();
      setSelectedCinemaId(created.id);
    } catch (err: unknown) {
      const errorObj = err as Error;
      setModalError(errorObj.message || "Failed to create cinema");
    }
  };

  const presets = [
    { label: "Challenge Test 1: [1, 3, 4] for 6", cinemaName: "Stark Tower IMAX", size: 6 },
    { label: "Challenge Test 2: [2, 5] for 11", cinemaName: "Sanctum Sanctorum Cinema", size: 11 },
    { label: "Challenge Test 3: [6, 9, 20] for 44", cinemaName: "Wakanda Grand Multiplex", size: 44 },
    { label: "Challenge Test 4: [4, 6] for 7 (Impossible)", cinemaName: "Asgard Star Theater", size: 7 },
  ];

  const applyPreset = (preset: (typeof presets)[0]) => {
    const found = cinemas.find((c) => c.name.toLowerCase() === preset.cinemaName.toLowerCase());
    if (found) {
      setSelectedCinemaId(found.id);
      setGroupSize(preset.size);
    } else {
      setGroupSize(preset.size);
    }
  };

  const selectedCinema = cinemas.find((c) => c.id === selectedCinemaId);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-zinc-900/90 border border-zinc-800 p-6 rounded-2xl backdrop-blur-md">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Ticket className="w-6 h-6 text-amber-400" />
            Watch-Party Opening-Night Booking
          </h2>
          <p className="text-zinc-400 text-sm mt-1">
            Opening night tickets are sold strictly in fixed bundle packages. Calculate the exact fewest bundles with zero wasted seats.
          </p>
        </div>

        <button
          onClick={() => {
            setShowAddCinema(true);
            setModalError(null);
          }}
          className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-medium px-4 py-2.5 rounded-xl shadow-lg shadow-amber-950/40 transition-all cursor-pointer"
        >
          <PlusCircle className="w-5 h-5" />
          Add Cinema
        </button>
      </div>

      {/* Preset Challenge Tests */}
      <div className="bg-zinc-900/60 border border-zinc-800/80 p-4 rounded-2xl">
        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
          Assessment Challenge Test Presets:
        </span>
        <div className="flex flex-wrap gap-2">
          {presets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => applyPreset(p)}
              className="text-xs bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/70 text-zinc-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-950/60 border border-rose-700/60 text-rose-200 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Booking Form Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Parameters */}
        <div className="bg-zinc-900/90 border border-zinc-800 p-6 rounded-2xl space-y-5">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-zinc-800 pb-3">
            <Building2 className="w-5 h-5 text-amber-400" />
            Booking Configuration
          </h3>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">
              Choose Cinema Partner
            </label>
            <select
              value={selectedCinemaId || ""}
              onChange={(e) => setSelectedCinemaId(Number(e.target.value))}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              {cinemas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} (Bundles: {c.bundle_sizes.join(", ")})
                </option>
              ))}
            </select>

            {selectedCinema && (
              <div className="mt-2 text-xs text-zinc-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                Available Bundle Sizes:{" "}
                <span className="text-amber-300 font-semibold">
                  [{selectedCinema.bundle_sizes.join(", ")}]
                </span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">
              Watch Party Group Size (1 – 10,000 Seats)
            </label>
            <div className="relative">
              <input
                type="number"
                min={1}
                max={10000}
                value={groupSize}
                onChange={(e) => setGroupSize(parseInt(e.target.value, 10) || 1)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3.5 py-2.5 pl-10 text-white text-sm focus:outline-none focus:border-amber-500"
              />
              <Users className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Every single seat must be filled; no empty bundle seats allowed.
            </p>
          </div>
        </div>

        {/* Calculation Result */}
        <div className="bg-zinc-900/90 border border-zinc-800 p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-zinc-800 pb-3">
              <Sparkles className="w-5 h-5 text-amber-400" />
              Optimal Bundle Quote
            </h3>

            {loading ? (
              <div className="py-12 flex justify-center items-center text-zinc-400 text-sm">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-400 mr-2"></div>
                Calculating fewest bundles using Dynamic Programming...
              </div>
            ) : quote ? (
              <div className="mt-4">
                {quote.possible ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-emerald-950/50 border border-emerald-800/80 rounded-xl">
                      <div className="flex items-center gap-2 text-emerald-300 font-bold text-base mb-1">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        Exact Match Found!
                      </div>
                      <div className="text-2xl font-black text-white font-mono mt-1">
                        {quote.formatted}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-xs uppercase font-semibold text-zinc-400 tracking-wider">
                        Bundle Breakdown:
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        {quote.breakdown?.map((item) => (
                          <div
                            key={item.bundle_size}
                            className="bg-zinc-800/80 border border-zinc-700/60 p-3 rounded-xl flex justify-between items-center"
                          >
                            <div>
                              <span className="text-xs text-zinc-400 block">Bundle Size</span>
                              <span className="font-bold text-white text-base">
                                {item.bundle_size} seats
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-xs text-zinc-400 block">Quantity</span>
                              <span className="font-bold text-amber-400 text-base">
                                × {item.quantity}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="text-xs text-zinc-400 pt-2 border-t border-zinc-800 flex justify-between">
                      <span>Total Bundles: <strong className="text-white">{quote.total_bundles}</strong></span>
                      <span>Total Seats: <strong className="text-white">{quote.group_size}</strong></span>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 bg-rose-950/40 border border-rose-800/60 rounded-xl text-center space-y-2 mt-4">
                    <XCircle className="w-10 h-10 text-rose-400 mx-auto" />
                    <h4 className="text-rose-200 font-bold text-lg">Not Possible</h4>
                    <p className="text-xs text-rose-300/80 max-w-xs mx-auto">
                      No exact combination of bundles [{selectedCinema?.bundle_sizes.join(", ")}] can sum up to exactly {quote.group_size} seats without leaving empty seats.
                    </p>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Add Cinema Modal */}
      {showAddCinema && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-400" />
                Add Cinema Partner
              </h3>
              <button
                onClick={() => setShowAddCinema(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreateCinema} className="space-y-4 text-sm">
              <div>
                <label className="block text-zinc-300 font-medium mb-1">Cinema Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Avengers Campus Cinema"
                  value={newCinemaName}
                  onChange={(e) => setNewCinemaName(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">
                  Bundle Sizes (Comma-separated) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2, 5, 10"
                  value={newBundleSizes}
                  onChange={(e) => setNewBundleSizes(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-500 font-mono text-sm"
                />
                <p className="text-xs text-zinc-500 mt-1">
                  Between 1 and 10 different bundle sizes, each 1 to 500 seats.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowAddCinema(false)}
                  className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl shadow-lg cursor-pointer transition-colors"
                >
                  Create Cinema
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
