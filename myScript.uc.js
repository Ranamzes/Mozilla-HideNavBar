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
		try {
			if (!window.gNavToolbox) return;

			this.navBar = window.document.getElementById("nav-bar");
			this.navBar.style.transition =
				"margin-bottom 400ms, opacity 400ms, visibility 400ms";

			let mouseMoveHandler = function (e) {
				try {
					// Get the correct window object.
					let currentWindow = e.view || window;
					let currentTab = currentWindow.gBrowser.selectedTab;
					let currentBrowser = currentTab.linkedBrowser;
					let currentURL = currentBrowser.currentURI.spec;

					if (currentURL.includes("addons.mozilla.org")) {
						navBar.style.setProperty("margin-bottom", "0px");
						navBar.style.opacity = "1";
						navBar.style.visibility = "visible";
						return; // exit the function early
					}

					const y = e.clientY;
					const isMenuOpen =
						currentWindow.document.querySelector(
							"#navigator-toolbox [open]"
						) !== null;
					const isCustomizing =
						currentWindow.document.documentElement.getAttribute(
							"customizing"
						) === "true";
					if (
						y <= 70 ||
						isMenuOpen ||
						UC.navBarModifier.isMouseOverMenu ||
						isCustomizing
					) {
						UC.navBarModifier.navBar.style.setProperty("margin-bottom", "0px");
						UC.navBarModifier.navBar.style.opacity = "1";
						UC.navBarModifier.navBar.style.visibility = "visible";
					} else if (y > 70 && y < 120) {
						// Keep existing behavior, but you can add logic here if you want some transition state
					} else if (y >= 120) {
						UC.navBarModifier.navBar.style.setProperty(
							"margin-bottom",
							"-28px"
						);
						UC.navBarModifier.navBar.style.opacity = "0";
						UC.navBarModifier.navBar.style.visibility = "hidden";
					}
				} catch (error) {
					console.error("Error in mouseMoveHandler: ", error);
				}
			};

			window.document.addEventListener("mousemove", mouseMoveHandler);
			window.navBarModifierMouseMoveHandler = mouseMoveHandler;
			// MutationObserver setup
			let observer = new MutationObserver(function (mutations) {
				mutations.forEach(function (mutation) {
					if (mutation.attributeName === "open") {
						let isOpen = mutation.target.getAttribute("open") === "true";
						if (isOpen) {
							UC.navBarModifier.navBar.style.setProperty(
								"margin-bottom",
								"0px"
							);
							UC.navBarModifier.navBar.style.opacity = "1";
							UC.navBarModifier.navBar.style.visibility = "visible";
						} else {
							// Logic here if you need to hide the navBar when menus are not open
						}
					}
				});
			});

			// Start observing
			observer.observe(window.document.getElementById("navigator-toolbox"), {
				attributes: true,
				subtree: true,
				attributeFilter: ["open"],
			});

			// Save the observer to disconnect it later
			this.observer = observer;

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
			window.document.removeEventListener("mousemove", this.mouseMoveHandler);
			// Disconnect the observer
			if (this.observer) {
				this.observer.disconnect();
			}
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
