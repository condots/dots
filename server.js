import express from 'express';
import path from 'path';

const app = express();

// Serve static files from the "dist" directory
const distPath = path.resolve(__dirname, 'dist');
app.use(express.static(distPath));

app.get('/message', (_, res) => res.send('Hello from express!'));

// Serve the index.html file for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.resolve(distPath, 'index.html'));
});

app.listen(3000, () => console.log('Server is listening...'));
