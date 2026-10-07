import mongoose, { isValidObjectId } from 'mongoose';
import { Playlist } from '../models/playlist.model.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    if (!name || !description) {
        throw new ApiError(400, 'Name and description are required');
    }
    //TODO: create playlist
    const playList = await Playlist.create({
        name: name,
        description: description,
        owner: req.user._id,
        videos: [],
    });

    return res
        .status(201)
        .json(new ApiResponse(201, playList, 'Playlist created successfully'));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    //TODO: get user playlists
    
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, 'Invalid user ID');
    }

    const playlists = await Playlist.aggregate([
        {$match: { owner: new mongoose.Types.ObjectId(userId) }},
        {$lookup: {
            from: 'videos',
            localField: 'videos',
            foreignField: '_id',
            as: 'videos'
        }},
        {$project : {
            name: 1,
            description: 1,
            owner: 1,
            videos: {
                title: 1,
                description: 1,
                thumbnail: 1,
                videoFile: 1,
                _id: 1
            },
        }},
        {$skip: (page - 1) * limit},
        {$limit: Number(limit)}
    ])

    const total = await Playlist.countDocuments({ owner: userId });
    const pagination = {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
    };

    return res.status(200).json({
        success: true,
        message: 'Playlists found successfully',
        data: playlists,
        pagination,
    });
});

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    //TODO: get playlist by id
    const playlist = await Playlist.findById(playlistId).populate('videos');
    return res
        .status(200)
        .json(new ApiResponse(200, playlist, 'Playlist found successfully'));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;
    // TODO: add video to playlist
    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $push: { videos: videoId },
        },
        {
            new: true,
        }
    );

    return res
        .status(200)
        .json(new ApiResponse(200, playlist, 'Video added to playlist successfully'));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;
    // TODO: remove video from playlist
    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull: { videos: videoId },
        },
        {
            new: true,
        }
    );

    return res
        .status(200)
        .json(new ApiResponse(200, playlist, 'Video removed from playlist successfully'));
});

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    // TODO: delete playlist
    const playlist = await Playlist.findByIdAndDelete(playlistId);

    return res
        .status(200)
        .json(new ApiResponse(200, playlist, 'Playlist deleted successfully'));
});

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { name, description } = req.body;

    if (!name || !description) {
        //TODO: update playlist
        throw new ApiError(400, 'Name and description are required');
    }
    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            name: name,
            description: description,
        },
        {
            new: true,
        }
    );

    return res
        .status(200)
        .json(new ApiResponse(200, playlist, 'Playlist updated successfully'));
});

export {createPlaylist, getUserPlaylists, getPlaylistById, addVideoToPlaylist, removeVideoFromPlaylist, deletePlaylist, updatePlaylist,};