// BUTTONS
const SIGN_IN = document.querySelector(".sign-in");
const SIGN_UP = document.querySelector(".sign-up");
const NEW_MEETING = document.getElementById("new-meeting");
const LINK = document.getElementById("link");

//FORMdocument.getElementById("new-meeting");
const FORM = document.getElementById("link-form");

FORM.addEventListener("submit", function (e) {
  e.preventDefault();
  location.href = "/sign-in";
});

SIGN_IN.addEventListener("click", function () {
  location.href = "/sign-in";
});

SIGN_UP.addEventListener("click", function () {
  location.href = "/sign-up";
});

NEW_MEETING.addEventListener("click", function () {
  location.href = "/sign-in";
  console.log("new meeting pressed");
});
