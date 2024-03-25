import React, { useState } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import icon from '../../assets/icon.svg';
import './App.css';

function Hello() {
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
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
      <div className="buttonContainer">
        <input
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          id="contained-button-file"
          onChange={handleImageChange}
        />
        <label htmlFor="contained-button-file">
          <Button variant="contained" color="default" component="span">
            Upload Image
          </Button>
        </label>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
      </Routes>
    </Router>
  );
}
