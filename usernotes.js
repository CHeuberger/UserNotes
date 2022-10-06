// ==UserScript==
// @name         UserNotes
// @namespace    heuberger.github.io/...
// @version      0.3
// @description  Add notes and rank to StackOverflow users
// @author       Carlos Heuberger
// @downloadURL  https://github.com/...
// @include      /^https?:\/\/(.*\.)?stackoverflow\.com\/users\//
// @include      /^https?:\/\/(.*\.)?stackexchange\.com\/users\//
// @grant        GM.addStyle
// @grant        GM.getValue
// @grant        GM.setValue
// @grant        GM.deleteValue
// @grant        GM.notification
// ==/UserScript==


const rankPrefix = "un_rank_";
const notePrefix = "un_note_";
const dataPrefix = "un_data_";


document.body.style.background = "#ffaaaa";  // I am here! //XXX
//GM.notification("X ", "UserNotes");  //XXX

//GM.setValue(rankPrefix+"16320675", 99);  //XXX
//GM.setValue(rankPrefix+"2164365", -2);  //XXX
//GM.setValue(notePrefix+"2164365", "feel free to write answer - https://stackoverflow.com/a/73943797/16320675");  //XXX

GM.setValue(dataPrefix + "16320675", JSON.stringify({"id":"16320675","name":"<self>","rank":99,"note":"myself"}));  //XXX
//GM.setValue(dataPrefix + "2164365",  JSON.stringify({"id":"2164365","name":"Abra","rank":"-3","note":"feel free to write answer - https://stackoverflow.com/a/73943797/16320675"}));  //XXX


// user page
var statusNode;
var rankNode;
var noteNode;


const urlTokens = window.location.href.split("/");

// https://stackoverflow.com/users/16320675/user16320675
if (urlTokens.length >= 6 && urlTokens[3] === "users") {
  
  let userId = urlTokens[4];
  //GM.notification("X user id: " + userId, "UserNotes");  //XXX
  document.body.style.background = "#ffffaa";  //XXX

  augmentUserPage(userId);
  document.body.style.background = "#ccffcc";  //XXX
  
} else {
  
  document.body.style.background = "#ff5555";  //XXX
  
}


function augmentUserPage(userId) {
  rankNode = document.createTextNode("");
  statusNode = document.createTextNode("");
  noteNode = document.createTextNode("");

  let rankPanel = document.createElement("SPAN");
  rankPanel.appendChild(createButton("un-dec-rank", "v", () => updateUser(userId, decUser)));
  rankPanel.appendChild(rankNode);
  rankPanel.appendChild(createButton("un-inc-rank", "^", () => updateUser(userId, incUser)));
  //GM.notification("X buttons", "userNotes");  //XXX
  
  let statusPanel = document.createElement("SPAN");
  let italic = document.createElement("I");
  italic.style.margin = "0 10px";
  italic.appendChild(statusNode);
  statusPanel.appendChild(italic);
  //GM.notification("X statusNode: " + statusNode, "UserNotes");  //XXX
  
  let notePanel = document.createElement("SPAN");
  notePanel.ondblclick = () => GM.notification("X note", "UserNotes");  //XXX
  notePanel.appendChild(document.createTextNode("  Note: "));
  notePanel.appendChild(noteNode);
  let del = createButton("un-delete-user", "X", null, () => deleteUser(userId));
  notePanel.appendChild(del);
  //GM.notification("X del: " + del, "UserNotes");  //XXX  

  let userBanner = document.createElement("DIV");
  userBanner.appendChild(rankPanel);
  userBanner.appendChild(statusPanel);
  userBanner.appendChild(notePanel);
  
  let content = document.getElementById("content");
  content.insertAdjacentElement("afterbegin", userBanner);
  //GM.notification("X content: " + content, "UserNotes");  //XXX

  reloadUser(userId, updateUserAugmentation);
}


function updateUserAugmentation(user) {
  //GM.notification("X repaint: " + user.id, "userNotes");  //XXX
  statusNode.textContent = user.new ? "unvoted" : "";
  rankNode.textContent = user.rank;
  noteNode.textContent = user.note;
}


function updateUser(userId, execute) {
  //GM.notification("X update: " + userId, "UserNotes");  //XXX
  reloadUser(userId, user => {
    //GM.notification("X reloaded: " + user.id, "userNotes");  //XXX
    execute(user);
    saveData(user);
    updateUserAugmentation(user);
  });
}


function decUser(user) {
  //GM.notification("X dec: " + user.id, "UserNotes");  //XXX
  user.rank -= 1;
}


function incUser(user) {
  //GM.notification("X inc: " + user.id, "UserNotes");  //XXX
  user.rank = +user.rank + 1;
}


function deleteUser(userId) {
  //TODO confirm
  if (userID === "16320675") return;  //XXX
  deleteData(userId);
  reloadUser(userId, updateUserAugmentation);
  //GM.notification("X deleted: " + JSON.stringify(user), "UserNotes");  //XXX
}


function createButton(id, text, onclick, ondblclick) {
  let button = document.createElement("BUTTON");
  button.type = "button";
  button.id = id;
  button.textContent = text;
  button.onclick = onclick;
  button.ondblclick = ondblclick;
  return button;
}


function reloadUser(userId, execute) {
  readData(userId).then(data => {
    let user = JSON.parse(data);
    execute(user);
  });
}


function saveData(user) {
  if (user.id) {
    user.new = false;
    let data = JSON.stringify(user);
    GM.setValue(dataPrefix + user.id, data);
    //GM.notification("X save " + user.rank + " to " + dataPrefix + user.id, "userNotes");  //XXX
  }
}


function readData(userId) {
  return GM.getValue(dataPrefix + userId, '{"new":"true","id":"' + userId + '","rank":0,"note":""}');
}


function deleteData(userId) {
  if (userId) {
    GM.deleteValue(dataPrefix + userId);
  }
}

/* */

