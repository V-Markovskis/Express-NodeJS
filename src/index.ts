import express from 'express';
import { connection } from "./db";
const app = express();
const port = 3001;


app.get('/', async (req, res) => {
  res.json("hi");
});

app.get('/users', async (req, res) => {
  // Execute the query to get all users
  connection.query('SELECT * FROM users', (error, results) => {
    if (error) {
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    // Send the users as a JSON response
    res.json({ users: results });
  });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
