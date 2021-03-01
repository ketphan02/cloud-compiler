// required environment variables
['NODE_ENV', 'PORT', 'MONGO_URL'].forEach((name) => {
  if (!process.env[name]) {
    throw new Error(`Environment variable ${name} is missing`);
  }
});

export default {
  stage: process.env.NODE_ENV,
  port: process.env.PORT,
  mongoUrl: process.env.MONGO_URL,
};