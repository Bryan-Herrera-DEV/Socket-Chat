"use strict";

var socket = io.connect('http://localhost:7000', {
  'forceNew': true
});
var status = {
  logged: false,
  currentui: "login-ui"
};
$(document).ready(function () {
  var animating = false,
      submitPhase1 = 1100,
      submitPhase2 = 400,
      $login = $(".panel"),
      $app = $(".app");

  function ripple(elem, e) {
    $(".ripple").remove();
    var elTop = elem.offset().top,
        elLeft = elem.offset().left,
        x = e.pageX - elLeft,
        y = e.pageY - elTop;
    var $ripple = $("<div class='ripple'></div>");
    $ripple.css({
      top: y,
      left: x
    });
    elem.append($ripple);
  }

  ;
  $(document).on("click", ".btn", function (e) {
    if (animating) return;
    animating = true;
    var that = this;
    ripple($(that), e);
    $(that).addClass("processing");
    setTimeout(function () {
      $(that).addClass("success");
      setTimeout(function () {
        $app.show();
        $app.css("top");
        $app.addClass("active");
      }, submitPhase2 - 70);
      setTimeout(function () {
        $login.hide();
        $login.addClass("inactive");
        animating = false;
        $(that).removeClass("success processing");
      }, submitPhase2);
    }, submitPhase1);
  });
});

function login() {
  hideError();
  var username = document.getElementById("username-input").value;
  status.username = username;
  socket.emit("login", {
    username: username
  });
}

function showUI(name) {
  document.getElementById(status.currentui).style.display = "none";
  document.getElementById(status.currentui).style.opacity = "0";
  document.getElementById(status.currentui).style.transform = "scale(1.1)";
  document.getElementById(name).style.display = "block";
  document.getElementById(name).style.opacity = "1";
  document.getElementById(name).style.transform = "scale(1)";
  status.currentui = name;
}

function displayError(error) {
  if (status.logged) {} else {
    var obj = document.getElementById("login-error");
    obj.innerHTML = error;
    obj.style.display = "block";
  }
}

function hideError() {
  if (status.logged) {} else {
    var obj = document.getElementById("login-error");
    obj.style.display = "none";
  }
}

function addChat(author, message) {
  var list = document.getElementById("chat-list");
  var isBC = author == null;
  var isOwn = author == status.username;
  message = message.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  list.innerHTML = list.innerHTML + "\n    <div class=\"message-item".concat(isBC ? " broadcast" : isOwn ? " own-msg" : "", "\">\n        ").concat(author != null ? " <span class=\"message-author\">" + author + "</span><br>" : "", "\n        <span class=\"message-content\">").concat(message, "</span>\n    </div>\n    ");
  list.scrollTop = list.scrollHeight;
}

function sendMessage() {
  msg = $('.form-control').val();

  if ($.trim(msg) == '') {
    return false;
  }

  var obj = document.getElementById("message-input");
  var text = obj.value;
  obj.value = "";
  socket.emit("chat", {
    message: text
  });
}

socket.on("chat", function (data) {
  addChat(data.username, data.message);
});
socket.on("pop", function (pop) {
  if (pop.type == "error") {
    displayError(pop.message);
  }
});
socket.on("broadcast", function (b) {
  var message = b.message;
  addChat(null, message);
});
socket.on("login", function () {
  status.logged = true;
  showUI("chat-ui");
});
socket.on("disconnect", function () {
  status.logged = false;
  showUI("login-ui");
  displayError("Disconnected from the server");
});
socket.on("error", function () {
  status.logged = false;
  showUI("login-ui");
  displayError("Connection loss to the server.");
});
window.addEventListener("load", function () {
  document.getElementById('username-input').onkeypress = function (e) {
    if (!e) e = window.event;
    var keyCode = e.keyCode || e.which;

    if (keyCode == '13') {
      login();
      return false;
    }
  };

  document.getElementById('message-input').onkeypress = function (e) {
    if (!e) e = window.event;
    var keyCode = e.keyCode || e.which;

    if (keyCode == '13') {
      sendMessage();
      return false;
    }
  };
});