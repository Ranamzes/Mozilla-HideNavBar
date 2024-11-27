"use strict";
// ==UserScript==
// @name            NavBar Modifier
// @author          Re•MART
// @version         1.8
// @description     Modifies the nav-bar based on mouse position
// @include         main
// @startup         UC.navBarModifier.startup(win);
// @shutdown        UC.navBarModifier.shutdown(win);
// ==/UserScript==

UC.navBarModifier = {
	navBar: null,
	isMouseOverMenu: false,
	whiteList: ["addons.mozilla.org", "dev.azure.com"],

	startup: function (window) {
		try {
			if (!window.gNavToolbox) return;

			let navBar = window.document.getElementById("nav-bar");
			if (!navBar) throw new Error("nav-bar not found");

			navBar.style.transition = "margin-bottom 400ms, opacity 400ms, visibility 400ms";

			const mouseMoveHandler = (e) => {
				try {
					let currentWindow = e.view || window;
					let currentURL = currentWindow.location.href;
					const urlBarInput = currentWindow.document.querySelector("#urlbar");
					const isContextMenuOpen = urlBarInput && urlBarInput.getAttribute("focused") === "true";

					const y = e.clientY;
					const isMenuOpen = this.isAnyNonTabMenuOpen(currentWindow);
					const isCustomizing = currentWindow.document.documentElement.getAttribute("customizing") === "true";
					const rootStyle = currentWindow.document.documentElement.style;

					const isWhitelisted = this.whiteList.some(domain => currentURL.includes(domain));

					// Проверка на Nimbus Dial с учетом возможного отсутствия gBrowser
					let isNimbusDial = false;
					if (currentWindow.gBrowser && currentWindow.gBrowser.selectedTab) {
						isNimbusDial = currentWindow.gBrowser.selectedTab.label.startsWith("Nimbus Dial");
					}

					if (y <= 70 || isMenuOpen || this.isMouseOverMenu || isCustomizing || isWhitelisted || isNimbusDial) {
						navBar.style.setProperty("margin-bottom", "0px");
						navBar.style.opacity = "1";
						navBar.style.visibility = "visible";
						rootStyle.setProperty("--tab-filter", "none");
						const urlBar = currentWindow.document.getElementById("urlbar");
						if (urlBar) {
							urlBar.style.display = "block";
						}
					} else if (y >= 550) {
						navBar.style.setProperty("margin-bottom", "-28px");
						navBar.style.opacity = "0";
						navBar.style.visibility = "hidden";
						rootStyle.setProperty("--tab-filter", "contrast(0.57) saturate(0)");
						const urlBar = currentWindow.document.getElementById("urlbar");
						if (urlBar) {
							urlBar.style.display = "none";
						}
					}
				} catch (error) {
					console.error("Critical error in mouseMoveHandler: ", error);
				}
			};

			if (!window.ucHandlers) {
				window.ucHandlers = {};
			}

			window.document.addEventListener("mousemove", mouseMoveHandler);
			window.navBarModifierMouseMoveHandler = mouseMoveHandler;

		} catch (error) {
			console.error("Critical error in startup: ", error);
		}
	},

	shutdown: function (window) {
		if (window.navBarModifierMouseMoveHandler) {
			window.document.removeEventListener("mousemove", window.navBarModifierMouseMoveHandler);
			delete window.navBarModifierMouseMoveHandler;
		}
	},

	isAnyNonTabMenuOpen: function (window) {
		const openElements = window.document.querySelectorAll("#navigator-toolbox [open]");
		for (let element of openElements) {
			if (!element.classList.contains("tabbrowser-tab")) {
				return true;
			}
		}
		return false;
	},

	init: function () {
		const windows = Services.wm.getEnumerator("navigator:browser");
		while (windows.hasMoreElements()) {
			this.startup(windows.getNext());
		}
	}
};

UC.navBarModifier.init();
