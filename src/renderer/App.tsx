import React, { useEffect, useState } from 'react';
import { ThemeProvider, createTheme } from "@mui/material/styles";
//import preview from "../../assets/siggraph_parameterization.svg"
import {useNavigate, MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { Checkbox, FormControlLabel, FormGroup, Button, TextField, Drawer, AppBar, Divider, Toolbar, CssBaseline, Typography, Box, CircularProgress } from '@mui/material';

function TransportPage(props: any) {
  const [runningTransport, setRunningTransport] = useState(false);
  const [enableHeight, setEnableHeight] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [runningHeight, setRunningHeight] = useState(false);
  const [autoStart, setAutoStart] = useState(false);
  const [image, setImage] = useState(null);
  
  const [meshResolution, setMeshResolution] = useState(100);
  const [lensWidth, setLensWidth] = useState(0.5);
  const [lensThickness, setLensThickness] = useState(0.1);
  const [lensFocal, setLensFocal] = useState(1.0);

  const drawerWidth = 300;
  const topBarWidth = 50;

  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  });

  // renderer javascript file
  function saveFile(content: any) {
    const element = document.createElement("a");
    const file = new Blob([content], {type: "text/plain"});
    element.href = URL.createObjectURL(file);
    element.download = "caustic_lens.obj";
    element.click();
  }

  const startTransportSolver = () => {
    window.electron.ipcRenderer.sendMessage('asynchronous-message', {type: 'start-transport', data: {mesh_resolution: meshResolution, lens_width: lensWidth}});
    setRunningTransport(true);
  };

  const startHeightSolver = () => {
    const data = {focal_l: lensFocal, thickness: lensThickness};
    console.log(data);
    window.electron.ipcRenderer.sendMessage('asynchronous-message', {type: 'start-height', data: data});
    setRunningHeight(true);
  };

  useEffect(() => {
    const amUnsubscribe = window.electron.ipcRenderer.on('asynchronous-message', function (message: any) {
      if (message.type === 'svg-data') {
        setImage("data:image/svg+xml," + message.data);
      }
      if (message.type === 'imageUrl') {
        setSelectedImage(message.data);
      }
      if (message.type === 'step-size') {
        console.log(message.data)
      }
      if (message.type === 'transport-done') {
        setRunningTransport(false);
        setEnableHeight(true);
        if (autoStart) {
          startHeightSolver();
        }
      }
      if (message.type === 'height-done') {
        setRunningHeight(false);
        saveFile(message.data);
      }
    });

    return () => {
      amUnsubscribe();
    }
  
  }, [autoStart, lensThickness,lensFocal]);

  const handleImageChange = (event: any) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const imageDataURL = reader.result;
        //setSelectedImage(imageDataURL);
        window.electron.ipcRenderer.sendMessage('asynchronous-message', {type: 'loadImage', data: imageDataURL});
      };
      reader.readAsDataURL(file);
    }
  };

  const drawer = (
    <div style={{overflow: 'hidden'}}>
      <Toolbar variant="dense" sx={{ minHeight: topBarWidth, height: topBarWidth }}>
        <Typography variant="h6" noWrap component="div">
          Caustic Designer
        </Typography>
      </Toolbar>
      <Divider />
      <div style={{height: '220px', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '10px'}}>
      {selectedImage && (
        <img
          style={{flexShrink: 0, maxWidth: '100%', maxHeight: '100%'}}
          src={selectedImage}
          alt="Selected"
          className="selectedImage"
        />
      )}
      </div>
      <div style={{width: '100%'}}>
        <input
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          id="contained-button-file"
          onChange={handleImageChange}
        />
        <label htmlFor="contained-button-file">
          <Button variant="contained" component="span" color='primary' style={{width: `calc(${drawerWidth}px - 20px)`, margin: '10px'}} disabled={(runningTransport || runningHeight) ? 'disabled' : null}>
            Load Image
          </Button>
        </label>
      </div>
      <Divider />
      <FormGroup sx={{ '& > :not(style)': { width: `calc(${drawerWidth}px - 21px)`, mx: '10px', mt: '10px'}, mb: '10px' }} >
        <TextField size="small" required onChange={(event) => setMeshResolution(Number(event.target.value))} label="Mesh x resolution" variant="filled" fullWidth defaultValue={meshResolution}/>
        <TextField size="small" required onChange={(event) => setLensWidth(Number(event.target.value))} label="Lens width" variant="filled" fullWidth defaultValue={lensWidth}/>
        <TextField size="small" required onChange={(event) => setLensThickness(Number(event.target.value))} label="Lens thickness" variant="filled" fullWidth defaultValue={lensThickness}/>
        <TextField size="small" required onChange={(event) => setLensFocal(Number(event.target.value))} label="Focal length" variant="filled" fullWidth defaultValue={lensFocal}/>
        <FormControlLabel label='Autostart height solver' control={<Checkbox onChange={(event) => setAutoStart(Boolean(event.target.checked))} checked={autoStart} />}/>
        <Button variant="contained" onClick={() => {startTransportSolver();}} disabled={runningTransport || runningHeight || selectedImage === null}>
          {runningTransport ? (<> <CircularProgress size={20} /> Running... </>) : (<>Run transport solver</>)}
        </Button>
        <Button variant="contained" onClick={() => {startHeightSolver();}} disabled={(!enableHeight || runningHeight) ? 'disabled' : null}>
          {runningHeight ? (<> <CircularProgress size={20} /> Running... </>) : (<>Run height solver</>)}
        </Button>
      </FormGroup>
      <Divider />
    </div>
  );

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <AppBar position="fixed" sx={{ width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px`, }} >
          <Toolbar variant="dense" sx={{ minHeight: topBarWidth, height: topBarWidth }}>
            <Typography variant="h6" noWrap component="div">
              Parameterization preview
            </Typography>
          </Toolbar>
        </AppBar>
        <Box component="nav" sx={{ width: drawerWidth }} aria-label="mailbox folders" >
          <Drawer variant="permanent" sx={{ display: 'block', '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth }, }} open >
            {drawer}
          </Drawer>
        </Box>
        <Box component="main" sx={{ flexGrow: 1, p: '20px', width: `calc(100% - ${drawerWidth}px)` }} >
          <img style={{maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', marginTop: topBarWidth}} src={image} alt="Login Form" id="form-img" />
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TransportPage />} />
      </Routes>
    </Router>
  );
}
