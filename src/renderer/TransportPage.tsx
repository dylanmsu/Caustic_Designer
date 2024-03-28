import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Toolbar from "@mui/material/Toolbar";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import AppBar from "@mui/material/AppBar";
import Drawer from "@mui/material/Drawer";
import TextField from "@mui/material/TextField";
import Button from '@mui/material/Button';
import preview from "../../assets/siggraph_parameterization.svg"
import { Checkbox, FormControlLabel, FormGroup } from '@mui/material';

function TransportPage(props) {
  const [formData, setFormData] = useState({
    field1: '',
    field2: ''
  });

  const drawerWidth = 300;
  const topBarWidth = 50;

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // Add your form submission logic here
    console.log(formData);
  };

  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  });

  const { window } = props;
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [isClosing, setIsClosing] = React.useState(false);

  const handleDrawerClose = () => {
    setIsClosing(true);
    setMobileOpen(false);
  };

  const handleDrawerTransitionEnd = () => {
    setIsClosing(false);
  };

  const handleDrawerToggle = () => {
    if (!isClosing) {
      setMobileOpen(!mobileOpen);
    }
  };

  const drawer = (
    <div>
      <Toolbar variant="dense" sx={{ minHeight: topBarWidth, height: topBarWidth }}>
        <Typography variant="h6" noWrap component="div">
          Caustic Designer
        </Typography>
      </Toolbar>
      <Divider />
        <FormGroup sx={{ '& > :not(style)': { width: `calc(${drawerWidth}px - 21px)`, m: '10px' }, }} >
          <TextField id="filled-basic" label="Mesh x resolution" variant="filled" fullWidth value={100} />
          <TextField id="filled-basic" label="Lens width" variant="filled" fullWidth value={1.0} />
          <TextField id="filled-basic" label="Lens thickness" variant="filled" fullWidth value={0.2} />
          <TextField id="filled-basic" label="Focal length" variant="filled" fullWidth value={1.0} />
          <FormControlLabel label='Autostart height solver' control={<Checkbox defaultChecked/>}/>
          <Button variant="contained">
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
        <AppBar
          position="fixed"
          sx={{
            width: `calc(100% - ${drawerWidth}px)`,
            ml: `${drawerWidth}px`,
          }}
        >
          <Toolbar variant="dense" sx={{ minHeight: topBarWidth, height: topBarWidth }}>
            <Typography variant="h6" noWrap component="div">
              Parameterization preview
            </Typography>
          </Toolbar>
        </AppBar>
        <Box
          component="nav"
          sx={{ width: drawerWidth }}
          aria-label="mailbox folders"
        >
          {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onTransitionEnd={handleDrawerTransitionEnd}
            onClose={handleDrawerClose}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
            sx={{
              display: 'none',
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
          >
            {drawer}
          </Drawer>
          <Drawer
            variant="permanent"
            sx={{
              display: 'block',
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
            open
          >
            {drawer}
          </Drawer>
        </Box>
        <Box
          component="main"
          sx={{ flexGrow: 1, p: 3, width: `calc(100% - ${drawerWidth}px)` }}
          
        >
          <img style={{maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', marginTop: topBarWidth}} src={preview} alt="Login Form" id="form-img" />
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default TransportPage;
