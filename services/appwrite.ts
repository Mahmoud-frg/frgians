// track the searches made by a user

import { Client, Databases, ID, Query } from "react-native-appwrite";

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ID!;

const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!);

const database = new Databases(client);

export const updateSearchCount = async (query: string, person: Person) => {
  try {
    const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.equal("searchTerm", query),
    ]);

    // check if a record of that search has already been stored
    if (result.documents.length > 0) {
      const existingPerson = result.documents[0];

      // if a document is found then increment the searchCount field
      await database.updateDocument(
        DATABASE_ID,
        COLLECTION_ID,
        existingPerson.$id,
        {
          count: existingPerson.count + 1,
        }
      );
    } else {
      // if no document is found then
      // create a new document in Appwrite database --> 1 (initialize the count to one)
      await database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
        searchTerm: query,
        count: 1,
        person_id: +person.player_id,
        name: person.player_name,
        image_url: person.player_image,
      });
    }
  } catch (error) {
    console.log("================error1====================");
    console.log(error);
    console.log("================error1====================");

    throw error;
  }
};

export const getTrendingPersons = async (): Promise<
  TrendingPerson[] | undefined
> => {
  try {
    const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.limit(10),
      Query.orderDesc("count"),
    ]);
    return result.documents as unknown as TrendingPerson[];
  } catch (error) {
    console.log("================error2====================");
    console.log(error);
    console.log("================error2====================");
    return undefined;
  }
};
