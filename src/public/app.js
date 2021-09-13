const socket = io.connect('localhost:3000', { 'forceNew': true });
const status = {
	logged: false,
	currentui: "login-ui"
}
var cariño = () => $(document).ready(() => {

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
		$ripple.css({ top: y, left: x });
		elem.append($ripple);
	};
	var animacion = (e) => {

		if (animating) return;
		animating = true;
		var that = document.getElementById('btn');
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
		return false
	}
	$("#username-input").keypress((e) => {
		var code = (e.keyCode ? e.keyCode : e.which);
		if (code == 13) {
			e.preventDefault();
			animacion(e);
		}

	});
	$(document).on("click", ".btn", (e) => {
		animacion(e);
	});



});


var login = () => {
	hideError();
	const username = document.getElementById("username-input").value;
	status.username = username;
	socket.emit("login", { username });
}

var showUI = (name) => {
	cariño(() => {
		document.getElementById(status.currentui).style.display = "none";
		document.getElementById(status.currentui).style.opacity = "0";
		document.getElementById(status.currentui).style.transform = "scale(1.1)";
		document.getElementById(name).style.display = "block";
		document.getElementById(name).style.opacity = "1";
		document.getElementById(name).style.transform = "scale(1)";
		status.currentui = name;
	})
}
var displayError = (error) => {
	if (status.logged) {
	} else {
		let obj = document.getElementById("login-error");
		obj.innerHTML = error;
		obj.style.display = "block";
	}
}
var hideError = () => {
	if (status.logged) {
	} else {
		let obj = document.getElementById("login-error");
		obj.style.display = "none";
	}
}
var addChat = (author, message) => {
	const list = document.getElementById("chat-list");
	const isBC = (author == null);
	const isOwn = (author == status.username);
	message = message.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');
	list.innerHTML = list.innerHTML + `
    <div class="message-item${(isBC ? " broadcast" : (isOwn ? " own-msg" : ""))}">
        ${(author != null ? " <span class=\"message-author\">" + author + "</span><br>" : "")}
        <span class="message-content">${message}</span>
    </div>
    `;
	list.scrollTop = list.scrollHeight;
}
var sendMessage = () => {
	msg = $('.form-control').val();

	if ($.trim(msg) == '') {
		return false;
	}
	const obj = document.getElementById("message-input");
	const text = obj.value;
	obj.value = "";
	socket.emit("chat", { message: text });
}
socket.on("chat", (data) => {
	addChat(data.username, data.message);
})
socket.on("pop", (pop) => {
	if (pop.type == "error") {
		displayError(pop.message);
	}
});
socket.on("broadcast", (b) => {
	let { message } = b;

	addChat(null, message);
})
socket.on("login", () => {
	status.logged = true;
	showUI("chat-ui");
});
socket.on("disconnect", () => {
	status.logged = false;
	showUI("login-ui");
	displayError("Disconnected from the server");
});
socket.on("error", () => {
	status.logged = false;
	showUI("login-ui");
	displayError("Connection loss to the server.");
});
window.addEventListener("load", () => {
	document.getElementById('username-input').onkeypress = function (e) {
		if (!e) e = window.event;
		var keyCode = e.keyCode || e.which;
		if (keyCode == '13') {
			login();
			return false;
		}
	}
	document.getElementById('message-input').onkeypress = function (e) {
		if (!e) e = window.event;
		var keyCode = e.keyCode || e.which;
		if (keyCode == '13') {
			sendMessage();
			return false;
		}
	}
})