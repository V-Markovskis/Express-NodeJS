import express from 'express';
const cors = require('cors');
import { connection } from "./db";
const app = express();
const port = 3001;

//https://stackoverflow.com/questions/62455716/typeerror-cannot-destructure-property-userid-of-req-body-as-it-is-undefined
app.use(express.json());

app.use(cors({
  origin: '*'
}));

app.get('/movies', async (req, res) => {
  // Execute the query to get all movies
  connection.query('SELECT * FROM movies', (error, results) => {
    if (error) {
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    // Send the movies as a JSON response
    // res.json({ movies: results });
    res.json(results);
  });
});

app.post('/movies', async (req, res) => {
  const { image, nickname, movie, review, evaluation } = req.body

  console.log('req.body ========', req.body)

  if( !nickname || !movie || !review || !evaluation) {
    res.status(400).send('Incorrect data')
    return;
  }

  connection.query(`
    INSERT INTO movies (image, nickname, movie, review, evaluation)
    VALUES ('${image}','${nickname}', '${movie}', '${review}', '${evaluation}');
  `, (error, results) => {
    if(error) {
      res.status(500).json({ error: 'Internal Server Error'});
      return;
    }
    console.log('results ===', results)
    res.json(results);
  });
})

app.delete('/movies/:id', async (req, res) => {
  const movieId = parseInt(req.params.id);

  if(!movieId) {
    res.status(400).send('Missing id')
  }

  connection.query(`
    DELETE FROM movies WHERE id = ${movieId}`, (error, results) => {
    if (error) {
      res.status(500).json({ error: 'Internal Server Error'})
      return;
    }
    console.log('delete result = ', results);
    res.json(results);
  })

})

app.put('/movies/:id', async (req, res) => {
  const movieId = parseInt(req.params.id);
  const { image, nickname, movie, review, evaluation } = req.body

  if(!movieId || !movie) {
    res.status(400).send('Incorrect data');
  }

  connection.query(`
    UPDATE movies
    SET image = '${image}', nickname = '${nickname}', movie = '${movie}', review = '${review}', evaluation = '${evaluation}'
    WHERE id = '${movieId}';`, (error, results) => {
    if (error) {
      res.status(500).json({ error: 'Internal Server Error'} )
      return;
    }
    console.log('updated movie = ', results);
    res.json(results);
  })
})

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
