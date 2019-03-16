const { app, BrowserWindow, Menu, MenuItem, TouchBar, remote, systemPreferences } = require("electron");
const {TouchbarLabel, TouchBarButton, TouchBarSpacer} = TouchBar;
const Store = require('electron-store');
const store = new Store();
const path = require("path");
const url = require("url");

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 600,
    titleBarStyle: "hiddenInset",
    transparent: true,
    vibrancy: "light"
  });

	win.setMinimumSize(1200, 600);
	win.setMaximumSize(1200, 600);

	// load the dist folder from Angular
	win.loadURL(
		url.format({
			pathname: path.join(__dirname, '/dist/index.html'),
			protocol: "file:",
			slashes: true
		})
	);

	OSTheme()

	// The Following is optional and will opent the DevTools:
	// win.webContents.openDevTools()
	win.on("closed", () => {
		win = null;
	});

	/******
		Create Application Menu's
	******/
	var menu = Menu.buildFromTemplate([
		{
			label: app.getName(),
			submenu: [
				{role: 'about'},
				{type: 'separator'},
				{role: 'services'},
				{type: 'separator'},
				{role: 'hide'},
				{role: 'hideothers'},
				{role: 'unhide'},
				{type: 'separator'},
				{role: 'quit'}

			]
		},
		{
			label: 'File',
			submenu: [
				{
					label: 'Add Label',
					click(){
// 						const win = getWindow();
// 						console.log('Add Label Menu item clicked');
						win.webContents.send('addLabel', 'add');
					},
					accelerator: 'Cmd+N'
				},
				{
					label: 'Clear Labels',
					click(){
// 						const win = getWindow();
// 						console.log('Clear Labels Menu item clicked');
						win.webContents.send('clearLabels', 'clear');
					},
					accelerator: 'Cmd+Backspace'
				},
				{
					label: 'Print Labels',
					click(){
// 						const win = getWindow();
// 						console.log('Clear Labels Menu item clicked');
// 						win.webContents.send('clearLabels', 'clear');
					},
					accelerator: 'Cmd+P'
				},
				{role: 'toggledevtools'}
			]
		},
		{
			label: 'Edit',
			submenu: [
				{ label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
				{ label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
				{ type: "separator" },
				{ label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
				{ label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
				{ label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
				{ label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
			]
		},
		{
			role: 'window',
			submenu: [
				{role: 'minimize'},
				{role: 'close'}
			]
		},
		{
			role: 'help',
			submenu: [
				{
					label: 'Learn More',
					click () { require('electron').shell.openExternal('https://portal.simplymac.com')}
				}
			]
		}
	])
	Menu.setApplicationMenu(menu);

	/******
		Create Application Touchbar if supported
	******/
	const AddLabel = new TouchBarButton({
		label: 'Add Label',
		icon: 'add',
		backgroundColor: '#1da0dc',
		click: () => {
			console.log("AddLabel TB button Pressed. Sending Command");
			win.webContents.send('addLabel', 'add');
		}
	});
	const ClearLabels = new TouchBarButton({
		label: 'Clear Label',
		backgroundColor: '#7f0000',
		click: () => {
			console.log("ClearLabels TB button Pressed. Sending Command");
			win.webContents.send('clearLabels', 'clear');
		}
	})

	const touchbar = new TouchBar([
		AddLabel,
		ClearLabels
	]);
	win.setTouchBar(touchbar);




}
function OSTheme(){
// Configure Dark Mode based on OS theme
	if (process.platform == 'darwin') {


	  //const { systemPreferences } = remote

	  const setOSTheme = () => {
	    let theme = systemPreferences.isDarkMode() ? 'dark' : 'light'
	    store.set('OSTheme', theme);

	    win.webContents.on('did-finish-load', function(){
			console.log("Web Contents Loaded");
			win.webContents.send('OSTheme', store.get('OSTheme'));
	    });
	    win.webContents.send('OSTheme', theme);

	    console.log("Computer's Theme is: " + store.get('OSTheme'));
	  }

	  systemPreferences.subscribeNotification(
	    'AppleInterfaceThemeChangedNotification',
	    setOSTheme,
	  )

	  setOSTheme()
	}
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
