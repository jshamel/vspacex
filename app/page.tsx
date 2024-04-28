'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import React from 'react'
import Typography from '@mui/material'
import styles from './page.module.css'
import { Box, Grid } from '@mui/material'
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { ChainProvider3, useChain } from './ai/ChainProviderHuggingFace'; // Import the provider
import page from './engineeringRoom/page'

export default function MainPage() { 


  return (
    <ChainProvider3>
      <MainContent />
    </ChainProvider3>
  );
}



const a11yProps = (index: number) => {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
};

const TabPanel = (props: any) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const TheTabs = () => {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100vw', height: '100vh' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="basic tabs example"
        >
          <Tab label="Main" {...a11yProps(0)} />
          <Tab label="AI" {...a11yProps(1)} />
          <Tab label="Audio" {...a11yProps(2)} />
          <Tab label="Settings" {...a11yProps(3)} />
          <Tab label="About" {...a11yProps(4)} />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
       Main
      </TabPanel>
      <TabPanel value={value} index={1}>
        AI
      </TabPanel>
      <TabPanel value={value} index={2}>
        Audio
      </TabPanel>
      <TabPanel value={value} index={3}>
        Settings
      </TabPanel>
      <TabPanel value={value} index={4}>
        About
      </TabPanel>
    </Box>
  );
};
const MainContent = () => {


  const chainContext = useChain();
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [aiReponse, setAiResponse] = useState<string | null>(null);

  const containerStyle = { height: 'calc(100vh - 64px)', maxHeight: '100vh', width: '100vw', marginTop: '64px' }
  const columnStyle = { border: '1px solid black', height: '100%' }


  const [childComponent, setChildComponent] = useState<Element | null>(null);
  // const router = useRouter();

  useEffect(() => {
    // Load child component dynamically
    import('./engineeringRoom/page').then(module => {
      // setChildComponent(module.default);
    });
  }, []);




  return (

    <Grid container spacing={2} sx={containerStyle}>
      <Grid item xs={3} sx={columnStyle}>

      </Grid>
      <Grid item xs={9} sx={columnStyle}>
        <TheTabs />
      </Grid>
    </Grid>
  )
}
