export interface PersonSummary {
  uid: string;
  name: string;
  url: string;
}

export interface PaginatedResponse<T> {
  message: string;
  total_records: number;
  total_pages: number;
  previous: string | null;
  next: string | null;
  results: T[];
}

export interface PersonProperties {
  name: string;
  height: string;
  mass: string;
  hair_color: string;
  skin_color: string;
  eye_color: string;
  birth_year: string;
  gender: string;
  homeworld: string; // URL
  films: string[]; // URLs
  species: string[];
  vehicles: string[];
  starships: string[];
  url: string;
  created: string;
  edited: string;
}

export interface PersonDetail {
  properties: PersonProperties;
  description: string;
  _id: string;
  uid: string;
}

export interface PersonDetailResponse {
  message: string;
  result: PersonDetail;
}

// For search results which returns an array of PersonDetail objects directly
export interface SearchResponse {
  message: string;
  result: PersonDetail[];
}

export interface PlanetProperties {
  name: string;
  climate: string;
  diameter: string;
  gravity: string;
  orbital_period: string;
  population: string;
  rotation_period: string;
  surface_water: string;
  terrain: string;
  url: string;
}

export interface PlanetDetailResponse {
  message: string;
  result: {
    properties: PlanetProperties;
    uid: string;
  };
}

export interface FilmProperties {
  title: string;
  episode_id: number;
  opening_crawl: string;
  director: string;
  producer: string;
  release_date: string;
  url: string;
}

export interface FilmDetailResponse {
  message: string;
  result: {
    properties: FilmProperties;
    uid: string;
  };
}

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://www.swapi.tech/api";


/**
 * Fetch a paginated list of characters
 */
export async function fetchPeople(page = 1, limit = 10): Promise<PaginatedResponse<PersonSummary>> {
  const response = await fetch(`${BASE_URL}/people/?page=${page}&limit=${limit}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch characters (Page ${page})`);
  }
  return response.json();
}

/**
 * Fetch detailed information for a single character by UID
 */
export async function fetchPersonDetails(uid: string): Promise<PersonDetailResponse> {
  const response = await fetch(`${BASE_URL}/people/${uid}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch character details for ID: ${uid}`);
  }
  return response.json();
}

/**
 * Search for characters by name (partial match, case-insensitive)
 */
export async function searchPeople(query: string): Promise<SearchResponse> {
  const response = await fetch(`${BASE_URL}/people/?name=${encodeURIComponent(query)}`);
  if (!response.ok) {
    throw new Error(`Failed to search characters for query: "${query}"`);
  }
  return response.json();
}

/**
 * Fetch planet details by planet URL
 */
export async function fetchPlanetDetails(url: string): Promise<PlanetDetailResponse> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch planet details from: ${url}`);
  }
  return response.json();
}

/**
 * Fetch film details by film URL
 */
export async function fetchFilmDetails(url: string): Promise<FilmDetailResponse> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch film details from: ${url}`);
  }
  return response.json();
}
