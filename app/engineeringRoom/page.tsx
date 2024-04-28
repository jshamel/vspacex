'use client'
import { useState } from 'react'
import Image from 'next/image'
import styles from './page.module.css'
import Microphone from '../microphone'
import { Box } from '@mui/material'
import { ChainProvider3, useChain } from '../ai/ChainProviderHuggingFace'; // Import the provider
import { getChiefEngineerChain } from '../ai/someChains';
import { textToSpeech } from '../ai/someChains'

export default function MainPage() {


  return (
    <ChainProvider3>
      <MainContent />
    </ChainProvider3>
  );
}



const MainContent = () => {


  const chainContext = useChain();
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [aiReponse, setAiResponse] = useState<string | null>(null);
  const { chain, memory, invokeChain } = getChiefEngineerChain()

  return (
    <main className={styles.main}>
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'middle' }}>

        <div>Engineering Room</div>
        <Microphone handleSend={async (currentText: string) => {
          console.log('handleSend')


          const i = {
            input: currentText,
          }


          const response = await invokeChain({ input: i, memory, chain });
          console.log(response);

          const audioResponseUrl = await textToSpeech(response.content)
          setAiResponse(response.content)
          setAudioURL(audioResponseUrl)
          // const response = await chainContext.invokeChain({ input: i, chainX: chainContext.chain });
          // console.log(response);

          // setReceivedMessage({
          //   messageText: response,
          //   sent: false
          // })
        }} />

        {audioURL && (
          <audio
            key={audioURL}
            autoPlay
            onEnded={() => {
              console.log("Audio has finished playing");
              setAudioURL(null);
            }}
          >
            <source src={audioURL} type="audio/mpeg" />
          </audio>
        )}

        <Box  sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
           
            <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                <Box sx={{display: 'flex', justifyContent: 'center'}}>
                    <img src="/img/chief_engineer.jpeg" alt="Chief Engineer" style={{width: '200px', zIndex: 1}}/>
                </Box>
                <div style={{zIndex: 0}}>{aiReponse}</div>
            </Box>
        </Box>

      </Box>
    </main>
  )
}
