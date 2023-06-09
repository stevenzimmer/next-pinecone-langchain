import { OpenAI } from "langchain/llms/openai";
// import { OpenAIChat } from "langchain/llms";
import { PromptTemplate } from "langchain/prompts";

  const llm = new OpenAI({
    temperature: 0.9
  });


  const prompt = new PromptTemplate({
    template: "How many limbs does a {dinosaur} have?",
    inputVariables: ["dinosaur"]
  });



export default async function quickstart() {

  // useEffect(() => {
  //   sendQuery();
  // }, []);

  const promptResponse = await prompt.format({ dinosaur: "T Rex"});

  const resA = await llm.call(promptResponse)

  async function sendQuery() {
  

      const result = await fetch("/api/quickstart", {
        method: "POST",
        body: JSON.stringify({
          text: "How many limbs does a {dinosaur} have?"
        })
      });
      const json = await result.json();

      console.log({json});
  }
 
  

  return (
    <div className="container">
      <div>
      {promptResponse}
      </div>
     
      <div>
        {resA}</div>
        </div>
  )
}
