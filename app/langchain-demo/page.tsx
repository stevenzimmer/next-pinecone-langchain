import {getAllHTMLStringsFromPostgres, createTableInPostgres} from "@/utils/langchain-demo";

export const revalidate = 60000;

type Query = {
  query: string;
  characters: string;
}

const body:Query = {
  query: "Donald Trump",
  characters: "Mickey Mouse"
}

export default async function LangchainDemoPage() {

  const generates = await fetch("http://localhost:3000/api/generate", {
    method: "POST",
    headers: {
      "Accept": "application.json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if(!generates.ok) {
    console.log("not ok");
    return;
  } 

  console.log({generates});

  const createTable = await createTableInPostgres();

  console.log({createTable});

  let {rows} = await getAllHTMLStringsFromPostgres();

  console.log({rows});

  const formattedRows = rows.map((row, i) => {
    const chapterNumber = rows.length - 1;
    const cleanHTML = row.html_string;

    const date = () => {
      const date = new Date(row.date.toISOString());

      return new Date(date).toLocaleString("en-US", {
        timeZone: "America/Los_Angeles",
        hour12: true,
        month:"long",
        day: "numeric",
        year:"numeric",
        hour:"numeric",
        minute: "numeric"
      })
    }

    return {
      ...row,
      date: date(),
      cleanHTML,
      chapterNumber
    }
  });


  return (
    <div className="container">
      <h1>LLM News</h1>
      {formattedRows.map( (row,i) => {
        return (
          <div key={i} className="mb-12 max-w-lg mx-auto">
            <h2>Entry #{row.chapterNumber}</h2>
            <p>{row.date}</p>
            <div dangerouslySetInnerHTML={{__html: row.cleanHTML}}></div>
          </div>
        )
      })}
    </div>
  )
}
