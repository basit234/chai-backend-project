import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiError.js';
import { User } from '../models/user.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/apiResponse.js';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        // save the refresh token to the database
        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false});

        return { accessToken, refreshToken };
        
    } catch (error) {
        throw new ApiError(500, 'Something went wrong while generating refresh and access tokens');
    }
}

// User registration

const registerUser = asyncHandler(async (req, res) => {
    // get user details from request body
    // validation - not empty
    // check if user already exists
    // check for images , check for avatar
    // upload images to cloudinary
    // create user object and save to database
    // remove password and refresh token from response
    // check for user creation success
    // send response

    // get user details from request body
    const { userName, email, fullName, password } = req.body;
    console.log(userName, email, fullName, password);

    // validation - not empty
    const requiredFields = [userName, email, fullName, password];

    if (requiredFields.some((field) => field?.trim() === '')) {
        throw new ApiError(400, 'All fields are required');
    }

    // check if user already exists
    const existedUser = await User.findOne({
        $or: [{ userName }, { email }],
    });

    if (existedUser) {
        throw new ApiError(409, 'User already exists');
    }

    console.log(req.files);

    // check for images , check for avatar
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (
        req.files &&
        Array.isArray(req.files.coverImage) &&
        req.files.coverImage.length > 0
    ) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, 'Avatar image is required');
    }

    // upload imgaes to cloudnary

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if (!avatar) {
        throw new ApiError(400, 'Avatar image upload failed');
    }

    // create user object and save to database
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || '',
        email,
        password,
        userName: userName.toLowerCase(),
    });

    // remove password and refresh token from response

    const createdUser = await User.findById(user._id).select(
        '-password -refreshToken'
    );

    if (!createdUser) {
        throw new ApiError(
            500,
            'Something went wrong while creating the user.'
        );
    }

    //send response

    return res
        .status(201)
        .json(
            new ApiResponse(200, 'User registered successfully', createdUser)
        );
});

// User login

const loginUser = asyncHandler(async (req, res) => {
    // get user details from request body
    // username or email - validation - not empty
    // check if user exists
    // check for password
    // access and refresh token generate
    // remove password and refresh token from response
    // send cookies


    // get user details from request body

    const {email, userName , password} = req.body

    // username or email - validation - not empty

    if (!(email || userName)) {
        throw new ApiError(400, 'Email or username is required');
    }

    // check if user exists

    const user = await User.findOne({
        $or : [{email} , {userName}]
    })

    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    // check for password

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, 'Invalid user credentials');
    }

    // access and refresh token generate

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user?._id);

    //  send cookies
    const loggedInUser = await User.findById(user._id).select(
        '-password -refreshToken'
    );
    
    const option = {
        httpOnly: true,
        secure: true,
    };

    return res
    .status(200)
    .cookie('accessToken', accessToken, option)
    .cookie('refreshToken', refreshToken, option)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser,
                accessToken,
                refreshToken,
            },
            'User logged in successfully'
        )
    );
});

// User logout

