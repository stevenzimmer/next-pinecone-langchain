import { PromptTemplate } from "langchain/prompts";
import { OpenAI } from "langchain/llms/openai";
import { LLMChain } from "langchain/chains";


const model = new OpenAI({ temperature: 0 });

const prompt = PromptTemplate.fromTemplate(
  "What is a good name for a company that makes {product}?"
);

export default async function Chaining() {
  const chainA = new LLMChain({ llm: model, prompt });

  // The result is an object with a `text` property.
const resA = await chainA.call({ product: "Delicious Cookies" });
console.log({resA});

// Since the LLMChain is a single-input, single-output chain, we can also `run` it.
// This takes in a string and returns the `text` property.
const resA2 = await chainA.run("Sombreros");
console.log({ resA2 });

  return (
    <div className="container">
      <div>
{resA.text} <br />
{resA2}
        </div>
      </div>
  )
}
