"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Movie,
  RewatchOrderData,
  fetchMovies,
  fetchRewatchOrder,
  updateMovie,
} from "../services/api";
import {
  ListOrdered,
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  PlaySquare,
  Film,
} from "lucide-react";

export default function RewatchPlanView({ refreshTrigger }: { refreshTrigger?: number }) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);
  const [rewatchData, setRewatchData] = useState<RewatchOrderData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRewatchOrder = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchRewatchOrder(id);
      setRewatchData(data);
    } catch (err: unknown) {
      const errorObj = err as Error;
      setError(errorObj.message || "Failed to calculate rewatch order");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadList = async () => {
      try {
        const data = await fetchMovies();
        if (!isMounted) return;
        setMovies(data);
        if (data.length > 0 && selectedMovieId === null) {
          const doomsday = data.find((m) => m.title.toLowerCase().includes("doomsday"));
          const defaultId = doomsday ? doomsday.id : (data[data.length - 1]?.id ?? null);
          setSelectedMovieId(defaultId);
        }
      } catch (err: unknown) {
        if (!isMounted) return;
        const errorObj = err as Error;
        setError(errorObj.message || "Failed to load movies");
      }
    };
    loadList();
    return () => {
      isMounted = false;
    };
  }, [refreshTrigger, selectedMovieId]);

  useEffect(() => {
    if (selectedMovieId) {
      loadRewatchOrder(selectedMovieId);
    }
  }, [selectedMovieId, loadRewatchOrder]);

  const handleToggleWatchedInPlan = async (movie: Movie) => {
    try {
      await updateMovie(movie.id, { watched: !movie.watched });
      if (selectedMovieId) {
        await loadRewatchOrder(selectedMovieId);
      }
    } catch (err: unknown) {
      const errorObj = err as Error;
      setError(errorObj.message || "Failed to update watched status");
    }
  };

  const progressPercent =
    rewatchData && rewatchData.total_prerequisites > 0
      ? Math.round((rewatchData.watched_count / rewatchData.total_prerequisites) * 100)
      : rewatchData && rewatchData.total_prerequisites === 0
      ? 100
      : 0;

  return (
    <div className="space-y-6">
      {/* Header Selector */}
      <div className="bg-zinc-900/90 border border-zinc-800 p-6 rounded-2xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <ListOrdered className="w-6 h-6 text-indigo-400" />
              MCU Rewatch Order Planner
            </h2>
            <p className="text-zinc-400 text-sm mt-1">
              Select your target MCU premiere. Our custom topological resolver builds the optimal linear watch order.
            </p>
          </div>

          <div className="w-full sm:w-auto flex items-center gap-3">
            <label className="text-sm font-medium text-zinc-300 flex-shrink-0">
              Target Movie:
            </label>
            <select
              value={selectedMovieId || ""}
              onChange={(e) => setSelectedMovieId(Number(e.target.value))}
              className="w-full sm:w-64 bg-zinc-800 text-white font-medium border border-zinc-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              {movies.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title} ({m.release_year})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-950/60 border border-rose-700/60 text-rose-200 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20 text-zinc-400">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400 mr-3"></div>
          Calculating prerequisites and topological sort...
        </div>
      ) : rewatchData ? (
        <div className="space-y-6">
          {/* Progress & Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Progress Card */}
            <div className="bg-zinc-900/90 border border-zinc-800 p-5 rounded-2xl flex flex-col justify-between">
              <div>
                <span className="text-xs uppercase font-semibold text-zinc-400 tracking-wider">
                  Rewatch Progress
                </span>
                <div className="text-2xl font-bold text-white mt-1">
                  {rewatchData.watched_count} of {rewatchData.total_prerequisites} watched
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-xs text-zinc-400 mb-1.5">
                  <span>Completion</span>
                  <span className="font-semibold text-indigo-400">{progressPercent}%</span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Remaining Runtime */}
            <div className="bg-zinc-900/90 border border-zinc-800 p-5 rounded-2xl flex flex-col justify-between">
              <div>
                <span className="text-xs uppercase font-semibold text-zinc-400 tracking-wider">
                  Remaining Watch Time
                </span>
                <div className="text-2xl font-bold text-amber-400 mt-1 flex items-center gap-2">
                  <Clock className="w-6 h-6 text-amber-400" />
                  {rewatchData.remaining_runtime_minutes} mins
                </div>
              </div>
              <div className="text-xs text-zinc-400 mt-3">
                (~{(rewatchData.remaining_runtime_minutes / 60).toFixed(1)} hours needed across{" "}
                {rewatchData.unwatched_count} unwatched films)
              </div>
            </div>

            {/* Target Status */}
            <div className="bg-zinc-900/90 border border-zinc-800 p-5 rounded-2xl flex flex-col justify-between">
              <div>
                <span className="text-xs uppercase font-semibold text-zinc-400 tracking-wider">
                  Premiere Target
                </span>
                <div className="text-xl font-bold text-white mt-1 truncate">
                  {rewatchData.target_movie.title}
                </div>
              </div>
              <div className="mt-3">
                {rewatchData.unwatched_count === 0 ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-1 rounded-lg">
                    <ShieldCheck className="w-4 h-4" /> Ready for Doomsday Premiere!
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-300 bg-indigo-950/60 border border-indigo-800/80 px-2.5 py-1 rounded-lg">
                    <PlaySquare className="w-4 h-4" /> Catch-up in progress
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Sequential Order List */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              Optimal Watch Order
            </h3>
            <p className="text-zinc-400 text-xs mb-6">
              Watch from Step 1 through to the end. Every prerequisite is satisfied before you reach dependent titles.
            </p>

            {rewatchData.rewatch_order.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 bg-zinc-800/30 rounded-xl border border-zinc-800">
                <Film className="w-8 h-8 mx-auto text-zinc-600 mb-2" />
                This movie has no prerequisites! You can dive straight into it without catching up on earlier movies.
              </div>
            ) : (
              <div className="space-y-3">
                {rewatchData.rewatch_order.map((movie, index) => (
                  <div
                    key={movie.id}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                      movie.watched
                        ? "bg-zinc-900/50 border-zinc-800 text-zinc-400"
                        : "bg-zinc-800/70 border-zinc-700/80 text-white shadow-md"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Step Number Badge */}
                      <span
                        className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${
                          movie.watched
                            ? "bg-emerald-900/40 text-emerald-300 border border-emerald-800"
                            : "bg-indigo-600/30 text-indigo-300 border border-indigo-500/50"
                        }`}
                      >
                        {index + 1}
                      </span>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4
                            className={`font-semibold text-sm ${
                              movie.watched ? "line-through text-zinc-500" : "text-white"
                            }`}
                          >
                            {movie.title}
                          </h4>
                          <span className="text-xs text-zinc-500">({movie.release_year})</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-zinc-500" />
                            {movie.runtime} mins
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleWatchedInPlan(movie)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                          movie.watched
                            ? "bg-emerald-950/60 text-emerald-300 border border-emerald-800 hover:bg-emerald-900/60"
                            : "bg-zinc-700 hover:bg-zinc-600 text-zinc-200"
                        }`}
                      >
                        {movie.watched ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            Watched
                          </>
                        ) : (
                          <>
                            <Circle className="w-4 h-4 text-zinc-400" />
                            Mark Watched
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}

                {/* Final Target Banner */}
                <div className="mt-6 p-4 rounded-xl border border-dashed border-indigo-500/50 bg-indigo-950/20 flex items-center justify-between text-indigo-300">
                  <div className="flex items-center gap-3">
                    <ArrowRight className="w-5 h-5 text-indigo-400" />
                    <div>
                      <span className="text-xs uppercase font-semibold text-indigo-400">
                        Final Destination:
                      </span>
                      <h4 className="font-bold text-white text-base">
                        {rewatchData.target_movie.title}
                      </h4>
                    </div>
                  </div>
                  <span className="text-xs font-medium bg-indigo-500/20 px-3 py-1 rounded-full border border-indigo-500/30">
                    Watch in Cinema
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
