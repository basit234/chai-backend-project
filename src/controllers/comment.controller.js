import { asyncHandler } from '../utils/asyncHandler.js';
import { Comment } from '../models/comment.model.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;
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
    console.log(req, 'request body');
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

    return res.status(200).json({
        success: true,
        message: 'Comment updated successfully',
        data: comment,
    });
});

const deleteComment = asyncHandler(async (req, res) => {
    //TODO: delete a comment to a video
    const { commentId } = req.params;

    if (!commentId) {
        throw new ApiError(400, 'Comment ID is required');
    }

    const comment = await Comment.findByIdAndDelete(commentId);
    return res.status(200).json({
        success: true,
        message: 'Comment deleted successfully',
        data: comment,
    });
});

export { getVideoComments, addComment, updateComment, deleteComment };
