import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));
app.use(express.json({limit: '1mb'}));
app.use(express.urlencoded({limit: '1mb', extended: true}));
app.use(express.static('public'));
app.use(cookieParser()); 

const api = "/api/v1";

// routes import
import userRouter from "./routes/user.routes.js"
import videoRouter from "./routes/video.routes.js"
import commentRouter from "./routes/comment.routes.js"
import dashboardRouter from "./routes/dashboard.routes.js"
import likeRouter from "./routes/like.routes.js"
import playlistRouter from "./routes/playlist.routes.js"
import subscriptionRouter from "./routes/subscription.routes.js"
import tweetRouter from "./routes/tweet.routes.js"

// routes declaration
app.use(`${api}/users`, userRouter);
app.use(`${api}/videos`, videoRouter);
app.use(`${api}/comments`, commentRouter);
app.use(`${api}/dashboard`, dashboardRouter);
app.use(`${api}/likes`, likeRouter);
app.use(`${api}/playlists`, playlistRouter);
app.use(`${api}/subscriptions`, subscriptionRouter);
app.use(`${api}/tweets`, tweetRouter);

export default app