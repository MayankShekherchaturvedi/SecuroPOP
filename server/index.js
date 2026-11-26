import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ app: 'SecuroPOP', status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`SecuroPOP server listening on http://localhost:${PORT}`);
});
