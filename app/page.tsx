"use client"
import {  useState } from "react"

export default function Home() {
  const [query, setQuery] = useState<string>("");
  
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  const [answers, setAnswers] = useState<Array<{
    question: string
    answer:string
  }>>([]);



  async function createIndexAndEmbeddings() {
    try {
      const result = await fetch("/api/setup", {
        method: "POST"
      });
      const json = await result.json()
      console.log("result: ", json);

    } catch (error) {
      console.log({error});
      
    }
  }

  async function sendQuery() {
    if(!query) return;

    setResult("");
    setError(false);
    setLoading(true);

    try {
      const result = await fetch("/api/read", {
        method: "POST",
        body: JSON.stringify(query)
      });
      const json = await result.json();

      console.log({json});

      setResult(json.data);
      setLoading(false);

      setQuery("");
      setAnswers([{
        question: query,
        answer: json.data
      }, ...answers]);
      
    } catch (error) {
      console.log({error});
      setResult("Something went wrong with your query, please revise with more context and try again");
      setError(true);
      setLoading(false);
    }
  }

  return (
    <main className="container mx-auto h-screen">
      <div className="flex flex-wrap h-full">
        <div className="w-full lg:w-6/12">
          <div className="p-12">
          <h1 className="text-3xl mb-6 text-center">Ask me anything...work or experience related</h1>
          <textarea placeholder="'Provide a summary of Steven's work experience'" onChange={(e) => setQuery(e.target.value)} className="text-black p-3 rounded-md w-full mb-6 border-2 min-h-[140px]" /><br />
          <button onClick={sendQuery} className={`inline-flex items-center px-8 py-2 font-semibold leading-6 shadow rounded-md text-white  transition ease-in-out duration-150 ${loading ? "cursor-not-allowed bg-slate-700" : "bg-teal-500 hover:bg-teal-400"}`} 
          disabled={loading}>{loading ? (
            <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Asking...
            </>

          ) : (
            "Ask Me"
          )} </button>

          {!loading && (
           <div className={`p-6 mt-6 rounded-md shadow-md min-h-[200px] ${error ? "bg-red-200" : "bg-white"}`}>
        
          {result && (
           
            <p>{result}</p>
            
          )}
          </div>
          )}

          {/* <button onClick={createIndexAndEmbeddings}>Create Index and embeddings</button> */}
          </div>
        </div>
        <div className="w-full lg:w-6/12">
          <div className="bg-white h-full p-12 drop-shadow-xl overflow-y-scroll">
          
            <h3 className="text-2xl text-center font-bold mb-6">Recent Questions </h3>
           
            {answers.length > 0 && (
              <div>
          {answers.map((answer, i) => {
            return (
              <div key={`query-${i}`} className="p-6 border-b first:bg-green-100">
                <p className="mb-2 text-lg"><strong> {answer.question}</strong></p>
                <p className="px-3">{answer.answer}</p>
              </div>
            )
          })} </div>)}
          </div>
         
        </div>
      </div>
     
    </main>
  )
}
