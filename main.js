// main.js - Main process
const { app, BrowserWindow, Menu, dialog, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs').promises;

let mainWindow;

// Get user data path
function getUserDataPath() {
    return path.join(app.getPath('userData'), 'library.json');
}

// Create the main window
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        },
        icon: path.join(__dirname, 'icon.png'), // Add your icon
        titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
        backgroundColor: '#0f172a'
    });

    mainWindow.loadFile('index.html');

    // Create menu
    createMenu();
}

// Create application menu
function createMenu() {
    const template = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'Export Library',
                    accelerator: 'CmdOrCtrl+E',
                    click: async () => {
                        const { filePath } = await dialog.showSaveDialog({
                            defaultPath: `book-library-${new Date().toISOString().split('T')[0]}.json`,
                            filters: [{ name: 'JSON', extensions: ['json'] }]
                        });
                        
                        if (filePath) {
                            mainWindow.webContents.send('export-library', filePath);
                        }
                    }
                },
                {
                    label: 'Import Library',
                    accelerator: 'CmdOrCtrl+I',
                    click: async () => {
                        const { filePaths } = await dialog.showOpenDialog({
                            filters: [{ name: 'JSON', extensions: ['json'] }],
                            properties: ['openFile']
                        });
                        
                        if (filePaths && filePaths[0]) {
                            mainWindow.webContents.send('import-library', filePaths[0]);
                        }
                    }
                },
                { type: 'separator' },
                {
                    label: 'Quit',
                    accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
                    click: () => {
                        app.quit();
                    }
                }
            ]
        },
        {
            label: 'Edit',
            submenu: [
                { label: 'Undo', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
                { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
                { type: 'separator' },
                { label: 'Cut', accelerator: 'CmdOrCtrl+X', role: 'cut' },
                { label: 'Copy', accelerator: 'CmdOrCtrl+C', role: 'copy' },
                { label: 'Paste', accelerator: 'CmdOrCtrl+V', role: 'paste' }
            ]
        },
        {
            label: 'View',
            submenu: [
                { label: 'Reload', accelerator: 'CmdOrCtrl+R', role: 'reload' },
                { label: 'Toggle DevTools', accelerator: 'F12', role: 'toggleDevTools' },
                { type: 'separator' },
                { label: 'Actual Size', accelerator: 'CmdOrCtrl+0', role: 'resetZoom' },
                { label: 'Zoom In', accelerator: 'CmdOrCtrl+Plus', role: 'zoomIn' },
                { label: 'Zoom Out', accelerator: 'CmdOrCtrl+-', role: 'zoomOut' },
                { type: 'separator' },
                { label: 'Toggle Fullscreen', accelerator: 'F11', role: 'togglefullscreen' }
            ]
        },
        {
            label: 'Help',
            submenu: [
                {
                    label: 'About Book Thingy',
                    click: () => {
                        dialog.showMessageBox({
                            type: 'info',
                            title: 'About Book Thingy',
                            message: 'Book Thingy',
                            detail: 'A simple, offline book tracking app.\n\nVersion: 1.0.0\n\nMade with ❤️ for book lovers.',
                            buttons: ['OK']
                        });
                    }
                }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

// IPC Handlers
ipcMain.handle('load-library', async () => {
    try {
        const filePath = getUserDataPath();
        console.log('Loading library from:', filePath);
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.log('No existing library found, creating new one');
        // Return default library if file doesn't exist
        return { books: [], settings: { goal2025: null } };
    }
});

ipcMain.handle('save-library', async (event, library) => {
    try {
        const filePath = getUserDataPath();
        console.log('Saving library to:', filePath);
        
        // Ensure the directory exists
        const dir = path.dirname(filePath);
        try {
            await fs.mkdir(dir, { recursive: true });
        } catch (mkdirError) {
            console.log('Directory already exists or created');
        }
        
        // Save the file
        await fs.writeFile(filePath, JSON.stringify(library, null, 2));
        console.log('Library saved successfully!');
        return { success: true };
    } catch (error) {
        console.error('Save error:', error);
        console.error('Attempted to save to:', getUserDataPath());
        return { success: false, error: error.message };
    }
});

ipcMain.handle('get-storage-info', async () => {
    try {
        const filePath = getUserDataPath();
        const stats = await fs.stat(filePath);
        const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
        return { totalSize: `${sizeInMB} MB` };
    } catch (error) {
        return { totalSize: '0 MB' };
    }
});

// App event handlers
app.whenReady().then(() => {
    console.log('App is ready!');
    console.log('User data will be stored at:', app.getPath('userData'));
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Set app name
app.setName('Book Thingy');