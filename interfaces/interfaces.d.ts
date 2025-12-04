interface Movie {
  id: number;
  title: string;
  adult: boolean;
  backdrop_path: string;
  genre_ids: number[];
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string;
  release_date: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
}

interface TrendingMovie {
  searchTerm: string;
  movie_id: number;
  title: string;
  count: number;
  poster_url: string;
}

interface MovieDetails {
  adult: boolean;
  backdrop_path: string | null;
  belongs_to_collection: {
    id: number;
    name: string;
    poster_path: string;
    backdrop_path: string;
  } | null;
  budget: number;
  genres: {
    id: number;
    name: string;
  }[];
  homepage: string | null;
  id: number;
  imdb_id: string | null;
  original_language: string;
  original_title: string;
  overview: string | null;
  popularity: number;
  poster_path: string | null;
  production_companies: {
    id: number;
    logo_path: string | null;
    name: string;
    origin_country: string;
  }[];
  production_countries: {
    iso_3166_1: string;
    name: string;
  }[];
  release_date: string;
  revenue: number;
  runtime: number | null;
  spoken_languages: {
    english_name: string;
    iso_639_1: string;
    name: string;
  }[];
  status: string;
  tagline: string | null;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
}

interface Person {
  player_id: number;
  player_name: string;
  player_number: number;
  player_image: string;
  player_type: string;
  player_rating: number;
}

interface TrendingPerson {
  id: number;
  name: string;
  title: string;
  imageUrl: string;
}

interface TrendingCardProps {
  person: TrendingPerson;
  index: number;
}

interface PersonDetails {
  player_id: number;
  player_image: string | null;
  player_name: string;
  player_number: number;
  player_type: string | null;
  player_age: number;
  player_birthdate: string;
  player_rating: number;
  team_key: number;
  team_name: number | null;
}

// -------------------------------

interface SliderType {
  id: number;
  name: string;
  imageUrl: string;
  about: string;
  title: string;
  frgMail: string;
}
interface BrandsType {
  id: number;
  name: string;
  imageUrl: string;
  motto: string;
  founded: string;
}

interface CategoryType {
  iconUrl: string;
  id: number;
  name: string;
}

interface personsListType {
  id?: string;
  about: string;
  address: string;
  arrangement: number;
  contact: number;
  emergency: number;
  department: string;
  departmentId: number;
  frgMail: string;
  code: number;
  code_str: string;
  imageUrl: string;
  joinDate: string;
  jobDescription: string;
  dateOfBirth: string;
  name: string;
  name_lower: string;
  reportTo: string;
  title: string;
  isAdmin: boolean;
}

interface newsListType {
  id?: string;
  index?: number;
  title: string;
  imgUrl: string;
  head: string;
  body: string;
  date: string;
  seenBy: Array;
  likes: string[];
  commentable: boolean;
  comments: {
    id: string;
    userId: string;
    name: string;
    image: string;
    text: string;
    createdAt: string;
  }[];
}

interface branchesListType {
  id?: number;
  name: string;
  imgUrl: string;
  brand: string;
  location: string;
  manager: string;
}
