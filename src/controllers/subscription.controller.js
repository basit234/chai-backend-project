import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    const userId = req.user._id
    const channel = await User.findById(channelId)
    if(!channel){
        throw new ApiError(404, 'Channel not found')
    }

    const subscription = await Subscription.findOne({subscriber: userId, channel: channelId})
    if(!subscription){
        const newSubscription = await Subscription.create({
            subscriber: userId,
            channel: channelId
        })
        return res.status(201).json(new ApiResponse(201, newSubscription, 'Subscribed successfully'))
    }
    await Subscription.findByIdAndDelete(subscription._id)
    return res.status(200).json(new ApiResponse(200, {}, 'Unsubscribed successfully'))
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    const {page = 1, limit = 10} = req.query

    const subscribers = await Subscription.find({channel: channelId})
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .populate('subscriber', 'userName email')

    return res.status(200).json(new ApiResponse(200, subscribers, 'Subscribers fetched successfully'))
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    const { page = 1, limit = 10 } = req.query
    const subscriptions = await Subscription.find({ subscriber: subscriberId })
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .populate('channel', 'userName email')

    return res.status(200).json(new ApiResponse(200, subscriptions, 'Subscribed channels fetched successfully'))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}