import {OpenAIEmbeddings} from "langchain/embeddings/openai";
import {RecursiveCharacterTextSplitter} from "langchain/text_splitter"; 
import { OpenAI } from "langchain/llms/openai";
// import { OpenAIChat } from "langchain/llms";
import { PromptTemplate } from "langchain";
import {StructuredOutputParser} from "langchain/output_parsers";


import {GoogleDriveLoader} from "langchain/document_loaders/web/"

import {loadQAStuffChain} from "langchain/chains"
import {Document} from "langchain/document"
import { timeout } from "./config";

export const createPineconeIndex = async (
  client,
  indexName,
  vectorDimension
) => {
  // Initiate index existence check
  console.log(`Checking ${indexName} ...`);

  // Get list of existing indexes
  const existingIndexes = await client.listIndexes();

  // If index doesn't exist, create it
  if(!existingIndexes.includes(indexName)) {
    // Log index creation initiation
    console.log(`Creating ${indexName} ...`);

    // Create index
    await client.createIndex({
      createRequest: {
        name: indexName,
        dimension: vectorDimension,
        metric: 'cosine'
      }
    });

    console.log(`Creating index... Please wait for it to finish initializing`);

    await new Promise((resolve) => setTimeout(resolve, timeout));
    
  } else {
    console.log(`${indexName} already exists`);
  }
}

export const updatePinecone = async (client, indexName, docs) => {
  const index = client.Index(indexName);
  console.log(`Pinecone index retrieved: ${indexName}`);

  for( const doc of docs ) {
    console.log(`Processing document: ${doc.metadata.source}`);
    const txtPath = doc.metadata.source;
    const text = doc.pageContent;

    const textSplitter = new RecursiveCharacterTextSplitter({chunkSize:1000})

    console.log("splitting text into chunks");

    const chunks = await textSplitter.createDocuments([text]);

    console.log(`Text split into ${chunks.length} chunks`);
    console.log(`Calling OpenAI's Embedding endpoint documents with ${chunks.length} text chunks`);

    const embeddingsArrays = await new OpenAIEmbeddings().embedDocuments(
      chunks.map((chunk) => chunk.pageContent.replace(/\n/g, " "))
    );

    console.log(`Creating ${chunks.length} vectors array with id, values, and metadata...`);

    const batchSize = 100;
    let batch:any = [];

    for( let i = 0; i < chunks.length; i++ ) {
      const chunk = chunks[i];

      const vector = {
        id: `${txtPath}_${i}`,
        values: embeddingsArrays[i],
        metadata: {
          ...chunk.metadata,
          loc: JSON.stringify(chunk.metadata.loc),
          pageContent: chunk.pageContent,
          txtPath
        }
      }
      batch = [...batch, vector];

      // When batch is full or last item, upsert the vectors

      if( batch.length === batchSize || i === chunks.length - 1 ) {
        await index.upsert({
          upsertRequest: {
            vectors: batch
          }
        });

        // Empty batch
        batch = [];
      }
    }

  }  
}


export const queryPineconeVectorStoreAndQueryLLM = async (
  client,
  indexName,
  question
) => {
  console.log("Querying Pinecone Store...");

  const index = client.Index(indexName);

  const queryEmbedding = await new OpenAIEmbeddings().embedQuery(question);

  let queryResponse = await index.query({
    queryRequest: {
      topK: 10,
      vector: queryEmbedding,
      includeMetadata: true,
      includeValues: true
    }
  });

  console.log(`Found ${queryResponse.matches.length} matches...`);

  console.log(`Asking question: ${question}`);

  if(queryResponse.matches.length) {
    // console.log("query response matches");

    // console.log("new Open AI llm");
    
      
    
    const llm = new OpenAI({
      temperature: 0.9
      
    });

    // console.log({loadQAStuffChain});

    // console.log("load qa stuff chain");

    const chain = loadQAStuffChain(llm);

    // console.log({chain});

    // console.log("concatenated page content");

    const concatendatePageContent = queryResponse.matches.map((match) => match.metadata.pageContent).join(" ");

    // console.log({concatendatePageContent});

    // console.log("result");
   
    const result = await chain.call({
      input_documents: [new Document({ pageContent: concatendatePageContent})],
      question
    });

    // console.log({result});

    // console.log(`Answer: ${result.text}`);

    return result.text;

  } else {
    console.log("Since no matches, GPT3 will not be queried");
    // No Matches
    return "There were no matches for your query";
    
  }
}