// Run this script to launch the server.
// The server should run on localhost port 8000.
// This is where you should start writing server-side code for this application.
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

// Models
const UserModel = require('./models/users');
const CommunityModel = require('./models/communities');
const PostModel = require('./models/posts');
const CommentModel = require('./models/comments');
const LinkFlairModel = require('./models/linkflairs');

const app = express();
const PORT = 8000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/phreddit', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => console.log('Connected to MongoDB'));

// Routes
// Initial Route
app.get('/', (req, res) => {
  res.send('Hello Phreddit!');
});

app.post('/auth/register', async (req, res) => {
    const { firstName, lastName, email, displayName, password } = req.body;
  
    try {
      const existingUser = await UserModel.findOne({ $or: [{ email }, { displayName }] });
      if (existingUser) {
        return res.status(400).json({ message: 'Email or display name already in use.' });
      }
  
      // Check if the password contains first name, last name, display name, or email
      const passwordLowerCase = password.toLowerCase();
      if (
        passwordLowerCase.includes(firstName.toLowerCase()) ||
        passwordLowerCase.includes(lastName.toLowerCase()) ||
        passwordLowerCase.includes(displayName.toLowerCase()) ||
        passwordLowerCase.includes(email.toLowerCase())
      ) {
        return res.status(400).json({
          message: 'Password must not contain your first name, last name, display name, or email.',
        });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new UserModel({
        firstName,
        lastName,
        email,
        displayName,
        password: hashedPassword,
      });
  
      await newUser.save();
      res.status(201).json({ message: 'User registered successfully.' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error registering user.' });
    }
  });
  
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    res.status(200).json({ message: 'Login successful.', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error logging in.' });
  }
});

// Fetch all users
app.get('/users', async (req, res) => {
    try {
      const users = await UserModel.find({}, '-password'); // Exclude password field
      res.status(200).json(users);
    } catch (err) {
      console.error('Error fetching users:', err);
      res.status(500).json({ message: 'Error fetching users.' });
    }
  });
  

// Get posts for a specific community using the postIDs array
app.get('/communities/:communityID/posts', async (req, res) => {
    console.log("Fetching posts for community with ID:", req.params.communityID);
    try {
        const community = await CommunityModel.findById( req.params.communityID );
        if (!community) {
            return res.status(404).json({ error: "Community not found" });
        }

        // Fetch posts based on postIDs array in the community
        const posts = await PostModel.find({ _id: { $in: community.postIDs } });
        res.json(posts);
    } catch (err) {
        console.error('Error fetching posts for community:', err);
        res.status(500).send("Error fetching posts for community");
    }
});

// Get a specific community by communityID
app.get('/communities/:communityID', async (req, res) => {
    console.log("Received request for community with ID:", req.params.communityID);
    try {
        const community = await CommunityModel.findById( req.params.communityID );
        if (!community) {
            return res.status(404).json({ error: "Community not found" });
        }
        res.json(community);
    } catch (err) {
        console.error('Error fetching community:', err);
        res.status(500).send("Error fetching community");
    }
});


// Get all communities
app.get('/communities', async (req, res) => {
    try {
        const communities = await CommunityModel.find();
        res.json(communities);
    } catch (err) {
        res.status(500).send("Error fetching communities");
    }
});

// Create a new community
app.post('/communities', async (req, res) => {
    const { name, description, members } = req.body;

    // Validate request body
    if (!name || name.length > 100) {
        return res.status(400).json({ error: 'Community name is required and should be less than 100 characters.' });
    }
   
    if (!Array.isArray(members) || members.length === 0) {
        return res.status(400).json({ error: 'Members must be a non-empty array.' });
    }

    try {
        // Check if a community with the same name already exists
        const existingCommunity = await CommunityModel.findOne({ name });
        if (existingCommunity) {
            return res.status(409).json({ error: 'Community with this name already exists.' });
        }

        // Create a new community instance
        const newCommunity = new CommunityModel({
            name,
            description,
            members,
            memberCount: members.length,
            postIDs: [],
            startDate: new Date(),
        });

        // Save to MongoDB
        await newCommunity.save();

        // Return the created community
        res.status(201).json(newCommunity);
    } catch (err) {
        console.error('Error creating community:', err);
        res.status(500).json({ error: 'Failed to create community' });
    }
});




// Create a new post
app.post('/posts', async (req, res) => {
    const { title, content, communityID, linkFlairID, postedBy, postedDate, views, commentIDs } = req.body;
    try {
        const newPost = new PostModel({ title, content, communityID, linkFlairID: linkFlairID || null, postedBy, postedDate, views, commentIDs });
        await newPost.save();
  
        // Update the community with the new postID
        await CommunityModel.updateOne(
          { _id: communityID },
          { $push: { postIDs: newPost._id } }
        );
  
        res.status(201).json(newPost);
    } catch (err) {
        console.error('Error creating post:', err);
        res.status(500).json({ error: 'Failed to create post' });
    }
  });
  

// Get a specific post by ID
app.get('/posts/:postID', async (req, res) => {
    console.log("Received request for post with ID:", req.params.postID); // Debugging log
    console.log("Route is being hit"); // Additional log
    try {
        const post = await PostModel.findById(req.params.postID);
        console.log("Post found:", post); // Debugging log
        if (!post) {
            return res.status(404).send("Post not found");
        }
        res.json(post);
    } catch (err) {
        console.error('Error fetching post:', err);
        res.status(500).send("Error fetching post");
    }
});



// Get all posts
app.get('/posts', async (req, res) => {
    try {
        const posts = await PostModel.find();
        console.log(posts);
        res.json(posts);
    } catch (err) {
        res.status(500).send("Error fetching posts");
    }
});

// Get comments for a specific post and all its replies recursively
app.get('/comments/:postID', async (req, res) => {
    const postID = req.params.postID; // Corrected line
    console.log("Received request for post with ID:", postID); // Debugging log
    console.log("get comments for post route is being hit"); // Additional log

    try {
        // Fetch the post by ID
        const post = await PostModel.findById(postID);
        console.log("Post found:", post); // Debugging log
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        // Fetch all comments related to the post
        const comments = await fetchCommentsRecursive(post.commentIDs);

        // Return all comments including nested replies
        console.log("Fetched comments:", comments); // Debugging log
        res.json(comments);
    } catch (err) {
        console.error('Error fetching comments:', err);
        res.status(500).send("Error fetching comments");
    }
});

const filterUniquePosts = (posts) => {
    const seen = {};
    const uniquePosts = [];

    posts.forEach(post => {
        const idString = post._id.toString(); // Convert ObjectId to string
        if (!seen[idString]) {
            seen[idString] = true;
            uniquePosts.push(post);
        }
    });

    return uniquePosts;
};

// Helper function to fetch comments and their replies recursively
const fetchCommentsRecursive = async (commentIDs) => {
    let allComments = [];

    // Fetch all comments with the given IDs
    const comments = await CommentModel.find({ _id: { $in: commentIDs } });

    // Add fetched comments to the result array
    allComments = [...comments];

    // Recursively fetch replies for each comment
    for (const comment of comments) {
        if (comment.commentIDs && comment.commentIDs.length > 0) {
            const replies = await fetchCommentsRecursive(comment.commentIDs);
            allComments = [...allComments, ...replies];
        }
    }

    return allComments;
};

  
// Search posts by title, content, or comments
app.get('/search', async (req, res) => {
    const { query } = req.query;
    console.log("Received search query:", req.query);


    if (!query) {
        return res.status(400).json({ error: 'Search query is required' });
    }

    const searchTerms = query.split(' ');


    try {
        // Search posts that match the query in the title or content
        const posts = await PostModel.find({
            $or: [
                { title: { $regex: searchTerms.join('|'), $options: 'i' } },
                { content: { $regex: searchTerms.join('|'), $options: 'i' } }
            ]
        });

          // Step 2: Search comments for the query term
          const comments = await CommentModel.find({ content: { $regex: query, $options: 'i' } });
          console.log('comments,', comments);
          // Flatten the commentIDs array
            const commentPostIDs = comments.map(comment => comment._id);
           console.log('Flattened comment IDs to be matched to post commentIDs:', commentPostIDs);



      

 // Helper function to find the originating post recursively
 const findOriginPost = async (commentID) => {
    const parentComment = await CommentModel.findOne({ commentIDs: commentID });
    if (parentComment) {
        return await findOriginPost(parentComment._id);
    }
    const originPost = await PostModel.findOne({ commentIDs: commentID });
    return originPost || null;
};

// Map comments to their originating posts
const postsFromComments = [];
for (const comment of comments) {
    const originPost = await findOriginPost(comment._id);
    if (originPost) {
        postsFromComments.push(originPost);
    }
}

// Log matched posts from comments
postsFromComments.forEach(post => {
    console.log(`Matched Post ID: ${post._id}`);
    console.log(`commentIDs in matched post:`, post.commentIDs);
});

        
                    const linkFlairs = await LinkFlairModel.find({ content: { $regex: query, $options: 'i' } });

                    const postsFromFlairs = await PostModel.find({ linkFlairID: { $in: linkFlairs.map(f => f._id) } });
                    console.log('posts matched to linkflairs:', postsFromFlairs);

                    // Combine results and remove duplicates
                    const allPosts = [...posts, ...postsFromComments, ...postsFromFlairs];
                    
                
                    
                    // Apply the function to filter unique posts
                    const uniquePosts = filterUniquePosts(allPosts);
                    console.log("Unique posts:", uniquePosts);
                    res.json(uniquePosts);

                
    } catch (err) {
        console.error('Error searching posts:', err);
        res.status(500).json({ error: 'Failed to search posts' });
    }
});



// Get all comments
app.get('/comments', async (req, res) => {
    try {
        const comments = await CommentModel.find();
        res.json(comments);
    } catch (err) {
        res.status(500).send("Error fetching comments");
    }
});



// Create a new comment
app.post('/comments', async (req, res) => {
  const { content, commentedBy, commentedDate, commentIDs, postID, parentCommentID } = req.body;

    // Validate content length
if ( content.length > 500) {
  return res.status(400).json({ error: 'Comment content must not exceed 500 characters.' });
}


  try {
    const newComment = new CommentModel({
      content,
      commentedBy,
      commentedDate,
      commentIDs,
      postID,
      parentCommentID,
    });
    await newComment.save();
    res.status(201).json(newComment);
  } catch (err) {
    console.error('Error creating comment:', err);
    res.status(500).json({ error: 'Failed to create comment.' });
  }
});

// add comment to post
app.patch('/posts/:postID', async (req, res) => {
  const { newCommentID } = req.body;
  try {
    await PostModel.findByIdAndUpdate(req.params.postID, {
      $push: { commentIDs: newCommentID }
    });
    res.status(200).send('Post updated');
  } catch (err) {
    console.error('Error updating post:', err);
    res.status(500).send('Error updating post');
  }
});

// Increment view count for a specific post
app.patch('/posts/:postID/views', async (req, res) => {
  const { postID } = req.params;

  try {
    const post = await PostModel.findByIdAndUpdate(
      postID,
      { $inc: { views: 1 } }, // Increment the views field
      { new: true } // Return the updated document
    );
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.status(200).json(post);
  } catch (err) {
    console.error('Error incrementing post views:', err);
    res.status(500).json({ error: 'Failed to increment views' });
  }
});






// add comment to comment
app.patch('/comments/:commentID', async (req, res) => {
  const { newCommentID } = req.body;
  try {
    await CommentModel.findByIdAndUpdate(req.params.commentID, {
      $push: { commentIDs: newCommentID }
    });
    res.status(200).send('Comment updated');
  } catch (err) {
    console.error('Error updating comment:', err);
    res.status(500).send('Error updating comment');
  }
});


// Get all link flairs
app.get('/linkflairs', async (req, res) => {
    try {
        const linkFlairs = await LinkFlairModel.find();
        res.json(linkFlairs);
        console.log(linkFlairs);
    } catch (err) {
        res.status(500).send("Error fetching link flairs");
    }
});

// Create a new link flair
app.post('/linkflairs', async (req, res) => {
    const { content } = req.body;
    if (!content || content.length > 30) {
        return res.status(400).json({ error: 'Invalid flair content' });
    }
    try {
        const newFlair = new LinkFlairModel({ content });
        await newFlair.save();
        res.status(201).json(newFlair);
    } catch (err) {
        console.error('Error creating link flair:', err);
        res.status(500).json({ error: 'Failed to create flair' });
    }
});



// Start the server
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`);
});
