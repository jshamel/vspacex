'use client'
import Image from 'next/image'
import styles from './page.module.css'
import Microphone from './microphone'
import { Box } from '@mui/material'
import { ChainProvider3, useChain } from './ai/ChainProviderHuggingFace'; // Import the provider

export default function MainPage() {

  
  return (
      <ChainProvider3>
          <MainContent />
      </ChainProvider3>
  );
}



const MainContent = () => {

  
  const chainContext = useChain();

  return (
    <main className={styles.main}>
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'middle' }}>


        <Microphone handleSend={async (currentText: string) => {
          console.log('handleSend')


          const i = {
            input: currentText,
        }

          // const response = await chainContext.invokeChain({ input: i, chainX: chainContext.chain });
          // console.log(response);

          // setReceivedMessage({
          //   messageText: response,
          //   sent: false
          // })
        }} />
      </Box>
    </main>
  )
}
