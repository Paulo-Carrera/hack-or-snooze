"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story, showDeleteBtn = false) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();

  // if a user is logged in, show favorite/not-favorite star
  const showStar = Boolean(currentUser);

  return $(`
      <li id="${story.storyId}">
        <div>
        ${showDeleteBtn ? getDeleteBtnHTML() : ""}
        ${showStar ? getStarHTML(story, currentUser) : ""}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <div class="story-author">by ${story.author}</div>
        <div class="story-user">posted by ${story.username}</div>
        </div>
      </li>
    `);
}

//  get delete button html for story
function getDeleteBtnHTML(){
  return `
  <span class="trash-can">
  <i class="fas fa-trash-alt"></i>
  </span>`;
}

// make favorite star for story

function getStarHTML(story, user){
  const isFavorite = user.isFavorite(story);
  const starType = isFavorite ? "fas" : "far";
  return `
  <span class="star">
  <i class="${starType} fa-star"></li>
  </span>`;
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

//handle deleting a story
async function deleteStory(evt){
  console.debug("deleteStory");

  const $closestLi = $(evt.target).closest("li");
  const storyId = $closestLi.attr("id");

  await putUserStoriesOnPage();
}

$ownStories.on('click' , ".trash-can", deleteStory);

//handle submitting new story form
async function submitNewStory(event){
  console.debug("submitNewStory");
  event.preventDefault();

  //retrieve all info from form
  const title = $("#create-title").val();
  const url = $("#create-url").val(); 
  const author = $("#create-author").val();
  const username = currentUser.username
  const storyData = {title, url, author, username};

  const story = await storyList.addStory(currentUser, storyData);

  const $story = generateStoryMarkup(story);
  $allStoriesList.prepend($story);

  //hide and reset form
  $submitForm.slideUp("slow");
  $submitForm.trigger("reset");
}


$submitForm.on("submit" , submitNewStory);

// list of users own stories
function putUserStoriesOnPage(){
  console.debug("putUserStoriesOnPage");

  $ownStories.empty();

  if(currentUser.ownStories.length === 0){
    $ownStories.append("<h5>No stories added by user yet!</h5>");
  }else{
    // loop through users stories and generate html for each
    for(let story of currentUser.ownStories){
      let $story = generateStoryMarkup(story, true);
      $ownStories.append($story);
    }
  }
  $ownStories.show();
}

// Put favorites list on page
function putFavoritesListOnPage(){
  console.debug("putFavoritesListOnPage");

  $favoritedStories.empty();

  if(currentUser.favorites.length === 0){
    $favoritedStories.append("<h5>No favorites added!</h5>");
  }else{
    //loop through all users favorites and generate html
    for(let story of currentUser.favorites){
      const $story = generateStoryMarkup(story);
      $favoritedStories.append($story);
    }
  }
  $favoritedStories.show();
}

//handle favorited / un-favorited stories
async function toggleStoryFavorite(event){
  console.debug("toggleStoryFavorite");

  const $tgt = $(event.target);
  const $closestLi = $tgt.closest("li");
  const storyId = $closestLi.attr("id");
  const story = storyList.stories.find(s=>s.storyId===storyId);

  //check if item is already favorited 
  if($tgt.hasClass("fas")){
    // if its already favorited , remove from favorites list
    await currentUser.removeFavorite(story);
    $tgt.closest("i").toggleClass("fas far");
  }else{
    //if its not a favorite , add to favorites
    await currentUser.addFavorite(story);
    $tgt.closest("i").toggleClass("fas far");
  }
}
$allStoriesList.on("click", ".star" , toggleStoryFavorite);

