[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/MVUO33FO)
# Term Project

Add design docs in *images/*

## Instructions to setup and run project
Clearly explain the steps required to install and configure necessary packages,
for both the server and the client, and the sequence of steps required to get
your application running.


In the sections below, list and describe each contribution briefly.

## Team Member 1 Contribution

## Team Member 2 Contribution

Making the UML for components , I used PlantUML website
This is the code that was provided to plantUML
@startuml
class App {
  + currentUser: User (State)
  + isAuthenticated: Boolean (State)
  + view: String (State)
  + communities: Array<Community> (State)
  + posts: Array<Post> (State)
  + comments: Array<Comment> (State)
  + commentToEdit: Comment (Optional State)
  + linkFlairs: Array<LinkFlair> (State)
  + users: Array<User> (State)
  + currentCommunity: String (Optional State) - community ID
  + communityToEdit: Community (Optional State)
  + selectedPostID: String (Optional State) - post ID
  + postToEdit: Post (Optional State)
  + searchedPosts: Array<Post> (Optional State)
  + searchQuery: String (State)
  + parentCommentID: String (Optional State)
  + adminOriginalUser: User (Optional State)
  + fetchData: Function
  + logout: Function
  + registerUser: Function
  + loginUser: Function
  + showReplyPage: Function
  + formatTimestamp: Function
  + showView: Function (name: String) - dynamic view display
  + showCommunity: Function (communityID: String)
  + showPost: Function (postID: String)
  + handlePostClick: Function (postID: String)
  + handleCommunityChange: Function (communityID: String, action: String)
  + [other component specific functions...]
}
class WelcomePage {
    - setView: Function
}
class CommunitySection {
    + community: Community
    + posts: List<Post>
    + comments: List<Comment>
    + linkFlairs: List<LinkFlair>
    + creatorName: String
    + sortOption: String
    + currentUser: User?
    + users: List<User>
    + fetchCommunityData()
    + fetchLinkFlairs()
    + fetchCommentsForPosts(posts: List<Post>)
    + handleJoinCommunity()
    + handleLeaveCommunity()
    + getSortedPosts(): List<Post>
    + getMostRecentCommentDate(post: Post): Date
    + countCommentsAndReplies(commentIDs: List<String>): Integer
}
class CreateCommunity {
    + name: String
    + description: String
    + errors: Object
    + successMessage: String
    + isLoading: Boolean
    + currentCommunity: Community?
    + handleCreateOrUpdateCommunity()
    + validateInputs()
    + handleCancel()
}
class CreatePost {
    + title: String
    + content: String
    + community: String
    + flair: String
    + newFlair: String
    + isLoading: Boolean
    + error: String
    + currentPost: Post?
    + handleCreateOrUpdatePost()
    + handleCancel()
}
class Header {
    + showView: Function
    + currentView: String
    + setSearchQuery: Function
    + currentUser: User
    + logout: Function
    + localQuery: String
    + handleSearch(event: KeyboardEvent)
    + searchPosts(query: String)
}
class Home {
    + posts: Post[] (State)
    + communities: Community[] (State)
    + comments: Comment[] (State) - assumed
    + linkFlairs: LinkFlair[] (State)
    + users: User[] (State)
    + sortedPosts: Post[] (State)
    + fetchAllData()
    + formatTimestamp(timestamp: String)
    + sortPostsByNewest()
    + sortPostsByOldest()
    + sortPostsByMostActive()
    + handleUpvote(postId: String)
    + handleDownvote(postId: String)
    + getMostRecentCommentDate(post: Post)
    + countCommentsAndReplies(commentIDs: String[])
}
class LoginPage {
    + formData: { email: String, password: String } (State)
    + error: String (State)
    + handleChange(e: Event)
    + handleSubmit(e: Event)
}
class Navbar {
    + communities: Community[] (Props)
    + showCommunity: Function (Props)
    + showview: Function (Props)
    + activeView: String (Props)
    + currentCommunity: Community (Props)
    + currentUser: User (Props)
}
class NewReplyPage {
    + postID: String (Props)
    + parentCommentID: String (Optional Prop)
    + fetchData: Function (Props)
    + showPostSection: Function (Props)
    + currentUser: User (Props)
    + currentComment: Comment (Optional Prop)
    + content: String (State)
    + isLoading: Boolean (State)
    + error: String (State)
    + handleReplySubmit()
}
class PostSection {
    + postID: String (Prop)
    + showPostSection: Function (Prop)
    + communities: Community[] (Prop)
    + showReplyPage: Function (Prop)
    + currentUser: User (Prop)
    + post: Post (State)
    + comments: Comment[] (State)
    + linkFlair: String (State)
    + communityName: String (State)
    + fetchPostData()
    + handleUpvote(postId: String)
    + handleDownvote(postId: String)
    + handleCommentUpvote(commentID: String)
    + handleCommentDownvote(commentID: String)
    + renderComments(commentIDs: String[])
    + formatTimestamp(postedDate: Date): String
}
class RegisterPage {
    - formData: Object
    - error: String
    + handleChange(e: Event)
    + handleSubmit(e: Event)
}
class SearchView {
    + matchingPosts: Array<Post> (Props) - received from parent component
    + showPost: Function (Props) - function to handle post click, received from parent
    + localQuery: String (Props) - search query received from parent
    + linkFlairs: Array<LinkFlair> (Props) - array of link flair objects
    + communities: Array<Community> (Props) - array of community objects
    + formatTimestamp: Function (Props) - function to format timestamp, received from parent
    + handlePostClick: Function (Props) - function to handle user clicking a post (potentially from parent)
    + currentUser: User (Props) - logged-in user information
    + sortedPosts: Array<Post> (State) - holds the currently sorted list of posts
    + sortPostsByNewest()
    + sortPostsByOldest()
    + sortPostsByMostActive()
    + getMostRecentCommentDate(post: Post): Date
    + handleUpvote(postId: String)
    + handleDownvote(postId: String)
}
class UserProfile {
    + currentUser: User (Props) - logged-in user information
    + users: Array<User> (Props) - array of all users
    + setCurrentUser: Function (Props) - function to update current user
    + showView: Function (Props) - function to change views
    + communities: Array<Community> (Props) - array of all communities
    + posts: Array<Post> (Props) - array of all posts
    + setCurrentCommunity: Function (Props) - to update current community
    + updateCommunityList: Function (Props) - to update community list
    + setCurrentPost: Function (Props) - to update current post
    + updatePostList: Function (Props) - to update post list
    + adminOriginalUser: User (State) - holds the original user profile when viewing another user as admin
    + setAdminOriginalUser: Function (State) - to set the original user profile
    + tempUser: User (State) - temporary user for editing/viewing (potentially)
    + setTempUser: Function (State) - to set the temporary user
    + listType: String (State) - current list type (posts, communities, comments, users)
    + data: Array (State) - holds the data for the current list type
    + loading: Boolean (State) - loading state for data fetching
    + setLoading: Function (State) - to set loading state
    + error: String (State) - stores any error message
    + setError: Function (State) - to set error message
    + errors: Object (State) - potential validation errors (not used in this snippet)
    + setErrors: Function (State) - to set validation errors
    + handleEditCommunity(communityID: String)
    + handleEditPost(postID: String)
    + deleteCommunity(communityID: String)
    + deletePost(postID: String)
    + deleteComment(commentID: String)
    + editComment(commentID: String)
    + handleAdminViewUser(userID: String)
    + handleBackToAdmin()
    + deleteUser(userID: String)
    + renderList()
}


App --> WelcomePage
App --> RegisterPage
App --> LoginPage
App --> Header
App --> Navbar
App --> Home
App --> SearchView
App --> CreatePost
App --> CreateCommunity
App --> CommunitySection
App --> PostSection
App --> NewReplyPage
App --> UserProfile

App --> Home : posts, comments, users, ...
App --> SearchView : searchedPosts, searchQuery
App --> UserProfile : currentUser, users, communities, posts, comments

Home --> CommunitySection
Home --> PostSection

NewReplyPage --> PostSection
WelcomePage --|> LoginPage

WelcomePage --|> RegisterPage
WelcomePage --|> Home
LoginPage --> Home
RegisterPage --> Home



Header --> App : showView, setSearchQuery, currentUser, logout
PostSection --> NewReplyPage
Navbar --> Home
Navbar --> CommunitySection
Navbar --> CreateCommunity

Header --> CreatePost
Header --> SearchView
Header --> UserProfile

UserProfile --> CreatePost
UserProfile --> CreateCommunity
UserProfile --> NewReplyPage
UserProfile --> App : updateCurrentUser, updateCommunityList, updatePostList
@enduml 


The following code was provided for Server UML
@startuml
class ExpressServer
class IncomingRequest
class OutgoingResponse

class CommunityModel {
  + id (primary key)
  + name
  + description
  + postIDs (array of Post)  // One-to-Many relationship with Post
  + startDate
  + createdBy (User)  // One-to-One relationship with User
  + members (array of User)  // Many-to-Many relationship with User
  + moderators (array of User) (optional)  // Many-to-Many relationship with User (optional)
  + memberCount
  + tags (array of String) (optional)
  + coverImage (String) (optional)
}

class PostModel {
  + id (primary key)
  + title
  + content
  + communityID (foreign key to Community)  // Many-to-One relationship with Community
  + linkFlairID (foreign key to LinkFlair)  // Many-to-One relationship with LinkFlair
  + postedBy (User)  // One-to-One relationship with User
  + postedDate
  + views
  + commentIDs (array of Comment)  // One-to-Many relationship with Comment
  + upvotes
  + downvotes
  + voteCount
}

class CommentModel {
  + id (primary key)
  + content
  + commentIDs (array of Comment)  // Recursive relationship for replies (One-to-Many)
  + commentedBy (User)  // One-to-One relationship with User
  + commentedDate
  + postID (foreign key to Post)  // Many-to-One relationship with Post
  + parentCommentID (foreign key to Comment)  // Many-to-One relationship with Comment (for replies)
  + upvotes
  + downvotes
  + voteCount
}

class LinkFlairModel {
  + id (primary key)
  + content
}

class UserModel {
  + id (primary key)
  + email
  + displayName (username)
  + password
  + reputation
  + isAdmin
  + createdDate
  + communities (array of Community) (Many-to-Many relationship with Community) (implicit)
  + posts (array of Post) (Many-to-Many relationship with Post) (implicit)
  + comments (array of Comment) (Many-to-Many relationship with Comment) (implicit)
}

ExpressServer  <-- IncomingRequest
ExpressServer  --> OutgoingResponse

ExpressServer  --> CommunityModel  : CRUD operations
ExpressServer  --> PostModel  : CRUD operations
ExpressServer  --> CommentModel  : CRUD operations
ExpressServer  --> LinkFlairModel  : CRUD operations
ExpressServer  --> UserModel  : CRUD operations

@enduml

The Code used to make UML for Database
@startuml
class User {
  + id (String) [PK]
  + email (String)
  + displayName (String)
  + password (String)
  + reputation (Number)
  + isAdmin (Boolean)
}

class Community {
  + id (String) [PK]
  + name (String)
  + description (String)
  + postIDs (Array<String>)
  + startDate (Date)
  + createdBy (String) [FK -> User.id]
  + members (Array<String>) [FK -> User.id]
  + memberCount (Number)
}

class Post {
  + id (String) [PK]
  + title (String)
  + content (String)
  + postedBy (String) [FK -> User.id]
  + postedDate (Date)
  + views (Number)
  + linkFlairID (String) [FK -> LinkFlair.id (optional)]
  + commentIDs (Array<String>)
  + upvotes (Number)
  + downvotes (Number)
}

class Comment {
  + id (String) [PK]
  + content (String)
  + commentedBy (String) [FK -> User.id]
  + commentedDate (Date)
  + commentIDs (Array<String>) (recursive relationship)
  + upvotes (Number)
  + downvotes (Number)
}

class LinkFlair {
  + id (String) [PK]
  + content (String)
}

User "1..*" -- "0..*" Community
User "1" -- "0..*" Post
User "1" -- "0..*" Comment
Community "1" -- "0..*" Post
Post "1" -- "0..*" Comment
Comment "1" -- "0..*" Comment 
Post "0..*" -- "0..1" LinkFlair
@enduml