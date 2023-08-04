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
const dbFilePath = path.resolve(__dirname, 'db/db.json');

// HTML routes
app.get('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, 'develop/public/notes.html'));
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'develop/public/index.html'));
});

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

app.post('/api/notes', (req, res) => {
  const newNote = {
    id: uuidv4(),
    title: req.body.title,
    text: req.body.text,
  };

  fs.readFile(dbFilePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Error reading data from the database.' });
    }

    const notes = JSON.parse(data);
    notes.push(newNote);

    fs.writeFile(dbFilePath, JSON.stringify(notes), (err) => {
      if (err) {
        return res.status(500), json({ error: 'Error writing data to the database.' });
      }

      res.json(newNote);
    });
  });
});

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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
