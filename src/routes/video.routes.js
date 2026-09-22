import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import {
    deleteVideo,
    getAllVideos,
    getVideoById,
    publishAVideo,
    togglePublishStatus,
    updateVideo,
} from '../controllers/video.controller.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router
    .route('/')
    .get(getAllVideos)
    .post(
        upload.fields([
            {
                name: 'videoFile',
                maxCount: 1,
            },
            {
                name: 'thumbnail',
                maxCount: 1,
            },
        ]),
        publishAVideo
    );

router
    .route('/:videoId')
    .get(getVideoById)
    .delete(deleteVideo)
    .patch(
        upload.fields([
            { name: 'videoFile', maxCount: 1 },
            { name: 'thumbnail', maxCount: 1 },
        ]),
        updateVideo
    ); // the route will be same for the get , delete and update video but the method will tell what to do

router.route('/toggle/publish/:videoId').patch(togglePublishStatus);

export default router;
