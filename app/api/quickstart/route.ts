import { NextRequest, NextResponse } from "next/server";

import { OpenAI } from "langchain/llms/openai";
// import { OpenAIChat } from "langchain/llms";
import { PromptTemplate } from "langchain/prompts";

export async function POST(req: NextRequest) {
  const body = await req.json();

  console.log({body});

  const llm = new OpenAI({
    temperature: 0.9
  });


  const prompt = new PromptTemplate({
    template: body.text,
    inputVariables: ["dinosaur"]
  });

  const promptResponse = await prompt.format({ dinosaur: "T Rex"});



  console.log({promptResponse});


  // const client = new PineconeClient();
  
  // await client.init({
  //   apiKey: process.env.PINECONE_API_KEY!,
  //   environment: process.env.PINECONE_ENVIRONMENT!
  // });

  // const text = await queryPineconeVectorStoreAndQueryLLM(client, indexName, body);

  return NextResponse.json({
    data: promptResponse
  })
}