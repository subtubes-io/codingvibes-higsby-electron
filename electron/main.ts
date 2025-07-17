import { app, BrowserWindow, shell, ipcMain } from 'electron'
import * as path from 'path'

// __dirname is available in CommonJS mode

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.js    > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.DIST_ELECTRON = __dirname
process.env.DIST = path.join(__dirname, '../dist')
process.env.VITE_PUBLIC = process.env.VITE_DEV_SERVER_URL
    ? path.join(__dirname, '../public')
    : process.env.DIST

// Disable GPU Acceleration for Windows 7
if (process.platform === 'win32') app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
    app.quit()
    process.exit(0)
}

// Environment variables
const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL || (process.env.IS_DEV ? 'http://localhost:5174' : null)

let win: BrowserWindow | null = null
const preload = path.join(__dirname, 'preload.js')
const url = VITE_DEV_SERVER_URL
const indexHtml = path.join(process.env.DIST, 'index.html')

async function createWindow() {
    win = new BrowserWindow({
        title: 'CDV Electron',
        icon: process.env.VITE_PUBLIC ? path.join(process.env.VITE_PUBLIC, 'favicon.ico') : undefined,
        webPreferences: {
            preload,
            nodeIntegration: false,
            contextIsolation: true,
        },
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
    })

    if (VITE_DEV_SERVER_URL) { // electron-vite-vue#298
        win.loadURL(VITE_DEV_SERVER_URL)
        // Open devTool if the app is not packaged
        win.webContents.openDevTools()
    } else {
        win.loadFile(indexHtml)
    }

    // Test actively push message to the Electron-Renderer
    win.webContents.on('did-finish-load', () => {
        win?.webContents.send('main-process-message', new Date().toLocaleString())
    })

    // Make all links open with the browser, not with the application
    win.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith('https:')) shell.openExternal(url)
        return { action: 'deny' }
    })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
    win = null
    if (process.platform !== 'darwin') app.quit()
})

app.on('second-instance', () => {
    if (win) {
        // Focus on the main window if the user tried to open another
        if (win.isMinimized()) win.restore()
        win.focus()
    }
})

app.on('activate', () => {
    const allWindows = BrowserWindow.getAllWindows()
    if (allWindows.length) {
        allWindows[0].focus()
    } else {
        createWindow()
    }
})

// New window example arg: new windows url
ipcMain.handle('open-win', (_, arg) => {
    const childWindow = new BrowserWindow({
        webPreferences: {
            preload,
            nodeIntegration: true,
            contextIsolation: false,
        },
    })

    if (VITE_DEV_SERVER_URL) {
        childWindow.loadURL(`${VITE_DEV_SERVER_URL}#${arg}`)
    } else {
        childWindow.loadFile(indexHtml, { hash: arg })
    }
})
