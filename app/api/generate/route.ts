import { NextRequest, NextResponse } from "next/server";
import {
  braveQuery,
  generateFictionalStoreWithOpenAI,
  saveHTMLStringToPostgres
} from "@/utils/langchain-demo"

const shareKey = process.env.VERCEL_CRON_KEY;

export async function POST(req: NextRequest) {

  const body = await req.json();

  console.log(body);

  const characters = body.characters;
  const query = body.query;
  const apiKey = req.nextUrl.searchParams.get("apiKey");

  console.log({characters});

  console.log({query});

  // if(apiKey !== shareKey) {
  //   return NextResponse.json({
  //     message: "invalid API Key"
  //   }, {
  //     status: 403
  //   })
  // }

  try {
    console.log("api request");

    console.log("awaiting brave query");
    const braveResponse = await braveQuery(query);

    console.log({ braveResponse });
    
    const fictionalStory = await generateFictionalStoreWithOpenAI(braveResponse, characters);

    console.log({ fictionalStory });


    await saveHTMLStringToPostgres(fictionalStory.response);

    return NextResponse.json({
      braveResponse,
      fictionalStory: fictionalStory.response
    }, {
      status: 200
    })

  } catch (error) {
    console.log({error});

    return NextResponse.json({
      message: "Server Error"
    }, {
      status: 500
    })
    
  }



}