/* server/init.JSON
** You must write a script that will create documents in your database according
** to the datamodel you have defined for the application.  Remember that you 
** must at least initialize an admin user account whose credentials are derived
** from command-line arguments passed to this script. But, you should also add
** some communities, posts, comments, and link-flairs to fill your application
** some initial content.  You can use the initializeDB.js script as inspiration, 
** but you cannot just copy and paste it--you script has to do more to handle
** users.
*/
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const UserModel = require('./models/users');
const CommunityModel = require('./models/communities');
const PostModel = require('./models/posts');
const CommentModel = require('./models/comments');
const LinkFlairModel = require('./models/linkflairs');

let userArgs = process.argv.slice(2);

if (userArgs.length < 4) {
    console.error('Usage: node init.js <MongoDB URL> <Admin Email> <Admin DisplayName> <Admin Password>');
    process.exit(1);
}

let [mongoDB, adminEmail, adminDisplayName, adminPassword] = userArgs;

mongoose.connect(mongoDB);
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

async function clearDatabase() {
    console.log(`Clearing database: ${mongoose.connection.name}`);
    await mongoose.connection.dropDatabase();
    console.log('Database cleared successfully.');
}

async function createAdminUser(email, displayName, password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const adminUser = new UserModel({
        email,
        displayName,
        password: hashedPassword,
        reputation: 1000,
        isAdmin: true
    });
    return adminUser.save();
}

async function createRegularUser(email, displayName, password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const regularUser = new UserModel({
        email,
        displayName,
        password: hashedPassword,
        reputation: 100,
        isAdmin: false
    });
    return regularUser.save();
}

function createLinkFlair(linkFlairObj) {
    let newLinkFlairDoc = new LinkFlairModel({
        content: linkFlairObj.content,
    });
    return newLinkFlairDoc.save();
}

function createComment(commentObj) {
    let newCommentDoc = new CommentModel({
        content: commentObj.content,
        commentedBy: commentObj.commentedBy,
        commentedDate: commentObj.commentedDate,
        commentIDs: commentObj.commentIDs,
        upvotes: commentObj.upvotes || 0,
        downvotes: commentObj.downvotes || 0,
    });
    return newCommentDoc.save();
}

function createPost(postObj) {
    let newPostDoc = new PostModel({
        title: postObj.title,
        content: postObj.content,
        postedBy: postObj.postedBy,
        postedDate: postObj.postedDate,
        views: postObj.views || 0,
        linkFlairID: postObj.linkFlairID,
        commentIDs: postObj.commentIDs,
        upvotes: postObj.upvotes || 0,
        downvotes: postObj.downvotes || 0,
    });
    return newPostDoc.save();
}

function createCommunity(communityObj) {
    let newCommunityDoc = new CommunityModel({
        name: communityObj.name,
        description: communityObj.description,
        postIDs: communityObj.postIDs,
        startDate: communityObj.startDate,
        members: communityObj.members,
        memberCount: communityObj.memberCount || 0,
    });
    return newCommunityDoc.save();
}

