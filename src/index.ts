import * as admin from 'firebase-admin';
import { ApolloServer, ApolloError, ValidationError } from 'apollo-server';
import * as typeDefs from './schema';

const serviceAccount = require('../service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

interface User {
  id: string;
  name: string;
  userName: string;
  postCount: number;
}

interface Post {
  id: string;
  votes: number;
  score: number,
  title: string,
  message: string;
  date: Date;
  userId: string;
}

const resolvers = {
  Query: {
    async post() {
      const post = await admin
        .firestore()
        .collection('post')
        .get();
      return post.docs.map(tweet => tweet.data()) as Post[];
    },
    async user(_: null, args: { id: string }) {
      try {
        const userDoc = await admin
          .firestore()
          .doc(`users/${args.id}`)
          .get();
        const user = userDoc.data() as User | undefined;
        return user || new ValidationError('User ID not found');
      } catch (error) {
        throw new ApolloError(error);
      }
    }
  },
  User: {
    async post(user) {
      try {
        const userTweets = await admin
          .firestore()
          .collection('post')
          .where('userId', '==', user.id)
          .get();
        return userTweets.docs.map(tweet => tweet.data()) as Post[];
      } catch (error) {
        throw new ApolloError(error);
      }
    }
  },
  Post: {
    async user(post) {
      try {
        const postAuthor = await admin
          .firestore()
          .doc(`user/${post.userId}`)
          .get();
        return postAuthor.data() as User;
      } catch (error) {
        throw new ApolloError(error);
      }
    }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true
});

server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
