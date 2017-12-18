/*global __dirname, module*/

module.exports = {
	automock: false,
	transform: {
    	"^.+\\.js$": __dirname + "/jest.transform.js"
	},
	setupFiles: [
		__dirname + "/jest.init.js"
	]
}
