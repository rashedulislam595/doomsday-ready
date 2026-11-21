"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Movie,
  fetchMovies,
  createMovie,
  updateMovie,
  ApiCustomError,
} from "../services/api";
import {
  Film,
  PlusCircle,
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  AlertTriangle,
  Edit2,
  X,
  Save,
  Layers,
} from "lucide-react";

export default function MoviesView({ onMovieUpdated }: { onMovieUpdated?: () => void }) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Add Movie Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newYear, setNewYear] = useState<number>(2025);
  const [newRuntime, setNewRuntime] = useState<number>(120);
  const [newPrereqs, setNewPrereqs] = useState<number[]>([]);

  // Edit Prerequisites Modal
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [editPrereqs, setEditPrereqs] = useState<number[]>([]);
  const [modalError, setModalError] = useState<string | null>(null);

  const loadMovies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchMovies();
      setMovies(data);
    } catch (err: unknown) {
      const errorObj = err as Error;
      setError(errorObj.message || "Failed to load movies");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMovies();
  }, [loadMovies]);

  const handleToggleWatched = async (movie: Movie) => {
    try {
      const updated = await updateMovie(movie.id, { watched: !movie.watched });
      setMovies((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
      if (onMovieUpdated) onMovieUpdated();
    } catch (err: unknown) {
      const errorObj = err as Error;
      setError(errorObj.message || "Failed to update watched status");
    }
  };

  const handleCreateMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    try {
      await createMovie({
        title: newTitle,
        release_year: Number(newYear),
        runtime: Number(newRuntime),
        prerequisites: newPrereqs,
        watched: false,
      });
      setSuccessMsg("Movie created successfully!");
      setTimeout(() => setSuccessMsg(null), 3000);
      setShowAddModal(false);
      setNewTitle("");
      setNewYear(2025);
      setNewRuntime(120);
      setNewPrereqs([]);
      loadMovies();
      if (onMovieUpdated) onMovieUpdated();
    } catch (err: unknown) {
      const errorObj = err as Error;
      setModalError(errorObj.message || "Failed to create movie");
    }
  };

  const handleOpenEditPrereqs = (movie: Movie) => {
    setEditingMovie(movie);
    setEditPrereqs(movie.prerequisites || []);
    setModalError(null);
  };

  const handleSavePrerequisites = async () => {
    if (!editingMovie) return;
    setModalError(null);
    try {
      const updated = await updateMovie(editingMovie.id, {
        prerequisites: editPrereqs,
      });
      setMovies((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
      setSuccessMsg(`Prerequisites updated for ${editingMovie.title}`);
      setTimeout(() => setSuccessMsg(null), 3000);
      setEditingMovie(null);
      if (onMovieUpdated) onMovieUpdated();
    } catch (err: unknown) {
      const apiErr = err as ApiCustomError;
      if (apiErr.code === "CIRCULAR_DEPENDENCY" || apiErr.status === 409) {
        setModalError("❌ 409 CIRCULAR_DEPENDENCY: A movie cannot depend on itself directly or indirectly!");
      } else {
        setModalError(apiErr.message || "Failed to update prerequisites");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-zinc-900/90 border border-zinc-800 p-6 rounded-2xl backdrop-blur-md">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Film className="w-6 h-6 text-emerald-400" />
            Marvel Cinematic Universe Catalog
          </h2>
          <p className="text-zinc-400 text-sm mt-1">
            Manage MCU movies, customize watch dependencies, and mark off your rewatch progress.
          </p>
        </div>
        <button
          onClick={() => {
            setShowAddModal(true);
            setModalError(null);
          }}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
        >
          <PlusCircle className="w-5 h-5" />
          Add Movie
        </button>
      </div>

      {/* Global Alerts */}
      {successMsg && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-700/60 text-emerald-200 rounded-xl text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          {successMsg}
        </div>
      )}
      {error && (
        <div className="p-4 bg-rose-950/60 border border-rose-700/60 text-rose-200 rounded-xl text-sm flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Movies Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20 text-zinc-400">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400 mr-3"></div>
          Loading MCU movies...
        </div>
      ) : movies.length === 0 ? (
        <div className="text-center py-16 bg-zinc-900/40 rounded-2xl border border-zinc-800 text-zinc-500">
          No movies found. Click &quot;Add Movie&quot; above to add your first movie!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {movies.map((movie) => {
            return (
              <div
                key={movie.id}
                className={`flex flex-col justify-between p-5 rounded-2xl border transition-all ${
                  movie.watched
                    ? "bg-zinc-900/40 border-zinc-800/80 opacity-80"
                    : "bg-zinc-900/90 border-zinc-700/60 shadow-xl"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="font-semibold text-lg text-white leading-snug">
                      {movie.title}
                    </h3>
                    <button
                      onClick={() => handleToggleWatched(movie)}
                      title={movie.watched ? "Mark as unwatched" : "Mark as watched"}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer flex-shrink-0 ${
                        movie.watched
                          ? "text-emerald-400 bg-emerald-950/50 hover:bg-emerald-900/60"
                          : "text-zinc-500 hover:text-zinc-300 bg-zinc-800/50"
                      }`}
                    >
                      {movie.watched ? (
                        <CheckCircle2 className="w-6 h-6" />
                      ) : (
                        <Circle className="w-6 h-6" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-zinc-400 mb-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                      {movie.release_year}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-zinc-500" />
                      {movie.runtime} mins
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[11px] font-medium ${
                        movie.watched
                          ? "bg-emerald-900/40 text-emerald-300 border border-emerald-800/40"
                          : "bg-amber-900/30 text-amber-300 border border-amber-800/40"
                      }`}
                    >
                      {movie.watched ? "Watched" : "Unwatched"}
                    </span>
                  </div>

                  {/* Prerequisites tags */}
                  <div className="mb-4">
                    <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2 flex items-center gap-1">
                      <Layers className="w-3 h-3" />
                      Watch First:
                    </div>
                    {movie.prerequisite_details && movie.prerequisite_details.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {movie.prerequisite_details.map((p) => (
                          <span
                            key={p.id}
                            className="bg-zinc-800 text-zinc-300 text-xs px-2.5 py-1 rounded-lg border border-zinc-700/60"
                          >
                            {p.title}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-zinc-600 italic">None (Stand-alone entry)</span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-800/80 flex justify-between items-center text-xs">
                  <span className="text-zinc-500">ID: #{movie.id}</span>
                  <button
                    onClick={() => handleOpenEditPrereqs(movie)}
                    className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-medium py-1 px-2.5 rounded-lg hover:bg-cyan-950/40 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit Prerequisites
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Movie Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-emerald-400" />
                Add New MCU Movie
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-xl text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreateMovie} className="space-y-4 text-sm">
              <div>
                <label className="block text-zinc-300 font-medium mb-1">Movie Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shang-Chi and the Legend of the Ten Rings"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">
                    Release Year (1800-2100) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1800}
                    max={2100}
                    value={newYear}
                    onChange={(e) => setNewYear(parseInt(e.target.value, 10))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">
                    Runtime (1-300 mins) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={300}
                    value={newRuntime}
                    onChange={(e) => setNewRuntime(parseInt(e.target.value, 10))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">
                  Prerequisites (Watch These First)
                </label>
                <p className="text-zinc-500 text-xs mb-2">
                  Select which movies should be seen before this one.
                </p>
                <div className="max-h-48 overflow-y-auto space-y-1 bg-zinc-800/60 p-2.5 rounded-xl border border-zinc-700/60">
                  {movies.map((m) => (
                    <label
                      key={m.id}
                      className="flex items-center gap-2 p-1.5 hover:bg-zinc-700/40 rounded-lg cursor-pointer text-xs text-zinc-300"
                    >
                      <input
                        type="checkbox"
                        checked={newPrereqs.includes(m.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewPrereqs((prev) => [...prev, m.id]);
                          } else {
                            setNewPrereqs((prev) => prev.filter((id) => id !== m.id));
                          }
                        }}
                        className="rounded accent-emerald-500"
                      />
                      <span>
                        {m.title} ({m.release_year})
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl shadow-lg cursor-pointer transition-colors"
                >
                  Create Movie
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Prerequisites Modal */}
      {editingMovie && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Edit2 className="w-5 h-5 text-cyan-400" />
                  Edit Prerequisites
                </h3>
                <p className="text-zinc-400 text-xs mt-0.5">
                  Movie: <span className="text-cyan-300 font-semibold">{editingMovie.title}</span>
                </p>
              </div>
              <button
                onClick={() => setEditingMovie(null)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-rose-950/80 border border-rose-700 text-rose-200 rounded-xl text-xs flex items-center gap-2 font-mono">
                <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                {modalError}
              </div>
            )}

            <div className="text-sm">
              <label className="block text-zinc-300 font-medium mb-1">
                Select Movies to Watch First:
              </label>
              <p className="text-zinc-500 text-xs mb-2">
                Note: Creating a circular dependency (e.g. A depends on B and B depends on A) will trigger a 409 CIRCULAR_DEPENDENCY rejection.
              </p>

              <div className="max-h-60 overflow-y-auto space-y-1.5 bg-zinc-800/60 p-3 rounded-xl border border-zinc-700/60">
                {movies
                  .filter((m) => m.id !== editingMovie.id)
                  .map((m) => {
                    const isChecked = editPrereqs.includes(m.id);
                    return (
                      <label
                        key={m.id}
                        className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer text-xs transition-colors ${
                          isChecked
                            ? "bg-cyan-950/50 text-cyan-200 border border-cyan-800/60"
                            : "hover:bg-zinc-700/40 text-zinc-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setEditPrereqs((prev) => [...prev, m.id]);
                            } else {
                              setEditPrereqs((prev) => prev.filter((id) => id !== m.id));
                            }
                          }}
                          className="rounded accent-cyan-500"
                        />
                        <span className="font-medium">{m.title}</span>
                        <span className="text-zinc-500 ml-auto">({m.release_year})</span>
                      </label>
                    );
                  })}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setEditingMovie(null)}
                className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePrerequisites}
                className="flex items-center gap-2 px-5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-medium rounded-xl shadow-lg cursor-pointer transition-colors"
              >
                <Save className="w-4 h-4" />
                Save Prerequisites
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