const logoutUser = asyncHandler(async (req, res) => {
    await User.findOneAndUpdate(
        req.user._id, 
        {
            refreshToken: undefined
        },
        {
            new: true
        }
    )
    const option = {
        httpOnly: true,
        secure: true,
    };

    return res
    .status(200)
    .clearCookie('accessToken', option)
    .clearCookie('refreshToken', option)
    .json(new ApiResponse(200, {}, 'User logged out successfully'));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    // get refresh token from user
    const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401, 'Unauthorized request');
    }

    // verify incoming refresh token
    try {
        const decodedToken = jwt.verify(incomingRefreshToken , process.env.REFRESH_TOKEN_SECRET)
        // find user 
        const user = await User.findById(decodedToken?._id)
        if(!user) {
            throw new ApiError(401, 'Invalid refresh token');
        }

        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401, 'Refresh token is expired or used');
        }

        // generate new access and refresh token 

        const options = {
            httpOnly: true,
            secure: true,
        };

        const {accessToken, newRefreshToken} =  await generateAccessAndRefreshTokens(user?._id)

        return res
        .status(200)
        .cookie('accessToken', accessToken , options)
        .cookie('refreshToken', newRefreshToken , options)
        .json(new ApiResponse(200, {accessToken, newRefreshToken}, 'Access token refreshed successfully'));

    } catch (error) {
        throw new ApiError(401,  error?.message || 'Invalid refresh token');
    }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const {oldPassword , newPassword} = req.body  
    // find the user
    const user = await User.findById(req.user?._id)
    // check for old password by using the isPasswordCorrect from user model
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
    if(!isPasswordCorrect){
        throw new ApiError(400, 'Invalid old password');
    }
    // set the password in user object
    user.password = newPassword
    // save the new password
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200, {}, 'Password changed successfully'));   

});

const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(200, req.user, "User details fetched successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
    const {fullName , email} = req.body

    if (!fullName || !email) {
        throw new ApiError(400, 'All fields are required');
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set : {
                fullName,
                email : email
            }
        },
        {new : true}
    ).select('-password')

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req?.file?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, 'Avatar image is required');
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar.url){
        throw new ApiError(400, 'Error while uploading avatar');
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set : {
                avatar : avatar.url
            }
        },
        {new : true}
    ).select('-password')

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar updated successfully"));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req?.file?.path;

    if (!coverImageLocalPath) {
        throw new ApiError(400, 'Cover image is required');
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!coverImage.url){
        throw new ApiError(400, 'Error while uploading avatar');
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set : {
                coverImage : coverImage.url
            }
        },
        {new : true}
    ).select('-password')

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Cover image updated successfully"));
});

const getUserChannelProfile = asyncHandler(async (req, res) => { 
    const {userName} = req.params

    if (!userName?.trim()) {
        throw new ApiError(400, 'Username is required');
    }

    const channel = await User.aggregate([
        {
            $match: {
                userName : userName?.toLowerCase()
            }
        },
        {
            $lookup : {
                from : 'subscriptions',
                localField : '_id',
                foreignField : 'channel',
                as : 'subscribers'
            }
        },
        {
            $lookup : {
                from : 'subscriptions',
                localField : '_id',
                foreignField : 'subscriber',
                as : 'subscribedTo'
            }
        },
        {
            $addFields : {
                subscribersCount : { $size: '$subscribers' },
                channelsSubscribedToCount : { $size: '$subscribedTo' }
            },
            isSubscribed : {
                $cond: {
                    if : {$in: [req.user?._id, '$subscribers.subscriber']},
                    then : true,
                    else : false
                }
            }
        },
        {
            $project : {
                fullName : 1,
                userName : 1,
                email : 1,
                avatar : 1,
                coverImage : 1,
                subscribersCount : 1,
                channelsSubscribedToCount : 1,
                isSubscribed : 1
            }
        }
    ])

    if (!channel?.length) {
        throw new ApiError(404, 'Channel not found');
    }

    return res
    .status(200)
    .json(new ApiResponse(200, channel[0], "Channel fetched successfully"))
})

const getWatchHistory = asyncHandler(async (req, res) => {
    const user = User.aggregate([
        {
            $match : {
                _id : new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup : {
                from : 'videos',
                localField : 'watchHistory',
                foreignField : '_id',
                as : 'watchHistory',
                pipeline :[
                    {
                        $lookup : {
                            from : "users",
                            localField : "owner", 
                            foreignField : "_id",
                            as : "owner",
                            pipeline : [
                                {
                                    $project : {
                                        fullName : 1,
                                        userName : 1,
                                        avatar : 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields : {
                            owner : "$owner"
                        }
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(new ApiResponse(200, user[0].watchHistory, "Watch history fetched successfully"))
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory,
};
