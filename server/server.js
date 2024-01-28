import express from "express"; 
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcrypt";
import User from "./models/User.js"; // Own Model
import authRouter from "./routes/auth.js"
import { verifyToken } from "./middleware/auth.js";
import axios from 'axios';

// Configurations (middleware, packages, etc)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config(); 
const app = express();
app.use(express.json()); // Parses incoming JSON requests and puts it in req.body
app.use(express.urlencoded({extended: false}));
app.use(helmet()); 
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin"})); // According to the site: blocks others from 
                                                                      // loading your resources cross-origin
app.use(bodyParser.json({limit: "30mb", extended: true}));
app.use(bodyParser.urlencoded({limit: "30mb", extended: true}));
app.use(cors());

// ROUTES
app.use("/auth", authRouter);
// -- A GET ROUTE to grab user specific content, like saved music, etc. 
app.get('/check/:id', verifyToken, async (req, res) => {
    const {id} = req.params;
    const user = await User.findById(id);
    res.status(200).json({msg: 'authorized!', user: user});
});

app.get('/login', async (req, res) => {
    try {
      // Perform authentication and handle sensitive information on the server
      const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        body: `grant_type=client_credentials&client_id=${process.env.SPOTIFY_CLIENT_ID}&client_secret=${process.env.SPOTIFY_CLIENT_SECRET}`,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

// MONGOOSE SETUP
const PORT = process.env.PORT || 6000;
mongoose.connect(process.env.MONGO_URI).then(()=> {
    app.listen(PORT, () => console.log(`Server Port: ${PORT}`));
}).catch((error) => console.log(`${error}, did not connect`));

