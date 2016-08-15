window.addEventListener("load", function () {
	var style = document.createElement("style");
	style.innerHTML = "body, #blur::before { background-image: url(/img/bg_main.jpg); }";
	document.body.appendChild(style);
});