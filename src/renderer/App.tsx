import React, { useState, useEffect  } from 'react';
import {useNavigate, MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import Button from '@mui/material/Button';
import Stepper from '@mui/material/Stepper';
import StepLabel from '@mui/material/StepLabel';
import Step from '@mui/material/Step';
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import './App.css';

import TransportPage from './TransportPage';

const steps = ['Select campaign settings', 'Create an ad group', 'Create an ad'];

function Hello() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [showNextButton, setShowNextButton] = useState(false);
  const navigate = useNavigate();


  useEffect(() => {
    window.electron.ipcRenderer.on('asynchronous-message', function (message) {
      if (message.type === 'image-preview') {
        setSelectedImage(message.data);
        setShowNextButton(true); // Show the second button when the event is received
      }
    });

    //return () => {
    //  window.electron.ipcRenderer.removeAllListeners('asynchronous-message');
    //};
  }, []); // Run only once on component mount

  window.electron.ipcRenderer.on('asynchronous-message', function (message) {
    if (message.type === 'image-preview') {
      setSelectedImage(message.data);
    }
  });

  const goToNextPage = () => {
    navigate('/transport');
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const imageDataURL = reader.result;
        //setSelectedImage(imageDataURL);
        window.electron.ipcRenderer.sendMessage('load-image', [imageDataURL]);
      };
      reader.readAsDataURL(file);
    }
  };

  /*worker.onmessage = function(event) {
    console.log(event.data[0])
  }*/

  // create a darkTheme function to handle dark theme using createTheme
  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  });

  return (
    <>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <div className="container">
          <div className="imageContainer">
            {selectedImage && (
              <img
                src={selectedImage}
                alt="Selected"
                className="selectedImage"
              />
            )}
          </div>
          <div className="buttonsContainer">
            <div className="buttonContainer">
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                id="contained-button-file"
                onChange={handleImageChange}
              />
              <label htmlFor="contained-button-file">
                <Button variant="contained" component="span" color='primary'>
                  Load Image
                </Button>
              </label>
            </div>
            {showNextButton && (
              <div className="buttonContainer">
                <Button
                  variant="contained"
                  color="success"
                  onClick={goToNextPage}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </ThemeProvider>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
        <Route path="/transport" element={<TransportPage />} />
      </Routes>
    </Router>
  );
}
