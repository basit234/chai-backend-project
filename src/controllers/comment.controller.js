import { asyncHandler } from '../utils/asyncHandler.js';
import { Comment } from '../models/comment.model.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import mongoose from 'mongoose';

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const total = await Comment.countDocuments({ video: videoId });

    // simple way to get comments with owner details using populate
    // const comments = await Comment.find({ video: videoId })
    //     .populate('owner', 'userName email')
    //     .skip((page - 1) * limit)
    //     .limit(limit);
    const comments = await Comment.aggregate([
        { $match: { video: new mongoose.Types.ObjectId(videoId) } },
        {
            // Join with the users collection to get the owner details
            $lookup: {
                from: 'users',
                localField: 'owner',
                foreignField: '_id',
                as: 'owner',
            },
        },
        {
            $unwind: '$owner', // Unwind the owner array to get individual owner documents and unwind is used to deconstruct the owner array field from the input documents to output a document for each element. If the owner array is empty, the comment will be excluded from the results.
        },
        {
            // get only the required fields from the owner
            $project: {
                content: 1,
                video: 1,
                owner: {
                    userName: 1,
                    email: 1,
                    avatar: 1,
                },
            },
        },
        {
            // paginate the results
            $skip: (page - 1) * limit,
        },
        {
            // limit the results
            $limit: Number(limit),
        },
    ]);
    const pagination = {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
    }
    return res.status(200).json({
        success: true,
        message: 'Comments found successfully',
        data: comments,
        pagination
    });
});

const addComment = asyncHandler(async (req, res) => {
    //TODO: add a comment to a video
    const { videoId } = req.params;
    const { content } = req?.body;
    const userId = req.user._id;
    if (!videoId) {
        throw new ApiError(400, 'Video ID is required');
    }
    if (!content) {
        throw new ApiError(400, 'Content is required');
    }

    const comment = await Comment.create({
        content,
        video: videoId,
        owner: userId,
    });

    return res
        .status(201)
        .json(new ApiResponse(201, comment, 'Comment added successfully'));
});

const updateComment = asyncHandler(async (req, res) => {
    //TODO: update a comment to a video
    const { commentId } = req.params;
    const { content } = req?.body;

    if (!commentId) {
        throw new ApiError(400, 'Comment ID is required');
    }

    if (!content) {
        throw new ApiError(400, 'Content is required');
    }

    const comment = await Comment.findOneAndUpdate(
        {
            _id: commentId,
        },
        {
            content: content,
        },
        { new: true }
    );

    return res
        .status(200)
        .json(new ApiResponse(200, comment, 'Comment updated successfully'));
});

const deleteComment = asyncHandler(async (req, res) => {
    //TODO: delete a comment to a video
    const { commentId } = req.params;

    if (!commentId) {
        throw new ApiError(400, 'Comment ID is required');
    }

    const comment = await Comment.findByIdAndDelete(commentId);
    return res
        .status(200)
        .json(new ApiResponse(200, comment, 'Comment deleted successfully'));
});

export { getVideoComments, addComment, updateComment, deleteComment };
