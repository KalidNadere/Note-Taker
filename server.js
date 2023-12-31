const express = require('express');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// Absolute path for the db.json file
const dbFilePath = path.join(__dirname, 'db', 'db.json');

// API routes
app.get('/api/notes', (req, res) => {
  fs.readFile(dbFilePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Error reading data from the database.' });
    }

    const notes = JSON.parse(data);
    res.json(notes);
  });
});

// Route for handling HTTP post requests to create new note
app.post('/api/notes', (req, res) => {
  const newNote = {
    id: uuidv4(),
    title: req.body.title,
    text: req.body.text,
  };

  // Route for handling data from database file
  fs.readFile(dbFilePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Error reading data from the database.' });
    }

    const notes = JSON.parse(data);
    notes.push(newNote);

    fs.writeFile(dbFilePath, JSON.stringify(notes), (err) => {
      if (err) {
        return res.status(500).json({ error: 'Error writing data to the database.' });
      }

      res.json(newNote);
    });
  });
});

// Route for handling delete requests
app.delete('/api/notes/:id', (req, res) => {
  const noteId = req.params.id;

  fs.readFile(dbFilePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Error reading from the database.' });
    }

    const notes = JSON.parse(data);
    const updatedNotes = notes.filter((note) => note.id !== noteId);

    fs.writeFile(dbFilePath, JSON.stringify(updatedNotes), (err) => {
      if (err) {
        return res.status(500).json({ error: 'Error writing data to the database.' });
      }

      res.json({ message: 'Note deleted successfully.' });
    });
  });
});

// HTML routes
app.get('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'notes.html'));
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
