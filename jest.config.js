module.exports = {
	"preset": "react-native",
	"collectCoverage": true,
	"moduleDirectories": [
		"node_modules",
		"src"
	],
	"transform": {
		"^.+\\.js$": "<rootDir>/node_modules/react-native/jest/preprocessor.js",
		'^.+\\.(js|jsx)?$': 'babel-jest'
	},
	"setupFiles": [
		"<rootDir>/jest/setup.js"
	],
	"transformIgnorePatterns": [
		"node_modules/(?!(jest-)?react-native|react-navigation|react-navigation-stack|@react-navigation/.*)"
	],
	"coveragePathIgnorePatterns": [
		"/node_modules/",
		"/jest"
	]
};