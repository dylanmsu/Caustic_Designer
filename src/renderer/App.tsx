import React, { useEffect, useState } from 'react';
import { ThemeProvider, createTheme } from "@mui/material/styles";
//import preview from "../../assets/siggraph_parameterization.svg"
import {useNavigate, MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { Checkbox, FormControlLabel, FormGroup, Button, TextField, Drawer, AppBar, Divider, Toolbar, CssBaseline, Typography, Box } from '@mui/material';

function TransportPage(props: any) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [image, setImage] = useState(
      "https://c.tenor.com/I6kN-6X7nhAAAAAj/loading-buffering.gif"
  );

  const drawerWidth = 300;
  const topBarWidth = 50;

  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  });

  //window.electron.ipcRenderer.sendMessage('asynchronous-message', {type: 'get-param', data: ''});

  window.electron.ipcRenderer.on('asynchronous-message', function (message: any) {
    if (message.type === 'svg-data') {
      console.log("svg data received");
      setImage("data:image/svg+xml," + message.data);
    }
    if (message.type === 'imageUrl') {
      setSelectedImage(message.data);
    }
    if (message.type === 'step-size') {
      console.log(message.data)
    }
  });

  let mesh_resolution: Number = 100;
  let lens_width: Number = 1.0;
  let lens_thickness: Number = 0.2;
  let lens_focal: Number = 1.0;

  const startTransportSolver = () => {
    window.electron.ipcRenderer.sendMessage('asynchronous-message', {type: 'start-transport', data: {mesh_resolution: mesh_resolution, lens_width: lens_width}});
  };

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
          <Button variant="contained" component="span" color='primary' style={{width: `calc(${drawerWidth}px - 20px)`, margin: '10px'}}>
            Load Image
          </Button>
        </label>
      </div>
      <Divider />
      <FormGroup sx={{ '& > :not(style)': { width: `calc(${drawerWidth}px - 21px)`, mx: '10px', mt: '10px'}, mb: '10px' }} >
        <TextField size="small" required onChange = {(event)=> mesh_resolution = Number(event.target.value)} label="Mesh x resolution" variant="filled" fullWidth defaultValue={mesh_resolution}/>
        <TextField size="small" required onChange = {(event)=> lens_width = Number(event.target.value)} label="Lens width" variant="filled" fullWidth defaultValue={lens_width}/>
        <TextField size="small" required onChange = {(event)=> lens_thickness = Number(event.target.value)} label="Lens thickness" variant="filled" fullWidth defaultValue={lens_thickness}/>
        <TextField size="small" required onChange = {(event)=> lens_focal = Number(event.target.value)} label="Focal length" variant="filled" fullWidth defaultValue={lens_focal}/>
        <FormControlLabel label='Autostart height solver' control={<Checkbox defaultChecked/>}/>
        <Button type="submit" variant="contained" onClick={startTransportSolver}>
          start transport solver
        </Button>
        <Button variant="contained" disabled>
          start height solver
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
