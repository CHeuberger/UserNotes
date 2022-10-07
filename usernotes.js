// ==UserScript==
// @name         UserNotes
// @namespace    heuberger.github.io/...
// @version      0.3
// @description  Add notes and rank to StackOverflow users
// @author       Carlos Heuberger
// @downloadURL  https://github.com/...
// @include      /^https?:\/\/(.*\.)?stackoverflow\.com\/users\//
// @include      /^https?:\/\/(.*\.)?stackexchange\.com\/users\//
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

//GM.setValue(dataPrefix + "16320675", JSON.stringify({"id":"16320675","name":"<self>","rank":99,"note":"myself"}));  //XXX
//GM.setValue(dataPrefix + "2164365",  JSON.stringify({"id":"2164365","name":"Abra","rank":"-3","note":"feel free to write answer - https://stackoverflow.com/a/73943797/16320675"}));  //XXX


// user page
var userBanner;
var editPanel;
var editText;
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
  rankNode = createTextNode("");
  statusNode = createTextNode("");
  noteNode = createTextNode("");
  editText = createTextArea("un-edit-text", "testing");

  let rankPanel = createPanel("un-rank-panel");
  rankPanel.appendChild(createButton("un-dec-rank", "v", () => updateUser(userId, decUser)));
  rankPanel.appendChild(rankNode);
  rankPanel.appendChild(createButton("un-inc-rank", "^", () => updateUser(userId, incUser)));
  //GM.notification("X buttons", "userNotes");  //XXX

  editPanel = createPanel("un-edit-panel");
  editPanel.style = "position:absolute;box-shadow:0px 8px 16px 0px rgba(0,0,0,0.5);z-index:1;background-color:lightgray;display:none;";
  editPanel.appendChild(editText);
  editPanel.appendChild(createButton("un-save-note", "Save", () => updateUser(userId, noteEdited)));
  editPanel.appendChild(createButton("un-cancel-note", "Cancel", () => editPanel.style.display="none"));

  let notePanel = createPanel("un-note-panel");
  notePanel.appendChild(createButton("un-edit-note", "!", () => updateUser(userId, editNote)));
  notePanel.appendChild(createTextNode("Note: "));
  notePanel.appendChild(noteNode);
  let del = createButton("un-delete-user", "X", null, () => deleteUser(userId));
  notePanel.appendChild(del);
  //GM.notification("X del: " + del, "UserNotes");  //XXX  
  
  let statusPanel = createPanel("un-status-panel");
  statusPanel.style = "font-style: italic;";
  statusPanel.appendChild(statusNode);
  //GM.notification("X statusNode: " + statusNode, "UserNotes");  //XXX
  
  userBanner = createBlock("un-user-banner");
  userBanner.appendChild(rankPanel);
  userBanner.appendChild(editPanel);
  userBanner.appendChild(notePanel);
  userBanner.appendChild(statusPanel);
  
  let content = document.getElementById("content");
  content.insertAdjacentElement("afterbegin", userBanner);
  //GM.notification("X content: " + content, "UserNotes");  //XXX

  reloadUser(userId, updateUserAugmentation);
}


function updateUserAugmentation(user) {
  //GM.notification("X repaint: " + user.id, "userNotes");  //XXX
  statusNode.textContent = user.new ? "no data" : "";
  rankNode.textContent = user.rank;
  noteNode.textContent = user.note;
}


function updateUser(userId, execute) {
  //GM.notification("X update: " + userId, "UserNotes");  //XXX
  reloadUser(userId, user => {
    //GM.notification("X reloaded: " + user.id, "userNotes");  //XXX
    if (execute(user)) {
      saveData(user);
    }
    updateUserAugmentation(user);
  });
}


function decUser(user) {
  //GM.notification("X dec: " + user.id, "UserNotes");  //XXX
  user.rank -= 1;
  return true;
}


function incUser(user) {
  //GM.notification("X inc: " + user.id, "UserNotes");  //XXX
  user.rank = +user.rank + 1;
  return true;
}


function deleteUser(userId) {
  //TODO confirm
  //GM.notification("X deleting: " + userId, "UserNotes");  //XXX
  if (userId === "16320675") return;  //XXX
  deleteData(userId);
  reloadUser(userId, updateUserAugmentation);
  //GM.notification("X deleted: " + userId, "UserNotes");  //XXX
}


function editNote(user) {
  //GM.notification("X edit: " + user.id, "UserNotes");  //XXX
  editText.value = user.note;
  editPanel.style.display = "initial";
  return false;
}


function noteEdited(user) {
  editPanel.style.display="none";
  user.note = editText.value;
  return true;
}


function createBlock(id) {
  let block = document.createElement("DIV");
  block.class = "un-block";
  block.id = id;
  return block;
}


function createPanel(id) {
  let panel = document.createElement("SPAN");
  panel.class = "un-panel";
  panel.id = id;
  return panel;
}


function createTextNode(text) {
  let node = document.createTextNode(text);
  return node;
}


function createTextArea(id, text) {
  let area = document.createElement("TEXTAREA");
  area.class = "un-textarea";
  area.id = id;
  area.value = text;
  area.style = "display:block;";
  return area;
}


function createButton(id, text, onclick, ondblclick) {
  let button = document.createElement("BUTTON");
  button.class = "un-button";
  button.id = id;
  button.type = "button";
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
    GM.notification("X save: " + data, "userNotes");  //XXX
  }
}


function readData(userId) {
  return GM.getValue(dataPrefix + userId, '{"new":"true","id":"' + userId + '","rank":0,"note":""}');
}


function deleteData(userId) {
  //GM.notification("X deleting: " + userId, "UserNotes");  //XXX
  if (userId) {
    GM.deleteValue(dataPrefix + userId);
  }
}

/* */

