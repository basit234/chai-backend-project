import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import {
    addComment,
    deleteComment,
    getVideoComments,
    updateComment,
} from '../controllers/comment.controller.js';

const router = Router();

router.use(verifyJWT);

router
    .route('/:videoId')
    .get(getVideoComments) // get all comments for a video
    .post(addComment); // add a comment to a video
router
    .route('/c/:commentId')
    .patch(updateComment) // update a comment to a video
    .delete(deleteComment); // delete a comment to a video

export default router;
