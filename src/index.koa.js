const { prisma } = require('./generated/prisma-client')
const Query = require('./resolvers/Query')
const Mutation = require('./resolvers/Mutation')
const User = require('./resolvers/User')
const Link = require('./resolvers/Link')
const Subscription = require('./resolvers/Subscription')
const Vote = require('./resolvers/Vote')


const Koa = require('koa');
const { ApolloServer, gql } = require('apollo-server-koa');
const typeDefs = require('./schema');

const resolvers = {
  Query,
  Mutation,
  User,
  Link,
  Subscription,
  Vote
}

const server = new ApolloServer({ 
  typeDefs,
  resolvers,
  context: request => {
    return ({
      ...request,
      prisma
    })
  },
});


const app = new Koa();

app.use(async (ctx, next) => {
  const start = Date.now();
  await next(); // 在这之前做权限校验
  const ms = Date.now() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

server.applyMiddleware({ app });


const port = 3000;
const host = 'localhost';

app.listen(port, host, () =>
  console.log(`🚀 Server ready at http://${host}:${port}${server.graphqlPath}`),
);


