const API_BASE = process.env.NEXT_PUBLIC_API_URL

export interface Movie {
  id: number;
  title: string;
  release_year: number;
  runtime: number;
  watched: boolean;
  prerequisites?: number[];
  prerequisite_details?: {
    id: number;
    title: string;
  }[];
}

export interface RewatchOrderData {
  target_movie: {
    id: number;
    title: string;
  };
  rewatch_order: Movie[];
  total_prerequisites: number;
  watched_count: number;
  unwatched_count: number;
  remaining_runtime_minutes: number;
}

export interface Cinema {
  id: number;
  name: string;
  bundle_sizes: number[];
}

export interface BookingQuoteData {
  possible: boolean;
  cinema: {
    id: number;
    name: string;
    bundle_sizes: number[];
  };
  group_size: number;
  total_bundles?: number;
  breakdown?: {
    bundle_size: number;
    quantity: number;
  }[];
  formatted?: string;
  message?: string;
}

export interface ApiCustomError extends Error {
  status?: number;
  code?: string;
}

export const fetchMovies = async (): Promise<Movie[]> => {
  const res = await fetch(`${API_BASE}/movies`);
  const data = await res.json();
  if (!data.success) throw new Error(data.message || "Failed to fetch movies");
  return data.data;
};

export const createMovie = async (movieData: {
  title: string;
  release_year: number;
  runtime: number;
  watched?: boolean;
  prerequisites?: number[];
}): Promise<Movie> => {
  const res = await fetch(`${API_BASE}/movies`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(movieData),
  });
  const data = await res.json();
  if (!res.ok) {
    const error: ApiCustomError = new Error(data.message || "Failed to create movie");
    error.status = res.status;
    error.code = data.error;
    throw error;
  }
  return data.data;
};

export const updateMovie = async (
  id: number,
  patchData: {
    title?: string;
    release_year?: number;
    runtime?: number;
    watched?: boolean;
    prerequisites?: number[];
  }
): Promise<Movie> => {
  const res = await fetch(`${API_BASE}/movies/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patchData),
  });
  const data = await res.json();
  if (!res.ok) {
    const error: ApiCustomError = new Error(data.message || "Failed to update movie");
    error.status = res.status;
    error.code = data.error;
    throw error;
  }
  return data.data;
};

export const fetchRewatchOrder = async (movieId: number): Promise<RewatchOrderData> => {
  const res = await fetch(`${API_BASE}/movies/${movieId}/rewatch-order`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch rewatch order");
  return data.data;
};

export const fetchCinemas = async (): Promise<Cinema[]> => {
  const res = await fetch(`${API_BASE}/cinemas`);
  const data = await res.json();
  if (!data.success) throw new Error(data.message || "Failed to fetch cinemas");
  return data.data;
};

export const createCinema = async (cinemaData: {
  name: string;
  bundle_sizes: number[];
}): Promise<Cinema> => {
  const res = await fetch(`${API_BASE}/cinemas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cinemaData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to create cinema");
  return data.data;
};

export const fetchBookingQuote = async (
  cinemaId: number,
  groupSize: number
): Promise<BookingQuoteData> => {
  const res = await fetch(`${API_BASE}/cinemas/${cinemaId}/booking?groupSize=${groupSize}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch booking quote");
  return data.data;
};
