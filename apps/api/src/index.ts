import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { createYoga } from 'graphql-yoga';
import { drizzle } from 'drizzle-orm/d1';
import { schema } from './graphql/schema';
import * as dbSchema from './db/schema';

export interface Env {
  DB: D1Database;
  ENVIRONMENT: string;
  [key: string]: any;
}

const app = new Hono<{ Bindings: Env }>();

// CORS middleware
app.use('*', cors({
  origin: ['http://localhost:3000', 'https://pams-web.pages.dev'],
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Health check endpoint
app.get('/health', (c) => {
  return c.json({ 
    status: 'ok', 
    environment: c.env?.ENVIRONMENT || 'unknown',
    timestamp: new Date().toISOString() 
  });
});

// GraphQL endpoint
app.use('/graphql', async (c) => {
  if (!c.env?.DB) {
    return c.json({ error: 'Database not available' }, 500);
  }
  
  const db = drizzle(c.env.DB as D1Database, { schema: dbSchema });
  
  const yoga = createYoga({
    schema,
    context: {
      db,
      env: c.env,
    },
    graphqlEndpoint: '/graphql',
    cors: false, // Handled by Hono middleware
  });

  return yoga.fetch(c.req.raw);
});

export default app;