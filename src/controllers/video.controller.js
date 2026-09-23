import { asyncHandler } from "../utils/asyncHandler.js";
import Video from "../models/video.model.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"

const getAllVideos = asyncHandler(async(req, res)=>{
    const {page = 1, limit = 10, query, sortBy, sortType, userId} = req.query
    // TODO: get all videos based on query, sort, pagination
    // console.log(req.query, "request")
    
    const filter = {}
    if(query){
        filter.$or=[
            {
                title : {$regex : query}
            },
            {    
                description : {$regex : query}
            }
        ]
    }
    const sort = {}
    if(sortBy && sortType) {
        sort[sortBy] = Number(sortType)
    }
    const total = await Video.countDocuments({
            owner : userId,
            ...filter
    })
    const videos = await Video.find({
        owner : userId,
        ...filter
    })
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit *1)
    
    return res
    .status(200)
    // .json(new ApiResponse(200, videos ,  "All videos"))
    .json({
        success : true,
        message : "All videos",
        data : videos,
        total,
        page : Number(page),
        limit : Number(limit),
        totalPages : Math.ceil(total / limit)
    })
})

// Create a Video
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

    const videoLocalPath = req.files?.videoFile?.[0].path
    const thumbnailLocalPath = req.files?.thumbnail?.[0].path

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

// get a single video
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

// update a video
const updateVideo = asyncHandler(async(req, res)=>{
    const {videoId} = req.params
     //TODO: update video details like title, description, thumbnail
    const {title, description} = req.body
    // console.log(title, description, videoFile, thumbnail, "aaaaaaaaa");
    // console.log(req.files?.videoFile[0].path, "req")
    let videoLocalPath = req?.files?.videoFile?.[0]?.path
    let thumbnailLocalPath = req?.files?.thumbnail?.[0]?.path
    if(videoLocalPath) {
        // console.log(videoLocalPath, "updatedVideo");
         videoLocalPath = await uploadOnCloudinary(videoLocalPath)
    }
    if(thumbnailLocalPath) {
        // console.log(thumbnailLocalPath, "updatedThumbnail");
         thumbnailLocalPath = await uploadOnCloudinary(thumbnailLocalPath)
    }
    const existingVideo = await Video.findById(videoId)
    const existingVideoPath = existingVideo?.videoFile
    const existingThumbnailPath = existingVideo?.thumbnail
    const newVideo = videoLocalPath ? videoLocalPath.url : existingVideoPath
    const newThumbnail = thumbnailLocalPath ? thumbnailLocalPath.url : existingThumbnailPath
    const newDuration = videoLocalPath ? videoLocalPath.duration : existingVideo?.duration
    const video = await Video.findByIdAndUpdate(videoId, {
        title,
        description,
        videoFile : newVideo,
        thumbnail : newThumbnail,
        duration : newDuration
    }, {
        new : true
    })

    return res
    .status(200)
    .json(new ApiResponse(200, video, 'Video updated successfully'));
})


// This is the optimized version for the updateVideo but for now I will stick to my own solution
// const updateVideo = asyncHandler(async (req, res) => {
//     const { videoId } = req.params
//     const { title, description } = req.body

//     let videoLocalPath = req?.files?.videoFile?.[0]?.path
//     let thumbnailLocalPath = req?.files?.thumbnail?.[0]?.path

//     if (videoLocalPath) {
//         videoLocalPath = await uploadOnCloudinary(videoLocalPath)
//     }

//     if (thumbnailLocalPath) {
//         thumbnailLocalPath = await uploadOnCloudinary(thumbnailLocalPath)
//     }

//     const updateData = {
//         title,
//         description
//     }

//     if (videoLocalPath) {
//         updateData.videoFile = videoLocalPath.url
//     }

//     if (thumbnailLocalPath) {
//         updateData.thumbnail = thumbnailLocalPath.url
//     }

//     const video = await Video.findByIdAndUpdate(
//         videoId,
//         updateData,
//         {
//             new: true
//         }
//     )

//     return res
//         .status(200)
//         .json(new ApiResponse(200, video, 'Video updated successfully'))
// })

const deleteVideo = asyncHandler(async(req, res)=>{
    const {videoId} = req.params
    // TODO: delete video
    const video = await Video.findByIdAndDelete(videoId)

    if(!video) {
        throw new ApiError(404, 'Video not found');
    }
    

    return res
    .status(200)
    .json(new ApiResponse(200, video, 'Video deleted successfully'));
})

const togglePublishStatus = asyncHandler(async(req, res)=>{
    const {videoId} = req.params
    // TODO: toggle publish status
    const video = await Video.findById(videoId)

    if(!video) {
        throw new ApiError(404, 'Video not found');
    }

    video.isPublished = !video.isPublished
    await video.save()

    return res
    .status(200)
    .json(new ApiResponse(200, video, 'Video published status toggled successfully'));
})

export {getAllVideos , publishAVideo, getVideoById, updateVideo, deleteVideo, togglePublishStatus}