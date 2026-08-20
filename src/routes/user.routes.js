import { Router } from "express";
import { changeCurrentPassword, deleteUserAvatar, deleteUserCoverImage, getCurrentUser, getUserChannelProfile, getWatchHistory, loginUser, logoutUser, refreshAccessToken, registerUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([ // multer middleware used
        {
            name: 'avatar',
            maxCount: 1
        },
        {
            name: 'coverImage',
            maxCount: 1
        }
    ]),
    registerUser
);

router.route("/login").post(loginUser);

router.route("/logout").post(verifyJWT, logoutUser);

router.route("/refresh-token").post(refreshAccessToken);

router.route("/change-password").post(verifyJWT, changeCurrentPassword);

router.route("/current-user").get(verifyJWT, getCurrentUser);

router.route("/update-account-details").patch(verifyJWT, updateAccountDetails);

router.route("/update-user-avatar").patch(verifyJWT, upload.single('avatar'), updateUserAvatar);

router.route("/delete-user-avatar").delete(verifyJWT, deleteUserAvatar);

router.route("/update-user-cover-image").patch(verifyJWT, upload.single('coverImage'), updateUserCoverImage);

router.route("/delete-user-cover-image").delete(verifyJWT, deleteUserCoverImage);

router.route(`/c/:userName`).get(verifyJWT, getUserChannelProfile);

router.route(`/watch-history`).get(verifyJWT, getWatchHistory);

export default router;