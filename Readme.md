# MERN Video Platform — Backend

A REST API backend for a video-sharing platform built with **Node.js, Express.js, MongoDB, and Mongoose**. This project explores core backend development concepts through features such as video management, comments, tweets, playlists, subscriptions, likes, authentication, and media uploads.

The codebase is organized around routes, middleware, controllers, and database models to separate request handling and data operations.

## Tech Stack

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express.js | REST API development |
| MongoDB | Database |
| Mongoose | Data modeling and database operations |
| JSON Web Tokens (JWT) | Token-based authentication |
| bcrypt | Password hashing |
| Cloudinary | Media storage |
| Multer | File upload handling |
| Postman | API testing |

## Features

### Video Management
- Create and publish videos with thumbnails.
- Upload video files and thumbnails to Cloudinary.
- Retrieve, update, and delete videos.
- Toggle video publication status.
- List videos with pagination, filtering, search, and sorting.
- Update video information and replace media when new files are provided.

### Comments
- Create comments on videos.
- Retrieve comments associated with a video.
- Update and delete comments.
- Retrieve comment-owner information using MongoDB aggregation.

### Tweets
- Create, retrieve, update, and delete tweets.
- Retrieve a user's tweets with pagination.

### Playlists
- Create, retrieve, update, and delete playlists.
- Add videos to and remove videos from playlists.
- Retrieve playlist details and associated videos using Mongoose population and MongoDB aggregation.

### Subscriptions
- Subscribe to and unsubscribe from channels.
- Retrieve a channel's subscribers.
- Retrieve the channels a user has subscribed to.

### Likes
- Toggle likes on videos, comments, and tweets.
- Retrieve videos liked by the authenticated user.

### Authentication and Middleware
- Implement JWT-based authentication for protected routes.
- Use middleware to process requests and enforce access requirements.
- Hash passwords using bcrypt.

## Backend Concepts

This project provides hands-on practice with:

- Designing RESTful APIs with Express.js.
- Organizing routes, controllers, middleware, and models.
- Performing CRUD operations with Mongoose.
- Working with MongoDB references and document relationships.
- Using `populate()` and aggregation pipelines with `$lookup`.
- Implementing pagination, filtering, searching, and sorting.
- Handling asynchronous operations and errors.
- Uploading media through Multer and Cloudinary.
- Testing endpoints and debugging requests with Postman.

## Project Structure

The application follows a modular backend structure. The main areas include:

- **Routes:** Define API endpoints and connect them to middleware and controllers.
- **Controllers:** Handle incoming requests and coordinate application operations.
- **Models:** Define MongoDB document structures using Mongoose.
- **Middleware:** Handle authentication and other request-processing tasks.
- **Utilities:** Provide reusable helpers for API responses, errors, and related functionality.

See the `src` directory for the actual project organization.

## Getting Started

### Prerequisites

- Node.js and npm
- MongoDB local instance or MongoDB Atlas
- Cloudinary account for media upload functionality
- Postman or another API testing client

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/basit234/chai-backend-project.git
   cd chai-backend-project
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the project root and configure the environment variables required by the application.

   Example configuration:

   ```env
   PORT=8000
   MONGODB_URI=your_mongodb_connection_string
   CORS_ORIGIN=your_allowed_origin
   ACCESS_TOKEN_SECRET=your_access_token_secret
   ACCESS_TOKEN_EXPIRY=your_access_token_expiry
   REFRESH_TOKEN_SECRET=your_refresh_token_secret
   REFRESH_TOKEN_EXPIRY=your_refresh_token_expiry
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

   These are example names and values. Check the application's configuration and environment-variable references to confirm the exact names required by your code.

   **Never commit real secrets, credentials, or production environment files.**

4. Start the development server using the script defined in `package.json`. If the project defines a `dev` script, run:

   ```bash
   npm run dev
   ```

## API Modules

The API covers the following resource areas:

| Module | Functionality |
|---|---|
| Videos | Create, retrieve, update, delete, publish, search, and paginate videos |
| Comments | Create, retrieve, update, and delete comments |
| Tweets | Create, retrieve, update, and delete tweets |
| Playlists | Manage playlists and their associated videos |
| Subscriptions | Manage channel subscriptions and retrieve subscriber information |
| Likes | Manage likes on supported resources and retrieve liked videos |

Refer to the route files for the exact endpoint paths, HTTP methods, request formats, and authentication requirements.

## Testing

API endpoints can be tested using Postman.

For protected endpoints:

1. Authenticate using the application's supported authentication flow.
2. Provide the required token or cookie as expected by the authentication middleware.
3. Send the appropriate request body, query parameters, and uploaded files.
4. Verify the response status, returned data, and error handling.

## Project Status

This is a personal portfolio and learning project focused on backend development with the MERN stack. It demonstrates work with REST APIs, authentication, database operations, media uploads, and related backend concepts.

The implementation should be reviewed and tested for validation, authorization, security, and error-handling requirements before production use.

## Author

**Abdul Basit**

- GitHub: [basit234](https://github.com/basit234)
- Project Repository: [chai-backend-project](https://github.com/basit234/chai-backend-project)
