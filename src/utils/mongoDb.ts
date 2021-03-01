import mongoose from 'mongoose';

// Only reconnect if needed. State is saved and outlives a handler invocation
let cachedDb: any;

export const connectDb = (connectionString: string) => {
  if (
    cachedDb
    && cachedDb.connections
    && cachedDb.connections[0]
    && cachedDb.connections[0].readyState
  ) {
    // Re-using existing database connection
    return Promise.resolve(cachedDb);
  }

  // Creating new database connection
  return (
    mongoose
      // https://mongoosejs.com/docs/deprecations.html
      .connect(connectionString, {
        useNewUrlParser: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
        useCreateIndex: true,
      })
      .then((db: any) => {
        cachedDb = db;
        return cachedDb;
      })
  );
};