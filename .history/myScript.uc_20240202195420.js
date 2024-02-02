"use strict";
// ==UserScript==
// @name            NavBar Modifier
// @author          Re•MART
// @version         1.1
// @description     Modifies the nav-bar based on mouse position
// @include         main
// @startup         UC.navBarModifier.startup(win);
// @shutdown        UC.navBarModifier.shutdown(win);
// ==/UserScript==

UC.navBarModifier = {
	navBar: null,
	isMouseOverMenu: false,

	startup: function (window) {
		// console.log("Startup method called for a window");
		try {
			    let logElement = window.document.getElementById("navBarModifierLog");
    if (!logElement) {
        logElement = window.document.createElement("div");
        logElement.id = "navBarModifierLog";
        logElement.style.position = "fixed";
        logElement.style.bottom = "10px";
        logElement.style.left = "10px";
        logElement.style.zIndex = "10000";
        logElement.style.padding = "5px";
        logElement.style.backgroundColor = "rgba(0,0,0,0.7)";
        logElement.style.color = "white";
        logElement.style.borderRadius = "5px";
        logElement.style.fontSize = "12px";
        window.document.body.appendChild(logElement);
    }
			if (!window.gNavToolbox) return;

			let navBar = window.document.getElementById("nav-bar");
			navBar.style.transition =
				"margin-bottom 400ms, opacity 400ms, visibility 400ms";

			let mouseMoveHandler = function (e) {
				try {
					// Get the correct window object.
					let currentWindow = e.view || window;

					// Check if on addons.mozilla.org with more flexible URL checking
					let currentURL = currentWindow.location.href;
					console.log("Current URL: ", currentURL);
					if (
						currentURL.includes("addons.mozilla.org") ||
						currentURL.includes("tesera.ru")
					) {
						console.log("On AMO - Keeping navBar visible");
						navBar.style.setProperty("margin-bottom", "0px");
						navBar.style.opacity = "1";
						navBar.style.visibility = "visible";
						return; // exit the function early
					}

					const y = e.clientY;
					const isMenuOpen =
						currentWindow.document
							.querySelector("#navigator-toolbox")
							.querySelector("[open]") !== null;
					const isCustomizing =
						currentWindow.document.documentElement.getAttribute(
							"customizing"
						) === "true";
					const rootStyle = currentWindow.document.documentElement.style;
					if (
						y <= 70 ||
						isMenuOpen ||
						UC.navBarModifier.isMouseOverMenu ||
						isCustomizing
					) {
						navBar.style.setProperty("margin-bottom", "0px");
						navBar.style.opacity = "1";
						navBar.style.visibility = "visible";
						rootStyle.setProperty("--tab-filter", "none");
					} else if (y >= 120) {
						navBar.style.setProperty("margin-bottom", "-28px");
						navBar.style.opacity = "0";
						navBar.style.visibility = "hidden";
						rootStyle.setProperty("--tab-filter", "contrast(0.57) saturate(0)");
					}
				} catch (error) {
					console.error("Error in mouseMoveHandler: ", error);
				}
			};

			window.document.addEventListener("mousemove", mouseMoveHandler);
			window.navBarModifierMouseMoveHandler = mouseMoveHandler;

			let keydownHandler = function (e) {
				try {
					if (e.ctrlKey && e.keyCode === 75) {
						if (navBar) {
							navBar.style.setProperty("margin-bottom", "0px");
							navBar.style.opacity = "1";
							navBar.style.visibility = "visible";
						}

						// Set focus to the URL bar after a delay
						window.setTimeout(function () {
							// Use the gURLBar object to focus the URL bar and place the caret
							const urlBarElement = window.gURLBar.querySelector(
								"moz-input-box.urlbar-input-box"
							);
							const inputElement = urlBarElement.querySelector("input");

							if (inputElement) {
								inputElement.addEventListener("focus", function () {
									inputElement.setSelectionRange(0, inputElement.value.length);
								});
							}

							urlBarElement.focus();
						}, 400); // Delay of 1000ms
					}
				} catch (error) {
					console.error("Error in keydownHandler: ", error);
					window.document.removeEventListener("keydown", this.keydownHandler);
					window.document.addEventListener("keydown", this.keydownHandler);
				}
			};
			window.document.addEventListener("keydown", keydownHandler);
			window.navBarModifierKeydownHandler = keydownHandler;

			const menu = window.document.querySelector(
				"#urlbar-input-container menupopup.textbox-contextmenu"
			);
			if (menu) {
				menu.addEventListener("mouseover", function () {
					UC.navBarModifier.isMouseOverMenu = true;
				});
				menu.addEventListener("mouseout", function () {
					UC.navBarModifier.isMouseOverMenu = false;
				});
			}

			const toolbarMenu = window.document.getElementById(
				"toolbar-context-menu"
			);
			if (toolbarMenu) {
				toolbarMenu.addEventListener("mouseover", function () {
					UC.navBarModifier.isMouseOverMenu = true;
				});
				toolbarMenu.addEventListener("mouseout", function () {
					UC.navBarModifier.isMouseOverMenu = false;
				});
			}
		} catch (error) {
			console.error("Error in startup: ", error);
		}
	},

	shutdown: function (window) {
		// console.log("Shutdown method called for a window");
		try {
			if (!window.gNavToolbox) return;

			if (window.navBarModifierMouseMoveHandler) {
				window.document.removeEventListener(
					"mousemove",
					window.navBarModifierMouseMoveHandler
				);
			}

			if (window.navBarModifierKeydownHandler) {
				window.document.removeEventListener(
					"keydown",
					window.navBarModifierKeydownHandler
				);
			}
		} catch (error) {
			console.error("Error in shutdown: ", error);
		}
	},

	init: function () {
		// console.log("Init method called");

		Services.wm.addListener({
			onOpenWindow: function (aWindow) {
				// console.log("New window detected");
				var domWindow = aWindow
					.QueryInterface(Ci.nsIInterfaceRequestor)
					.getInterface(Ci.nsIDOMWindowInternal || Ci.nsIDOMWindow);
				domWindow.addEventListener("load", function () {
					// console.log("Applying startup method to new window");
					UC.navBarModifier.startup(domWindow);
				});
			},
			onCloseWindow: function (aWindow) {
				// console.log("Window close detected");
				UC.navBarModifier.shutdown(aWindow);
			},
			onWindowTitleChange: function (aWindow, aTitle) {},
		});

		var windows = Services.wm.getEnumerator("navigator:browser");
		while (windows.hasMoreElements()) {
			let domWindow = windows.getNext();
			if (domWindow instanceof Ci.nsIDOMWindow) {
				this.startup(domWindow);
			}
		}
	},
};

UC.navBarModifier.init();
