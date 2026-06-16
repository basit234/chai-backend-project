import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiError.js';
import { User } from '../models/user.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/apiResponse.js';

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

export { registerUser };