async function initializeDB() {
    try {
        await clearDatabase();

        console.log('Creating Admin User...');
        await createAdminUser(adminEmail, adminDisplayName, adminPassword);
        console.log('Admin User created successfully.');

        console.log('Creating Regular Users...');
        const bigfeetUser = await createRegularUser('bigfeet@gmail.com', 'bigfeet', 'password123');
        const astyanaxUser = await createRegularUser('astyanax@gmail.com', 'astyanax', 'password123');
        const outtheretruthUser = await createRegularUser('truth47@gmail.com', 'outtheretruth47', 'password123');
        const shempUser = await createRegularUser('shemp@gmail.com', 'shemp', 'password123');
        const rolloUser = await createRegularUser('rollo@gmail.com', 'rollo', 'password123');

        console.log('Creating Link Flairs...');
        const linkFlair1 = { content: 'The jerkstore called...' };
        const linkFlair2 = { content: 'Literal Saint' };
        const linkFlair3 = { content: 'They walk among us' };
        const linkFlair4 = { content: 'Worse than Hitler' };
        let linkFlairRef1 = await createLinkFlair(linkFlair1);
        let linkFlairRef2 = await createLinkFlair(linkFlair2);
        let linkFlairRef3 = await createLinkFlair(linkFlair3);
        let linkFlairRef4 = await createLinkFlair(linkFlair4);

        console.log('Creating Comments...');
        const comment7 = { content: 'Generic poster slogan #42', commentIDs: [], commentedBy: bigfeetUser._id, commentedDate: new Date('September 10, 2024 09:43:00') };
        const comment6 = { content: 'I want to believe.', commentIDs: [], commentedBy: outtheretruthUser._id, commentedDate: new Date('September 10, 2024 07:18:00') };
        const comment5 = { content: 'The same thing happened to me...', commentIDs: [], commentedBy: bigfeetUser._id, commentedDate: new Date('September 09, 2024 17:03:00') };
        const comment4 = { content: 'The truth is out there.', commentIDs: [], commentedBy: astyanaxUser._id, commentedDate: new Date('September 10, 2024 06:41:00') };
        const comment3 = { content: 'My brother in Christ...', commentIDs: [], commentedBy: rolloUser._id, commentedDate: new Date('August 23, 2024 09:31:00') };
        const comment2 = { content: 'Obvious rage bait...', commentIDs: [], commentedBy: astyanaxUser._id, commentedDate: new Date('August 23, 2024 10:57:00') };
        const comment1 = { content: 'There is no higher calling...', commentIDs: [], commentedBy: shempUser._id, commentedDate: new Date('August 23, 2024 08:22:00') };
        let commentRef7 = await createComment(comment7);
        let commentRef6 = await createComment(comment6);
        let commentRef5 = await createComment(comment5);
        let commentRef4 = await createComment(comment4);
        let commentRef3 = await createComment(comment3);
        let commentRef2 = await createComment(comment2);
        let commentRef1 = await createComment(comment1);

        console.log('Creating Posts...');
        const post1 = { title: 'AITJ: I parked my cybertruck...', content: 'Recently I went to the store...', postedBy: bigfeetUser._id, postedDate: new Date('August 23, 2024 01:19:00'), views: 14, linkFlairID: linkFlairRef1._id, commentIDs: [commentRef1._id, commentRef2._id] };
        const post2 = { title: 'Remember when this was a HISTORY channel?', content: 'Does anyone else remember when...', postedBy: astyanaxUser._id, postedDate: new Date('September 9, 2024 14:24:00'), views: 1023, linkFlairID: linkFlairRef3._id, commentIDs: [commentRef4._id, commentRef5._id], upvotes: 10 };
        let postRef1 = await createPost(post1);
        let postRef2 = await createPost(post2);

        console.log('Creating Communities...');
        const community1 = { name: 'Am I the Jerk?', description: 'A practical application of...', postIDs: [postRef1._id], startDate: new Date('August 10, 2014 04:18:00'), members: [rolloUser._id, shempUser._id, astyanaxUser._id, bigfeetUser._id], memberCount: 4 };
        const community2 = { name: 'The History Channel', description: 'A fantastical reimagining...', postIDs: [postRef2._id], startDate: new Date('May 4, 2017 08:32:00'), members: [astyanaxUser._id, outtheretruthUser._id, bigfeetUser._id], memberCount: 3 };
        await createCommunity(community1);
        await createCommunity(community2);

        console.log('Database initialized successfully.');
    } catch (err) {
        console.error('Error initializing database:', err);
    } finally {
        db.close();
    }
}


initializeDB()
    .catch((err) => {
        console.log('ERROR: ' + err);
        console.trace();
        if (db) {
            db.close();
        }
    });

console.log('processing...');
