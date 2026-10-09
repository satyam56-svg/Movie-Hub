/**
 * Natural language query parser for MovieHub.
 * Parses queries like:
 * - "Top 4 adventure movies"
 * - "Top 5 movies directed by Christopher Nolan"
 * - "movies directed by Christopher Nolan"
 * - "best action movies"
 * - "Christopher Nolan"
 * - "The Dark Knight"
 */

const KNOWN_GENRES = [
  'Action', 'Adventure', 'Animation', 'Biography', 'Comedy', 'Crime',
  'Documentary', 'Drama', 'Family', 'Fantasy', 'Film-Noir', 'History',
  'Horror', 'Music', 'Musical', 'Mystery', 'Romance', 'Sci-Fi', 'Sport',
  'Thriller', 'War', 'Western'
];

export function parseQuery(queryStr) {
  if (!queryStr || !queryStr.trim()) {
    return {
      isNatural: false,
      search: '',
      genre: null,
      director: null,
      limit: null,
      badgeText: null
    };
  }

  const raw = queryStr.trim();
  const lower = raw.toLowerCase();

  let limit = null;
  let genre = null;
  let director = null;
  let isNatural = false;
  let badgeParts = [];

  // Extract limit: e.g., "top 4", "top 5", "best 10"
  const limitMatch = lower.match(/\b(?:top|best|first)\s+(\d+)\b/i);
  if (limitMatch) {
    limit = parseInt(limitMatch[1], 10);
    isNatural = true;
    badgeParts.push(`Top ${limit}`);
  } else if (/\b(?:top|best)\b/i.test(lower)) {
    isNatural = true;
    badgeParts.push(`Top`);
  }

  // Extract director: e.g., "directed by Christopher Nolan" or "by Christopher Nolan"
  const directorMatch = lower.match(/\b(?:directed\s+by|by)\s+([a-z0-9\s.\-']+)/i);
  if (directorMatch) {
    let candidate = directorMatch[1].trim();
    // Strip trailing keywords like "movies", "films"
    candidate = candidate.replace(/\b(?:movies?|films?)\b/gi, '').trim();
    if (candidate) {
      director = candidate;
      isNatural = true;
      badgeParts.push(`Director: "${director}"`);
    }
  }

  // Extract genre match
  for (const g of KNOWN_GENRES) {
    const regex = new RegExp(`\\b${g.replace('-', '\\-')}\\b`, 'i');
    if (regex.test(lower)) {
      genre = g;
      isNatural = true;
      badgeParts.push(`Genre: ${genre}`);
      break;
    }
  }

  // If no explicit "directed by", but the query is NOT natural language (e.g., "Christopher Nolan" or "The Dark Knight"),
  // `search` will be passed as-is, which the backend searches in both Title and Director.
  let search = raw;
  if (isNatural && (director || genre)) {
    // If it was a natural query like "Top 4 adventure movies" or "movies directed by Nolan",
    // strip the natural words or pass clean parameters
    search = '';
  }

  const badgeText = isNatural && badgeParts.length > 0
    ? badgeParts.join(' • ')
    : null;

  return {
    isNatural,
    raw,
    search,
    genre,
    director,
    limit,
    badgeText
  };
}
