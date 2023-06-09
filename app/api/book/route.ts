import { NextRequest, NextResponse } from "next/server";

import { OpenAI } from "langchain/llms/openai";
import { RetrievalQAChain } from "langchain/chains";
import {HNSWLib} from "langchain/vectorstores/hnswlib";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import * as fs from "fs";

const txtFilename = "The_Creative_Act";
// const question = "What is the wisdom of The Opposite is True?";
const txtPath = `./books/${txtFilename}.txt`;
const VECTOR_STORE_PATH = `${txtFilename}.index`;

console.log("Book route");
export async function POST(req: NextRequest) {
  const body = await req.json();

  console.log(body.text);

  const model = new OpenAI({});

  let vectorStore;

  if(fs.existsSync(VECTOR_STORE_PATH)) {
    console.log("vector store path exists");

    vectorStore = await HNSWLib.load(VECTOR_STORE_PATH, new OpenAIEmbeddings());

  } else {
    console.log("vector store path DOES NOT exist");

    const text = fs.readFileSync(txtPath, "utf-8");

    // console.log({text});

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200
    });

    const docs = await textSplitter.createDocuments([text]);

    // console.log(docs.length);

    vectorStore = await HNSWLib.fromDocuments(docs, new OpenAIEmbeddings());

    console.log({vectorStore});

    await vectorStore.save(VECTOR_STORE_PATH);

  
  }

  const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever());

  const res = await chain.call({
    query: body.text
  });

  console.log({res});

  // const client = new PineconeClient();
  
  // await client.init({
  //   apiKey: process.env.PINECONE_API_KEY!,
  //   environment: process.env.PINECONE_ENVIRONMENT!
  // });

  // const text = await queryPineconeVectorStoreAndQueryLLM(client, indexName, body);

  return NextResponse.json({
    data: res
  })
}