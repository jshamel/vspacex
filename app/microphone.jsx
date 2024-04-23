import React, { useState, useEffect } from 'react';
import MicIcon from '@mui/icons-material/Mic';
import { Box } from '@mui/material';
import axios from 'axios';
const FormData = require('form-data');
import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();
const openApiKey = process.env.OPENAI_API_KEY;
if (!openApiKey) {
    throw new Error("OPENAI_API_KEY is not set");
}
const openai = new OpenAI({apiKey:  openApiKey , dangerouslyAllowBrowser: true });

const Microphone = ({handleSend}) => {
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [latestSpeachToText, setLatestSpeachToText] = useState("");
    
    const [audioUrl, setAudioUrl] = useState("");

    useEffect(() => {
        // Check if the browser supports the required APIs
        if (!navigator.mediaDevices || !window.MediaRecorder) {
            alert("Your browser does not support audio recording");
            return;
        }

        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                const recorder = new MediaRecorder(stream);
                setMediaRecorder(recorder);

                let chunks = [];
                recorder.ondataavailable = e => chunks.push(e.data);

                recorder.onstop = async () => {
                    const blob = new Blob(chunks, { 'type': 'audio/ogg; codecs=opus' });
                    chunks = [];
                    const audioURL = URL.createObjectURL(blob);
                    setAudioUrl(audioURL);


                    const formData = new FormData();
                    formData.append('model', "whisper-1");
                    formData.append('file', blob, "audio.ogg");
                    console.log(formData);

                    axios.post('https://api.openai.com/v1/audio/transcriptions', formData, {
                        headers: {
                            'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
                            'Authorization': 'Bearer '+openApiKey
                        }
                    })
                        .then(response => {
                            console.log(response.data);
                            handleSend(response.data.text)
                            setLatestSpeachToText(response.data.text)



                        })

                    // const transcription = await openai.audio.transcriptions.create({
                    //     file: blob,
                    //     model: "whisper-1",
                    //   });
                    
                    //   console.log(transcription.text);
                    



                };
            })
            .catch(err => console.error("Error accessing the microphone:", err));
    }, []);

    const toggleRecording = () => {
        if (isRecording) {
            mediaRecorder.stop();
        } else {
            setAudioUrl(""); // Clear the previous recording
            mediaRecorder.start();
        }
        setIsRecording(!isRecording);
    };

    const playRecording = () => {
        if (audioUrl) {
            const audio = new Audio(audioUrl);
            //audio.play();



        }
    };

    useEffect(() => {
        if (!isRecording && audioUrl) {
            playRecording();
        }
    }, [isRecording, audioUrl]);

    return (
        <Box onClick={toggleRecording} sx={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <div>{latestSpeachToText}</div>
            <MicIcon color={isRecording ? "error" : "inherit"} />
        </Box>
    );
}

export default Microphone;
