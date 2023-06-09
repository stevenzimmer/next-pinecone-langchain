// Import Document Loader
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import {JSONLoader} from "langchain/document_loaders/fs/json";
import {TextLoader} from "langchain/document_loaders/fs/text";
// import {CSVLoader} from "langchain/document_loaders/fs/csv";
import {PDFLoader} from "langchain/document_loaders/fs/pdf";

// Import OpenAI model
import { OpenAI } from "langchain/llms/openai";

import { RetrievalQAChain } from "langchain/chains";
import {HNSWLib} from "langchain/vectorstores/hnswlib";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

// Token Counting
import { Tiktoken } from "@dqbd/tiktoken/lite";
import {load} from "@dqbd/tiktoken/load";
import registry from "@dqbd/tiktoken/registry.json";
import models from "@dqbd/tiktoken/model_to_encoding.json"


import fs from "fs";

const loader = new DirectoryLoader("./documents", {
  ".json": (path) => new JSONLoader(path),
  ".txt": (path) => new TextLoader(path),
  ".pdf": (path) => new PDFLoader(path),

});





// const txtFilename = "The_Creative_Act";
// const question = "Where did the author grow up?";
// const txtPath = `./books/${txtFilename}.txt`;
const VECTOR_STORE_PATH = `./Documents.index/`;
const question  = "Tell me about these docs";



async function calculateCost(docs) {
  const modelName = "text-embedding-ada-002";
  const modelKey = models[modelName];
  const model = await load(registry[modelKey]);
  const encoder = new Tiktoken(
    model.bpe_ranks,
    model.special_tokens,
    model.pat_str
  );

  const tokens = encoder.encode(JSON.stringify(docs));

  const tokenCount = tokens.length;;
  const ratePerThousandTokens = 0.0004;
  const cost = (tokenCount / 1000) * ratePerThousandTokens;
  encoder.free()
  return cost;


}


function normalizeDocuments(docs) {
  return docs.map((doc) => {
    if(typeof doc.pageContent === "string") {
      return doc.pageContent
    } else if ( Array.isArray(doc.pageContent)) {
      return doc.pageContent.join("\n");
    }
  });
}



export default async function DocumentLoaderPage() {

  console.log("loading docs");

  const docs = await loader.load();
  console.log("docs Loaded");

  console.log("calculating cost...");

  const cost = await calculateCost(docs);

  console.log("Cost calculated", cost);


  if(cost <= 1 ) {

    const model = new OpenAI({});

    let vectorStore;

    if(fs.existsSync(VECTOR_STORE_PATH)) {
      console.log("vector store path exists");
  
      vectorStore = await HNSWLib.load(VECTOR_STORE_PATH, new OpenAIEmbeddings());

      console.log("vector store loaded");
  
    } else {
      console.log("Creating vector store");
  
      // const text = fs.readFileSync(txtPath, "utf-8");
  
      // console.log({text});
  
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200
      });
      // console.log(textSpli)
      // console.log({textSplitter})
      const normalizedDocs = normalizeDocuments(docs);
      
      const splitDocs = await textSplitter.createDocuments(normalizedDocs);
  
      console.log(splitDocs.length);
  
      vectorStore = await HNSWLib.fromDocuments(splitDocs, new OpenAIEmbeddings());
  
      // console.log({vectorStore})
  
      await vectorStore.save(VECTOR_STORE_PATH);

      console.log("vector store created");
  
    
    }

    const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever());

    const res = await chain.call({
      query: question
    });

    console.log({res});


  } else {
    console.log("the cost exceeds $1");
  }

 

  

  return (
    <div className="container">
     Document loaders
    </div>
  )
}