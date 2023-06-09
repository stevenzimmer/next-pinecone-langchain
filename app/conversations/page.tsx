import { OpenAI } from "langchain/llms/openai";
// import { initializeAgentExecutorWithOptions } from "langchain/agents";
// import { SerpAPI } from "langchain/tools";
// import { Calculator } from "langchain/tools/calculator";
import { ConversationChain } from "langchain/chains";

const llm = new OpenAI({ temperature: 0 });
// const tools = [
//   new SerpAPI(process.env.SERPAPI_API_KEY, {
//     location: "Austin,Texas,United States",
//     hl: "en",
//     gl: "us",
//   }),
//   new Calculator(),
// ];



export default async function Conversation() {

  const conversation = new ConversationChain();
  // conversation.predict({
    
  // })
  // const executor = await initializeAgentExecutorWithOptions(tools, llm, {
  //   agentType: "zero-shot-react-description",
  //   verbose: true,
  //   returnIntermediateSteps: true
  // });

  // console.log({executor});

  const input = "Who is Olivia Wilde's boyfriend? What is his current age raised to the 0.23 power?";


    // const run = await executor.call( {input} );

    // console.log({run});

  
  // console.log({run});
  console.log
  return (
    <div className="container">
       
      <div>
       {/* {run.output}
       {run.intermediateSteps.map( (step) => {
        return (
          <div>
            {step.observation}
          </div>
        )
       })} */}
       </div>
    </div>
  )
}
