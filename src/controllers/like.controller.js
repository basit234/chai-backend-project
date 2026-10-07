import mongoose, { isValidObjectId } from 'mongoose';
import { Like } from '../models/like.model.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    //TODO: toggle like on video
    const userId = req.user._id;
    const like = await Like.findOne({ likedBy: userId, video: videoId });
    if (!like) {
        const newLike = await Like.create({
            likedBy: userId,
            video: videoId,
        });
        return res
            .status(201)
            .json(new ApiResponse(201, newLike, 'Video liked successfully'));
    }
    await Like.findByIdAndDelete(like._id);
    return res
        .status(200)
        .json(new ApiResponse(200, {}, 'Video unliked successfully'));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    //TODO: toggle like on comment
    const userId = req.user._id;
    const like = await Like.findOne({ likedBy: userId, comment: commentId });
    if (!like) {
        const newLike = await Like.create({
            likedBy: userId,
            comment: commentId,
        });
        return res
            .status(201)
            .json(new ApiResponse(201, newLike, 'Comment liked successfully'));
    }
    await Like.findByIdAndDelete(like._id);
    return res
        .status(200)
        .json(new ApiResponse(200, {}, 'Comment unliked successfully'));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    //TODO: toggle like on tweet
    const userId = req.user._id;
    const like = await Like.findOne({ likedBy: userId, tweet: tweetId });
    if (!like) {
        const newLike = await Like.create({
            likedBy: userId,
            tweet: tweetId,
        });
        return res
            .status(201)
            .json(new ApiResponse(201, newLike, 'Tweet liked successfully'));
    }
    await Like.findByIdAndDelete(like._id);
    return res
        .status(200)
        .json(new ApiResponse(200, {}, 'Tweet unliked successfully'));
});

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const userId = req.user._id;
    const { page = 1, limit = 10 } = req.query;

    const likedVideos = await Like.find({ likedBy: userId , video: { $exists: true } })
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .populate('video', 'title thumbnail videoFile');

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                likedVideos,
                'Liked videos fetched successfully'
            )
        );
});

export { toggleVideoLike, toggleCommentLike, toggleTweetLike, getLikedVideos };
