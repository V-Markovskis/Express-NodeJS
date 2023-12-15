import express from 'express';
const cors = require('cors');
import { connection } from "./db";
import { z } from 'zod'
import {fromZodError, isValidationErrorLike} from "zod-validation-error";
const app = express();
const port = 3001;


//https://stackoverflow.com/questions/62455716/typeerror-cannot-destructure-property-userid-of-req-body-as-it-is-undefined
app.use(express.json());

app.use(cors({
  origin: '*'
}));

const incomingDataValidation = z.object({
  image: z.string(),
  nickname: z.string(),
  movie: z.string(),
  review: z.string(),
  evaluation: z.string()
})

type incomingData = z.infer<typeof incomingDataValidation>

const validateId = z.number();

app.get('/movies', async (req, res) => {
  // Execute the query to get all movies
  connection.query('SELECT * FROM movies', (error, results) => {
    if (error) {
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    res.json(results);
  });
});

app.post('/movies', async (req, res) => {
  try {
    incomingDataValidation.parse(req.body)
    const { image, nickname, movie, review, evaluation } = req.body

    connection.query(`
    INSERT INTO movies (image, nickname, movie, review, evaluation)
    VALUES ('${image}','${nickname}', '${movie}', '${review}', '${evaluation}');
    `, (error, results) => {
      if(error) {
        res.status(500).json({ error: 'Internal Server Error'});
        return;
      }

      res.json(results);
    });
  } catch (error) {
    //https://github.com/causaly/zod-validation-error
    if (isValidationErrorLike(error)) {
      return res.status(400).send('Incorrect data'); // Bad Data (this is a client error)
    }
    return res.status(500).json({ error: 'Internal Server Error'}); // Server Error
  }
})

app.delete('/movies/:id', async (req, res) => {
  try {
    const movieId = parseInt(req.params.id);
    validateId.parse(movieId);

    connection.query(`
    DELETE FROM movies WHERE id = ${movieId}`, (error, results) => {
      if (error) {
        res.status(500).json({ error: 'Internal Server Error'})
        return;
      }
      console.log('delete result = ', results);
      res.json(results);
    })
  } catch (error) {
    if (isValidationErrorLike(error)) {
      return res.status(400).send('Missing id'); // Bad Data (this is a client error)
    }
    return res.status(500).json({ error: 'Internal Server Error'}); // Server Error
  }

})

app.put('/movies/:id', async (req, res) => {
  const movieId = parseInt(req.params.id);
  const { image, nickname, movie, review, evaluation } = req.body
  incomingDataValidation.parse(req.body)
  validateId.parse(movieId)

  if(!incomingDataValidation || !validateId) {
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
