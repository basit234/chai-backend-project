import mongoose, {isValidObjectId} from "mongoose"
import { asyncHandler } from "../utils/asyncHandler.js";
import Video from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"

const getAllVideos = asyncHandler(async(req, res)=>{
    const {page = 1, limit = 10, query, sortBy, sortType, userId} = req.query
    // TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async(req, res)=>{
    const {title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    if(!title?.trim() || !description?.trim()) {
        throw new ApiError(400, 'Title and description are required');
    }

    const existedVideo = await Video.findOne({
        $or : [{title}, {description}]
    })

    if (existedVideo) {
        throw new ApiError(400, 'Video already exists');
    }

    const videoLocalPath = req.files?.videoFile[0].path
    const thumbnailLocalPath = req.files?.thumbnail[0].path

    if(!videoLocalPath || !thumbnailLocalPath) {
        throw new ApiError(400, 'Video and thumbnail are required');
    }

    const video = await uploadOnCloudinary(videoLocalPath)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if(!video || !thumbnail) {
        throw new ApiError(400, 'Error while uploading video or thumbnail');
    }

    const owner = req.user?._id

    const newVideo = await Video.create({
        videoFile : video.url,
        thumbnail : thumbnail.url,
        title,
        description,
        duration : video.duration,
        views : 0,
        owner,
        isPublished : true
    })

    return res
    .status(201)
    .json(new ApiResponse(201, newVideo, 'Video published successfully'));
})

const getVideoById = asyncHandler(async(req, res)=>{
    const {videoId} = req.params
    // TODO: get video by id

    const video = await Video.findById(videoId)

    if(!video) {
        throw new ApiError(404, 'Video not found');
    }

    return res
    .status(200)
    .json(new ApiResponse(200, video, 'Video found successfully'));
})

const updateVideo = asyncHandler(async(req, res)=>{
    const {videoId} = req.params
     //TODO: update video details like title, description, thumbnail
})

const deleteVideo = asyncHandler(async(req, res)=>{
    const {videoId} = req.params
    // TODO: delete video
})

const togglePublishStatus = asyncHandler(async(req, res)=>{
    const {videoId} = req.params
    // TODO: toggle publish status
})

export {getAllVideos , publishAVideo, getVideoById, updateVideo, deleteVideo, togglePublishStatus}