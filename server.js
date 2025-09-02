const express = require('express');
const authRouter = require('./modules/Auth/auth.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Use the auth router for all routes starting with /api/auth
app.use('/api/auth', authRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});