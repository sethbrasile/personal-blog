// Stolen from https://www.brycewray.com/posts/2023/08/making-giscus-less-gabby/
getGiscusTheme = () => {
	const themeStatus = localStorage.getItem("pref-theme")
	let
		dataThemeAuto = "preferred_color_scheme",
		dataThemeLight = "light",
		dataThemeDark = "noborder_gray",
		giscusTheme = dataThemeAuto
	if (themeStatus === undefined || themeStatus === "auto") {
		giscusTheme = dataThemeAuto
	} else if (themeStatus === "light") {
		giscusTheme = dataThemeLight
	} else if (themeStatus === "dark") {
		giscusTheme = dataThemeDark
	}
	return giscusTheme
}

setGiscusTheme = () => {
	function sendMessage(message) {
		const iframe = document.querySelector('iframe.giscus-frame')
		if (!iframe) return
		iframe.contentWindow.postMessage({ giscus: message }, 'https://giscus.app')
	}
	sendMessage({
		setConfig: {
			theme: getGiscusTheme(),
		},
	})
}

document.addEventListener('DOMContentLoaded', function () {
  const giscusAttributes = {
    src: "https://giscus.app/client.js",
    "data-repo": "sethbrasile/personal-blog",
    "data-repo-id": "R_kgDOL-1KBg",
    "data-category": "General",
		"data-category-id": "DIC_kwDOL-1KBs4Cfisg",
    "data-mapping": "pathname",
    "data-strict": "1",
    "data-reactions-enabled": "1",
    "data-emit-metadata": "0",
    "data-input-position": "top",
    "data-theme": getGiscusTheme(),
    "data-lang": "en",
    "data-loading": "lazy",
    crossorigin: "anonymous",
    async: ""
  }

	// Dynamically create script tag
	const giscusScript = document.createElement("script")
	Object.entries(giscusAttributes).forEach(([key, value]) => giscusScript.setAttribute(key, value))
	let divToAdd = document.querySelector('.giscus-comments')

	// Inject script when user clicks the `details` element
	let detailsGiscus = document.getElementById('data-comments')
		// commentsLegend = document.getElementById('legend-comments')
	detailsGiscus.addEventListener("toggle", toggleDetails)
	function toggleDetails() {
		divToAdd.appendChild(giscusScript)
	// 	// There is no concept of hiding the comments after showing them right now
  //   // if (commentsLegend.innerHTML === 'View comments') {
	// 	// 	commentsLegend.innerHTML = 'Hide comments'
	// 	// } else {
	// 	// 	commentsLegend.innerHTML = 'View comments'
	// 	// }
	}
	// Update giscus theme when theme switcher is clicked
	// const buttonLight = document.getElementById("sun")
	// // const buttonAuto = document.getElementById("autoMode")
	// const buttonDark = document.getElementById("moon")
	// buttonLight.addEventListener('click', setGiscusTheme)
	// // buttonAuto.addEventListener('click', setGiscusTheme)
	// buttonDark.addEventListener('click', setGiscusTheme)
})
