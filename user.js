"use strict";

// Global variable to hold the User instance of the currently-logged-in user
let currentUser;

/******************************************************************************
 * User login/signup/login
 */

/** Handle login form submission. If login is successful, sets up the user instance */
async function login(evt) {
  console.debug("login", evt);
  evt.preventDefault();

  // Grab the username and password from the form fields
  const username = $("#login-username").val();
  const password = $("#login-password").val();

  // User.login retrieves user info from API and returns User instance
  // which we'll make the globally-available, logged-in user.
  currentUser = await User.login(username, password);

  // Reset the login form
  $loginForm.trigger("reset");

  // Save user credentials in localStorage and update UI
  saveUserCredentialsInLocalStorage();
  updateUIOnUserLogin();
}

// Event listener for login form submission
$loginForm.on("submit", login);

/** Handle signup form submission. */
async function signup(evt) {
  console.debug("signup", evt);
  evt.preventDefault();

  // Grab the user's name, username, and password from the form fields
  const name = $("#signup-name").val();
  const username = $("#signup-username").val();
  const password = $("#signup-password").val();

  // User.signup retrieves user info from API and returns User instance
  // which we'll make the globally-available, logged-in user.
  currentUser = await User.signup(username, password, name);

  // Save user credentials in localStorage and update UI
  saveUserCredentialsInLocalStorage();
  updateUIOnUserLogin();

  // Reset the signup form
  $signupForm.trigger("reset");
}

// Event listener for signup form submission
$signupForm.on("submit", signup);

/** Handle click of logout button */
function logout(evt) {
  console.debug("logout", evt);
  // Clear user credentials from localStorage and reload the page
  localStorage.clear();
  location.reload();
}

// Event listener for logout button click
$navLogOut.on("click", logout);

/******************************************************************************
 * Storing/recalling previously-logged-in-user with localStorage
 */

/** If there are user credentials in local storage, use those to log in
 * that user. This is meant to be called on page load, just once.
 */
async function checkForRememberedUser() {
  console.debug("checkForRememberedUser");
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  if (!token || !username) return false;

  // Try to log in with these credentials (will be null if login failed)
  currentUser = await User.loginViaStoredCredentials(token, username);
}

/** Sync current user information to localStorage.
 *
 * We store the username/token in localStorage so when the page is refreshed
 * (or the user revisits the site later), they will still be logged in.
 */
function saveUserCredentialsInLocalStorage() {
  console.debug("saveUserCredentialsInLocalStorage");
  if (currentUser) {
    localStorage.setItem("token", currentUser.loginToken);
    localStorage.setItem("username", currentUser.username);
  }
}

/******************************************************************************
 * General UI stuff about users
 */

/** When a user signs up or logs in, update the UI:
 *
 * - Show the main list of stories
 * - Update the nav bar links
 * - Show the user profile link and set its text content to the username
 */
async function updateUIOnUserLogin() {
  console.debug("updateUIOnUserLogin");

  // Show the main list of stories
  $allStoriesList.show();

  // Update the nav bar links
  updateNavOnLogin();

  // Show the user profile link and set its text content to the username
  $navUserProfile.text(currentUser.username).show();

  // Generate and display the user profile information
  generateUserProfile();
}

/** Generate and display the user profile information */
function generateUserProfile() {
  console.debug("generateUserProfile");

  // Check if currentUser is defined and contains user information
  if (currentUser) {
    // Populate the profile name, username, and account creation date
    $("#profile-name").text(currentUser.name);
    $("#profile-username").text(currentUser.username);
    $("#profile-account-date").text(currentUser.createdAt.slice(0, 10));
  }
}



