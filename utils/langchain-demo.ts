import { sql } from "@vercel/postgres";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { HumanChatMessage, SystemChatMessage } from "langchain/schema";
import { json } from "stream/consumers";



const braveApiUrl = "https://api.search.brave.com/res/v1/web/search";

type Headers = {
  "Accept": string;
  "X-Subscription-Token": string;
}


export async function braveQuery(query) {

  console.log("brave query");

  const url = `${braveApiUrl}?q=${encodeURIComponent(query)}&freshness=pd`;

  const headers:Headers = {
    "Accept": "application/json",
    "X-Subscription-Token": process.env.BRAVE_API_KEY!
  };

  const response = await fetch(url, {
    method: "GET",
    headers:headers
  });

  if( !response.ok) {
    throw new Error(`HTTP error! status ${response.status}`);
  }

  let data = await response.json();

  console.log({data});


  const braveData = extractDescriptionsFromBrave(data);

  console.log({braveData});

  return braveData;

}

function extractDescriptionsFromBrave(jsonData) {
  let resultString = "";

  if(jsonData.query && jsonData.query.text) {
    resultString += jsonData.query.text;
  }

  if(jsonData.infoBox) {
    const infoBox = jsonData.infoBox;

    if(infoBox.description) {
      resultString += ", " + infoBox.description.replace(/<[^>]*>?/gm,"");
    }

    if(infoBox.developer) {
      resultString += ", " + infoBox.developer;
    }

    if(infoBox.initializeRelease) {
      resultString += ", " + infoBox.initializeRelease;
    }

    if(infoBox.repository) {
      resultString += ", " + infoBox.repository;
    }

    if(infoBox.writtenIn) {
      resultString += ", " + infoBox.writtenIn;

    }


  }




  if(jsonData.web && jsonData.web.results) {
    jsonData.web.results.forEach((result) => {
      if(result.title && result.description ) {
        resultString += ", " + result.title + ", " + result.description.replace(/<[^>]*>?/gm,"");
      }
    })
  }


  if(jsonData.news && jsonData.news.results) {
    jsonData.news.results.forEach((result) => {
      if(result.title && result.description ) {
        resultString += ", " + result.title + ", " + result.description.replace(/<[^>]*>?/gm,"");

        if(result.url) {
          resultString += ", " + result.url;
        }
      }
    })
  }


  if(jsonData.video && jsonData.video.results) {
    jsonData.video.results.forEach((result) => {
      if(result.title && result.description ) {
        resultString += ", " + result.title + ", " + result.description.replace(/<[^>]*>?/gm,"");

     
      }
    })
  }

  if(jsonData.profiles) {
    jsonData.profiles.results.forEach((profile) => {
      if(profile.site && profile.url ) {
        resultString += ", " + profile.site + ", " + profile.url;
     
      }
    });
  }





  return resultString;



}


export async function generateFictionalStoreWithOpenAI(braveData, characters) {
  console.log("Generating fictional story with openai");

  let charactersPrompt = "";

  if(characters) {
    characters = `**Include Characters from: ** ${characters} in the prompt`; 
  }

  const chat = new ChatOpenAI({
    modelName: "gpt-3.5-turbo",
    temperature: 0.7,
    maxTokens: 2000
  });

  const response = await chat.call([
    new SystemChatMessage(`I want to create a story in a Hunter S. Thompson style about the latest news, exclude any explicit mention of news providers and only include information about what seems like current events and instead write about only the news itself that might seem worthy of a debate 
    
    ${charactersPrompt}

    **Pay careful attention to what is below**
    1. I want the links correlated after each new item to be included in the story when its mention with anchor tag.
    *Example: Fiction story sentence. <sup><a href="[ABSOLUTE LINK TO CORRELATED URL PATH GOES HERE]">1</a></sup>, etc. at the end of each sentence.
    - I WANT NO MORE THAN 5 SENTENCES GENERATED.
    
    `),
    new HumanChatMessage(
      `Here is the MOST RECENT news data, pick no more than 5 of the most relevant stories a user would find interesting: ${braveData}`
    )
  ]);

  console.log("Return response from Open AI");

  return {
    response: response.text
  }


}


export async function createTableInPostgres() {
  await sql`Create TABLE IF NOT EXISTS llm_html (id SERIAL PRIMARY KEY, html_string TEXT, date TIMESTAMP)`;
}

async function clearDatabase() {
  await sql`DELETE FROM llm_html`;
}

export async function saveHTMLStringToPostgres(htmlString) {
  console.log("saving to vercel postgres");

  const date = new Date().toLocaleString();

  await sql`INSERT INTO llm_html (html_string, date) VALUES (${htmlString}, ${date})`;

  console.log("inserted into postgres");
}

export async function getAllHTMLStringsFromPostgres() {
  return await sql`SELECT * FROM llm_html ORDER BY date DESC`;
}

async function getMostRecentHTMLStringFromPostgres() {
  const res = await sql`SELECT * FROM llm_html ORDER BY date DESC LIMIT 1`;
  return res.rows.length > 0 ? res.rows[0].html_string : null;
}

// module.exports = {
//   braveQuery,
//   extractDescriptionsFromBrave,
//   generateFictionalStoreWithOpenAI,
//   saveHTMLStringToPostgres,
//   getAllHTMLStringsFromPostgres,
//   getMostRecentHTMLStringFromPostgres,
//   clearDatabase,
//   createTableInPostgres
// }