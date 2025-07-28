// main.js - Main process
const { app, BrowserWindow, Menu, dialog, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const { URL } = require('url');

let mainWindow;
const isDev = process.env.NODE_ENV !== 'production';

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
            nodeIntegration: false,
            webviewTag: true,
            webSecurity: true // Enable for production
        },
        icon: path.join(__dirname, 'icon.ico'), // Windows icon
        titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
        backgroundColor: '#0f172a'
    });

    mainWindow.loadFile('index.html');
    
    // Set Content Security Policy for production
    if (!isDev) {
        mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
            callback({
                responseHeaders: {
                    ...details.responseHeaders,
                    'Content-Security-Policy': ["default-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googleapis.com https://apis.google.com https://securetoken.googleapis.com https://identitytoolkit.googleapis.com https://firestore.googleapis.com https://accounts.google.com https://www.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https:; frame-src https://accounts.google.com;"]
                }
            });
        });
    }

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
                ...(isDev ? [{ label: 'Toggle DevTools', accelerator: 'F12', role: 'toggleDevTools' }] : []),
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
        return { books: [], wishlist: [], readingList: [], notebooks: {}, settings: { goal2025: null } };
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
    
    // Set app icon for Windows
    if (process.platform === 'win32') {
        app.setAppUserModelId('com.rovenset.bookthingy');
    }
    
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

// Google OAuth handler
ipcMain.handle('google-oauth', async () => {
    return new Promise((resolve, reject) => {
        const authWindow = new BrowserWindow({
            width: 500,
            height: 600,
            show: false,
            parent: mainWindow,
            modal: true,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true
            }
        });

        const clientId = '284502577988-your-client-id.apps.googleusercontent.com'; // You'll need to get this from Firebase console
        const redirectUri = 'https://book-thingy-app.firebaseapp.com/__/auth/handler';
        const scope = 'openid email profile';
        
        const authUrl = `https://accounts.google.com/oauth/authorize?` +
            `client_id=${clientId}&` +
            `redirect_uri=${encodeURIComponent(redirectUri)}&` +
            `response_type=code&` +
            `scope=${encodeURIComponent(scope)}&` +
            `access_type=offline`;

        authWindow.loadURL(authUrl);
        authWindow.show();

        authWindow.webContents.on('will-redirect', (event, navigationUrl) => {
            const parsedUrl = new URL(navigationUrl);
            
            if (parsedUrl.hostname === 'book-thingy-app.firebaseapp.com') {
                const urlParams = new URLSearchParams(parsedUrl.search);
                const code = urlParams.get('code');
                const error = urlParams.get('error');

                if (error) {
                    reject(new Error(error));
                } else if (code) {
                    resolve(code);
                }
                
                authWindow.close();
            }
        });

        authWindow.on('closed', () => {
            reject(new Error('Auth window was closed'));
        });
    });
});