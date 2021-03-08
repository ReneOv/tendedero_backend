import { gql } from 'apollo-server';

export const typeDefs = gql`
    # A User
    type User {
        id: ID!
        name: String!
        userName: String!
        postCount: Int!
        posts: [Post]!
    }

    # A Post Object
    type Post {
        id: ID!
        message: String!
        title: String!
        userId: String!
        user: User!
        votes: Int!
        score: Int!
        date: Date!
    }

    type Query {
        posts: [Post]
        user(id: String!): User
    }
    `;