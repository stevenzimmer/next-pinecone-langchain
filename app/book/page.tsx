import { OpenAI } from "langchain/llms/openai";
import { RetrievalQAChain } from "langchain/chains";
import {HNSWLib} from "langchain/vectorstores/hnswlib";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import * as fs from "fs";

const txtFilename = "The_Creative_Act";
const question = "Where did the author grow up?";
const txtPath = `./books/${txtFilename}.txt`;
const VECTOR_STORE_PATH = `./vectors-store/${txtFilename}.index`;

export default async function BookPage() {
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
    // console.log(textSpli)
    // console.log({textSplitter})
    const docs = await textSplitter.createDocuments([text]);

    console.log(docs.length);

    vectorStore = await HNSWLib.fromDocuments(docs, new OpenAIEmbeddings());

    // console.log({vectorStore})

    await vectorStore.save(VECTOR_STORE_PATH);

  
  }

  const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever());

  const res = await chain.call({
    query: question
  });

  console.log({res});

  return (
    <div className="container">
      {res.text}
    </div>
  )
}