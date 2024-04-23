import React, { useState, useEffect, createContext, useContext } from 'react';
import { ChatOpenAI } from "@langchain/openai";
import { BufferMemory } from "langchain/memory";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
// import TestsJson from "./TestsJson";
import { HuggingFaceInference } from "@langchain/community/llms/hf";

import dotenv from "dotenv";

// Initialize environment variables
dotenv.config();

// Create a context for the chain
const ChainContext = createContext();


export const useChain = () => {
    const context = useContext(ChainContext);



    if (!context) {
        throw new Error('useChain must be used within a ChainProvider3');
    }
    return context;
};

let coaching_json = null;

const coaching_response_original = {
    currentStep: "Put the title of the current step you are coaching for",
    latestComment: "Put the most recent salesperson's comment here",
    coaching_json: "The original coaching_json, while preserving its stucture exactly, but with your updates for successCriteria.passed"
}

const coaching_response = {
    currentStep: "Put the title of the current step you are coaching for",
    latestComment: "Put the most recent salesperson's comment here",
    currentStep: "The original currentStep, while preserving its stucture exactly, but with your updates for successCriteria.passed"
}

const coachSystemTemplate_original =
    `You are a sales coaching expert. Here is a list of messages between a salesman and one or more prospects: {allSalesComments}. 
    Provide coaching for the salesman's latest comment. 
    The latest comment is defined as the last comment in allSalesComments with a type of 'SALESPERSON'.
    You will use the following information to provide coaching: {coaching_json}. You will only evaluate for the first step that does 
    not have completed = true. The current step is the first step that does not have a a value completed=true. For the current step, use the 
    successCriteria list provided to evaluate the salesman's latest comment. NEVER change the values for anything that does not hold a value of 'TBD'
    
    Your response will be an exact copy of the coaching_json object but with values updated, where appropriate, for successCriteria.passed. 
    For any successCriteria that passes change its passed value to true. 
    If it fails set its passed value to fail. 
  
    All values for successCriteria.passed will be boolean true or false ( not string 'true' or 'false')
  
    For any step that no longer has any successCriteria.passed values equal to "TBD", 
    that step is considered completed. A completed step will never be used again. 
    Once a step is completed the values for its successCriteria can never be changed again. 
  
    Your reponse will be a json object that can be parsed. It will look like this: {coaching_response}. Make sure the coaching_response.latestComment
    value is set to the salesman's latest comment.
  
    You will ONLY answer with the json object as just described. You will never respond with just some text.
  `;

const coachSystemTemplate =
    `You are a sales coaching expert. Here is a list of messages between a salesman and one or more prospects: {allSalesComments}. 
    Provide coaching for the salesman's latest comment: {lastSalesmanMessage}
    
    You will use the following information to provide coaching: {currentStep}. For the current step, use the 
    successCriteria list provided to evaluate the salesman's latest comment. NEVER change the values for anything that does not hold a value of 'TBD'

    Your response will be an exact copy of the currentStep object but with values updated, where appropriate, for successCriteria.passed
    and successCriteria.coachingComment. If this successCriteria is not met, you will provide a brief coaches comment explaining why it was not met.
    If it is met, you will provide a brief coaches comment explaining why it was met.
    When referring to the 'salesman' in these coachingComments you will use 'you' or 'your' as appropriate. 
    For any successCriteria that passes change its passed value to true. 
    If it fails set its passed value to fail. 
  
    All values for successCriteria.passed will be boolean true or false ( not string 'true' or 'false')

    Your reponse will be a json object that can be parsed. It will look like this: {coaching_response}. 
  
    You will ONLY answer with the json object as just described. You will never respond with just some text.
  `;
let coachChatPrompt = ChatPromptTemplate.fromMessages([
    ["system", coachSystemTemplate]
]);






