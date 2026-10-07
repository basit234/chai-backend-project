import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const tweet = await Tweet.create({
        content: req.body.content,
        owner: req.user._id,
    });

    return res
        .status(201)
        .json(new ApiResponse(201, tweet, 'Tweet created successfully'));
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, 'Invalid user ID');
    }

    const tweets = await Tweet.find({ owner: userId })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));
        
    const total = await Tweet.countDocuments({ owner: userId });
    const pagination = {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
    }    

    return res
        .status(200)
        .json({
            success: true,
            message: 'Tweets found successfully',
            data: tweets,
            pagination
        })
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const { tweetId } = req.params;
    const { content } = req.body;

    if (!tweetId) {
        throw new ApiError(400, 'Tweet ID is required');
    }

    if (!content) {
        throw new ApiError(400, 'Content is required');
    }

    const tweet = await Tweet.findOneAndUpdate(
        {
            _id: tweetId,
        },
        {
            content: content,
        },
        { new: true }
    )

    return res
        .status(200)
        .json(new ApiResponse(200, tweet, 'Tweet updated successfully'));
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const { tweetId } = req.params;

    if (!tweetId) {
        throw new ApiError(400, 'Tweet ID is required');
    }

    const tweet = await Tweet.findByIdAndDelete(tweetId);
    return res
        .status(200)
        .json(new ApiResponse(200, tweet, 'Tweet deleted successfully'));
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}