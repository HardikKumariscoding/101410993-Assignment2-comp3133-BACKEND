import express from "express";
import { ApolloServer } from "apollo-server-express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import cors from "cors";

const MONGO_URI = "mongodb+srv://admin:admin123@clustercomp3123.llert.mongodb.net/?retryWrites=true&w=majority&appName=Clustercomp3123";
const JWT_SECRET = "8609b5c9fe41c78b1ed44776b96d2e59739154e63a3d31566e83c3b2f74677e9";
const PORT = 5000;

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log("MongoDB Connection Error:", err));

const app = express();

const corsOptions = {
    origin: 'https://101410993-assignment2-comp3133-frontend.vercel.app', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, 
    allowedHeaders: 'Content-Type, Authorization', 
};

app.use(cors(corsOptions)); 
app.use(express.json());

import typeDefs from "./graphql/schema.js";
import resolvers from "./graphql/resolvers.js";

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
        const token = req.headers.authorization || "";
        try {
            const user = jwt.verify(token, JWT_SECRET);
            return { user };
        } catch (err) {
            return {};
        }
    },
});

async function startServer() {
    await server.start();
    server.applyMiddleware({ app, cors: false }); 

    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}${server.graphqlPath}`);
    });
}

startServer();