export const ChainProvider3 = ({ children }) => {
    // Define state here if needed, for example, to store responses
    const [chain, setChain] = useState();
    const [memory, setMemory] = useState();
    const [currentCommunicationEvent, setCurrentCommunicationEvent] = useState();
    const [allSalesComments, setAllSalesComments] = useState([
        {
            type: 'SYSTEM',
            message: '[PHONE_RINGING]'
        }
    ]);

    // let modelName = 'mistralai/Mistral-7B-v0.1'; //keeps replying with the entire conversation.
    // let modelName = 'mistralai/Mixtral-8x7B-Instruct-v0.1';
    // let modelName = 'mistralai/Mixtral-8x7B-v0.1'; //too big 
    // let modelName = 'openai-community/gpt2-xl';  //too slow
    let modelName = 'meta-llama/Llama-2-7b-chat-hf';
    //let modelName = 'meta-llama/Llama-2-70b-chat-hf';
    
    

    const model = new HuggingFaceInference({
        model: modelName,
        apiKey: "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", // In Node.js defaults to process.env.HUGGINGFACEHUB_API_KEY
        // maxTokens: 250
    });

    

    useEffect(() => {

        console.log(allSalesComments);
        //let updatedCoachingJson = await processCoaching({updatedCoachingJson:coaching_json});

    }, [allSalesComments])

    useEffect(() => {

        // const model = new HuggingFaceInference({
        //     model: modelName,
        //     apiKey: "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", // In Node.js defaults to process.env.HUGGINGFACEHUB_API_KEY
        //     max_length: 512,
        //     max_new_tokens: 256
        // });


        const response_json = {
            ai_responses: [
                {
                    characterName: '[Provide the character name here. For example: Bob Jones',
                    characterResponse: '[ Provide character response here. For example: What is it now? I am busy!]'
                },
                {
                    characterName: '[Provide the character name here. For example: Sally Johnson',
                    characterResponse: '[ Provide character response here. For example: Hi Jeff, thanks for calling]'
                }
            ]
        }

        const systemTemplate_inProgress =
            `You are a sales prospect and you just answered a call from someone unknown. 
  Your job is to act as a sales prospect and respond to the call. 
  Your name is Bob Jones. Your very first utterance should be you answering the phone call.
  You will always act as if you have received a call from a sales person.
  Also, you are extremely angry that your phone is ringing. You are also very angry in general.
  When you see this [PHONE RINGING] it indicates that you have received a phone call from the sales person.
  Answer the call as if you are Bob Jones and you are very angry for being disturbed.
  You will always identify yourself when answering the call.
  
  You are also representing Sally Johnson. She is a co-worker with Bob and she is much kinder and 
  potentially more interested in hearing a sales pitch. Sally will begin responding sometime after Bob answers the phone. 
  They will not both answer the phone.
  
  Your response will be a json object with the field ai_responses in it. ai_responses will hold an array and there will be 
  one json object for each responding character within this array. Each character response will hold the values characterName and characterResponse. 
  You will put their name and their responses in the appropriate location within this json object. 
  If a character does not respond then that character's json object is not required within the array. 
  You will ensure that your response is valid json.

  Also, once it is obvious that the call is over, add an ai_response with characterName: 'SYSTEM' and characterResponse: 'CALL_ENDED'
  If there is another message from the salesrep after CALL_ENDED, then add another ai_response with characterName: 'SYSTEM' and characterResponse: 'CALL_ENDED.
  Bob and Sally will never respond again after CALL_ENDED.

  
  You will also act as a trained sales coach. You will evaluate based solely on the information provided next.
  Here is a coaching evaluation json object: {coaching_json}
  You will use this to evaluate the performance of the sales rep. The steps defined here must be executed in sequence by the sales rep.
  Evaluate the sales rep for each successCriteria. If they pass or fail a specific successCriteria indicate it by changing the value of 
  'passed' for each successCriteria to true or false. You will only evalulate based on the information in coaching_json. 
   

  For each response, you will return the coaching_json object, as the coaching_json field of the same object 
  you return that also holds the ai_responses object. The value you return for this coaching_json field will
  be exactly the same as the original coaching_json object with one exception. You will change the 'passed' value
  for each successCriteria when the sales rep has met the conditions provided in the condition field of a
  successCriteria. You will not add to or alter in any way the coaching_json object except as described for the 'passed' field.


  Every reponse from you MUST hold the coaching_json object, with your updated values. 

  Your responses must always be in the form of valid json. 

  The json object you return must always contain the ai_responses and coaching_json members. 
  Ensure that the coaching_json object that you return has the identical steps and successCriteria as the original coaching_json object 
  that was provided to you.
  `;


        const systemTemplate =
            `You are a sales prospect. You will respond to each message provided by the human who 
            will be acting as the sales rep.

            Your name is Bob Jones. 

            This simulated sales call will begin with the string [PHONE_RINGING]. You will immediately respond
            as if you are a sales prospect answering the phone call.

            You will return a json object with the following two fields:
            
                characterName: '[Provide the character name here. For example: Bob Jones'],
                characterResponse: '[ Provide character response here. For example: Hello, Bob Jones here.]'
            
                You will ensure that your entire response is valid json that can be parsed using JSON.parse().

                All of your JSON field names will have double quotes around them.

`
        /*
            The coaching_json object that you return will maintain the original structure
          so that the steps and the step names are still available. You will also keep the successCriteria, with your updated values, within
          the step they were defined in. You will maintain the exact same sequence for steps and successCriteria in your reponse.
        
        */

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


        setChain(chain);
        setMemory(memory);



    }, []);


    const processCoaching = async ({ updatedCoachingJson, comments, lastSalesmanMessage, currentStep }) => {

        if (!lastSalesmanMessage) {
            return;
        }
        console.log(currentCommunicationEvent);
        // const model = new HuggingFaceInference({
        //     model: modelName,
        //     apiKey: "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", // In Node.js defaults to process.env.HUGGINGFACEHUB_API_KEY
        // });

        const coachChain = coachChatPrompt.pipe(model);
        // console.log(coachChatPrompt);
        // const coachChain = coachChatPrompt.pipe(model);
        const coachResponse = await coachChain.invoke({
            lastSalesmanMessage: lastSalesmanMessage,
            allSalesComments: JSON.stringify(comments),
            // coaching_json: JSON.stringify(updatedCoachingJson),
            currentStep: JSON.stringify(currentStep),
            coaching_response: JSON.stringify(coaching_response)
        });
        // console.log(coachResponse);

        try {

            const content = JSON.parse(coachResponse.content);

            console.log(content.currentStep);
            console.log(content.latestComment);
            //console.log(content.coaching_json);

            // content.coaching_json.steps.forEach((step) => {
            //     console.log("step:" + step.title)
            //     console.log(step)
            // })

            // return content.coaching_json;
            return content;

        } catch (err) {
            console.log(err)
        }





    }


    const invokeChain = async ({ input, chainX }) => {
        // Implementation to invoke chain with given inputs and handle the response
        // For example:

        //input.coaching_json = coaching_json;
        const response = await chain.invoke(input);
        const json = JSON.parse(response);
        await memory.saveContext(input, {
            output: response.content,
        });

        const parsedContent = JSON.parse(response.content);

        // allSalesComments.push({
        //     type: 'PROSPECTS',
        //     message: JSON.parse(input.input)
        // })

        try {
            allSalesComments.push({
                type: 'SALESMAN',
                message: input.input
            });

            setAllSalesComments(allSalesComments);


            if (!coaching_json) {

                // let currentEventTest = currentCommunicationEvent.eventTests[0];
                coaching_json = '';//JSON.parse(JSON.stringify(TestsJson.EIGHT_STEP_CALL));

            }


            //**********************************************************************************************************************************/
            // let updatedCoachingJson = await processCoaching({ updatedCoachingJson: coaching_json, comments: allSalesComments });
            // parsedContent.coaching_responses = updatedCoachingJson






        } catch (err) {
            console.log(err)
        }

        return parsedContent;
    };

    // The value passed to the provider's value prop holds what will be accessible to consuming components
    return (
        <ChainContext.Provider value={{
            invokeChain,
            processCoaching,
            chain,
            setChain,
            memory,
            setMemory,
            currentCommunicationEvent,
            setCurrentCommunicationEvent
        }}>

            {children}
        </ChainContext.Provider>
    );
};
