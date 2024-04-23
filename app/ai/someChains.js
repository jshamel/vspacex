import React, { useState, useEffect, createContext, useContext } from 'react';
import { ChatOpenAI } from "@langchain/openai";
import { BufferMemory } from "langchain/memory";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
// import TestsJson from "./TestsJson";
import { HuggingFaceInference } from "@langchain/community/llms/hf";
import { ChatGroq } from "@langchain/groq";
import axios from 'axios';

const huggingFaceApiKey = process.env.HUGGINGFACE_API_KEY;
if (!huggingFaceApiKey) {
    throw new Error("HUGGING_FACE_API_KEY is not set");
}

const groqApiKey = process.env.GROQ_API_KEY;
if (!groqApiKey) {
    throw new Error("GROQ_API_KEY is not set");
}

// Define your chains as exports
export const getChiefEngineerChain = () => {

    // let modelName = 'meta-llama/Llama-2-7b-chat-hf';
    //let modelName = 'meta-llama/Llama-2-70b-chat-hf';
    let modelName = 'meta-llama/Meta-Llama-3-70B-Instruct'

    // const model = new HuggingFaceInference({
    //     model: modelName,
    //     apiKey: huggingFaceApiKey, // In Node.js defaults to process.env.HUGGINGFACEHUB_API_KEY
    //     // maxTokens: 250
    // });





    const model = new ChatGroq({
        apiKey: groqApiKey,
        model: "llama3-70b-8192",
        maxTokens: 128,
    })


    const systemTemplate =
        `You are the chief engineer at a company called VSpacex, which stands for Virtual SpaceX.
        You will engage in technical conversations with humans and AI agents. You are the technical leader of the company.
        and it is up to you to lead the effort to design and develop aerospace solutions to the needs of the company.

        You will have engaging conversations and at times you will be funny, others blunt and to the point. But you will always 
        be professional. When asked a question, you do not always need to provide a long detailed answer. Its ok to help the conversation go 
        back and forth. So you can ask questions or give leading responses that guide the conversation in a way that you believe
        ultimately benefits everyone. 

        Only respond with your answer. Do not prepend any text ( like the word 'assistant')

`

    const humanTemplate = "{input}"

    const chatPrompt = ChatPromptTemplate.fromMessages([
        ["system", systemTemplate],
        new MessagesPlaceholder("history"),
        ["human", humanTemplate],
    ]);




    const memory = new BufferMemory({
        returnMessages: true,
        inputKey: "input",
        outputKey: "output",
        memoryKey: "history",
    });



    const chain = RunnableSequence.from([
        {
            input: (initialInput) => initialInput.input,
            coaching_json: (initialInput) => initialInput.coaching_json,
            memory: () => memory.loadMemoryVariables({}),
        },
        {
            input: (previousOutput) => previousOutput.input,
            coaching_json: (previousOutput) => previousOutput.coaching_json,
            history: (previousOutput) => previousOutput.memory.history,
        },
        chatPrompt,
        model,
        //outputParser
    ]);


    const invokeChain = async ({ input, chain, memory }) => {

        try {
            const response = await chain.invoke(input);
            // const json = JSON.parse(response);
            await memory.saveContext(input, {
                output: response.content,
            });

            console.log(response);

            return response;

        } catch (err) {
            console.log(err)
        }


    };

    return {
        chain,
        memory,
        invokeChain
    }

}



export const textToSpeech = async (inputText) => {


    //return;
    // Set the API key for ElevenLabs API. 
    // Do not use directly. Use environment variables.
    // const API_KEY = '340a24e1d7b0ab6b39cfceb95db68bec';
    const API_KEY = '340a24e1d7b0ab6b39cfceb95db68bec';



    // Set the ID of the voice to be used.
    // const VOICE_ID = 'gDUs03xNSxGNBQkBpsoc';
    //const VOICE_ID = 'pedCybXBfUeDIePw2f89';
    const VOICE_ID = 'Ir5ovXy4kuTSX3DRLGip'; //custom chief engineer




    // Set options for the API request.
    const options = {
        method: 'POST',
        url: `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
        headers: {
            accept: 'audio/mpeg', // Set the expected response type to audio/mpeg.
            'content-type': 'application/json', // Set the content type to application/json.
            'xi-api-key': `${API_KEY}`, // Set the API key in the headers.
        },
        data: {
            text: inputText, // Pass in the inputText as the text to be converted to speech.
        },
        responseType: 'arraybuffer', // Set the responseType to arraybuffer to receive binary data as response.
    };

    // Send the API request using Axios and wait for the response.
    const speechDetails = await axios.request(options);

    // Return the binary audio data received from the API response.

    const blob = new Blob([speechDetails.data], { type: 'audio/mpeg' });
    const url = URL.createObjectURL(blob);

    // setAudioURL(url);
    // return speechDetails.data;

    return url;
};






