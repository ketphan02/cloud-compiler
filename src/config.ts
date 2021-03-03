// required environment variables
['NODE_ENV', 'PORT'].forEach((name) => {
  if (!process.env[name]) {
    throw new Error(`Environment variable ${name} is missing`);
  }
});

export default {
  stage: process.env.NODE_ENV,
  port: process.env.PORT,
};