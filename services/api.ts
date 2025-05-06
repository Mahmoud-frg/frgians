export const APIFOOTBALL_CONFIG = {
  // BASE_URL: "https://api.themoviedb.org/3",
  BASE_URL: "https://apiv3.apifootball.com",
  API_KEY: process.env.EXPO_PUBLIC_PERSON_API_KEY,
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${process.env.EXPO_PUBLIC_PERSON_API_KEY}`,
  },
};

//${APIFOOTBALL_CONFIG.BASE_URL}/discover/movie?sort_by=popularity.desc
//${APIFOOTBALL_CONFIG.BASE_URL}/?action=get_players&player_name=Ronaldo&APIkey=${process.env.EXPO_PUBLIC_PERSON_API_KEY}
export const fetchPersons = async ({ query }: { query: string }) => {
  const endpoint = query
    ? `${
        APIFOOTBALL_CONFIG.BASE_URL
      }/?action=get_players&player_name=${encodeURIComponent(query)}&APIkey=${
        process.env.EXPO_PUBLIC_PERSON_API_KEY
      }`
    : `${APIFOOTBALL_CONFIG.BASE_URL}/?action=get_teams&team_id=76&APIkey=${process.env.EXPO_PUBLIC_PERSON_API_KEY}`;

  const response = await fetch(endpoint, {
    method: "GET",
    headers: APIFOOTBALL_CONFIG.headers,
  });

  if (!response.ok) {
    //@ts-ignore
    throw new Error("Failed to fetch persons", response.statusText);
  }

  const data = await response.json();

  if (query === "") {
    const [{ players }] = data;
    return players;
  } else {
    return data;
  }

  // return data.results;
};

export const fetchPersonDetails = async (
  personID: string
): Promise<PersonDetails> => {
  try {
    const response = await fetch(
      `${APIFOOTBALL_CONFIG.BASE_URL}/?action=get_players&player_id=${personID}&APIkey=${process.env.EXPO_PUBLIC_PERSON_API_KEY}`,
      {
        method: "GET",
        headers: APIFOOTBALL_CONFIG.headers,
      }
    );

    if (!response.ok) {
      //@ts-ignore
      throw new Error("Failed to fetch person details");
    }

    const data = await response.json();
    return data[0];
  } catch (error) {
    console.log(
      "================api_error_fetchPersonDetails===================="
    );
    console.log(error);
    console.log(
      "================api_error_fetchPersonDetails===================="
    );

    throw error;
  }
};
