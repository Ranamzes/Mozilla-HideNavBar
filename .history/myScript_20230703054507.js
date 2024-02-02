"use strict";
// ==UserScript==
// @name            NavBar Mousemove
// @author          Re•MART
// @version         1.0
// @description     Change navBar styles based on mouse position.
// @include         main
// @shutdown        UC.navBarMousemove.unload();
// @onlyonce
// ==/UserScript==

UC.navBarMousemove = {
	frameScript:
		"data:application/javascript;charset=UTF-8," +
		encodeURIComponent(
			'"use strict";\n(' +
				function () {
					var navBar = content.document.getElementById("nav-bar");

					content.document.addEventListener("mousemove", function (e) {
						var y = e.clientY;

						if (y <= 100) {
							navBar.style.marginBottom = "0px";
							navBar.style.transform = "rotateX(0deg)";
						} else {
							navBar.style.marginBottom = "-27px";
							navBar.style.transform = "rotateX(270deg)";
						}
					});

					function unload() {
						content.document.removeEventListener("mousemove");
						delete UC.navBarMousemove;
					}
					addMessageListener("NavBarMousemove@remart.com:disable", unload);
				}.toString() +
				")();"
		),
	init: function () {
		const globalMessageManager = Cc[
			"@mozilla.org/globalmessagemanager;1"
		].getService();
		globalMessageManager.loadFrameScript(this.frameScript, true);
	},

	unload: function () {
		const globalMessageManager = Cc[
			"@mozilla.org/globalmessagemanager;1"
		].getService();
		globalMessageManager.broadcastAsyncMessage(
			"NavBarMousemove@remart.com:disable"
		);
		globalMessageManager.removeDelayedFrameScript(this.frameScript);

		delete UC.navBarMousemove;
	},
};

UC.navBarMousemove.init();
