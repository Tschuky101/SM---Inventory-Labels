const { app, BrowserWindow } = require("electron");
const path = require("path");
const url = require("url");

let win;

function createWindow(){
	win = new BrowserWindow({width: 1200, height: 600, titleBarStyle: 'hiddenInset'});
	
	win.setMinimumSize(1200, 600);
	win.setMaximumSize(1200, 1000);
	
	// load the dist folder from Angular
	win.loadURL(
		url.format({
			pathname: path.join(__dirname, '/dist/index.html'),
			protocol: "file:",
			slashes: true
		})
	);
	
	// The Following is optional and will opent the DevTools:
	// win.webContents.openDevTools()
	
	win.on("closed", () => {
		win = null;
	});

}

app.on("ready", createWindow);

// on macOS, closing the window doesn't quit the app
app.on("window-all-closed", () => {
	if (process.platform !== "darwin"){
		app.quit();
	}
});

// initialize the app's main window
app.on("activate", () => {
	if (win === null){
		createWindow();
	}
});