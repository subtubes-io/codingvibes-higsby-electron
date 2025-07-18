import { app, BrowserWindow, shell, ipcMain, protocol } from 'electron'
import { spawn, ChildProcess } from 'node:child_process'
import * as path from 'path'
import * as fs from 'node:fs'
import * as os from 'node:os'

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

// Server management
let serverProcess: ChildProcess | null = null
const SERVER_PORT = 8888

function startServer(): Promise<void> {
    return new Promise((resolve, reject) => {
        const serverPath = path.join(__dirname, '../example-server/dist/server.js')

        console.log('🚀 Starting Node.js server...')
        console.log('📁 Extensions will be stored in app data directory')

        serverProcess = spawn('node', [serverPath], {
            env: { ...process.env, PORT: SERVER_PORT.toString() },
            stdio: ['pipe', 'pipe', 'pipe']
        })

        // Handle server output
        serverProcess.stdout?.on('data', (data) => {
            console.log(`[Server]: ${data.toString().trim()}`)
        })

        serverProcess.stderr?.on('data', (data) => {
            console.error(`[Server Error]: ${data.toString().trim()}`)
        })

        // Handle server start
        serverProcess.on('spawn', () => {
            console.log('✅ Server process spawned successfully')
            // Give the server a moment to start up
            setTimeout(() => resolve(), 2000)
        })

        // Handle server errors
        serverProcess.on('error', (error) => {
            console.error('❌ Failed to start server:', error)
            reject(error)
        })

        // Handle server exit
        serverProcess.on('exit', (code, signal) => {
            console.log(`🔄 Server process exited with code ${code} and signal ${signal}`)
            serverProcess = null
        })
    })
}

function stopServer(): Promise<void> {
    return new Promise((resolve) => {
        if (!serverProcess) {
            resolve()
            return
        }

        console.log('🛑 Stopping Node.js server...')

        serverProcess.on('exit', () => {
            console.log('✅ Server stopped successfully')
            serverProcess = null
            resolve()
        })

        // Try graceful shutdown first
        serverProcess.kill('SIGTERM')

        // Force kill after timeout
        setTimeout(() => {
            if (serverProcess) {
                console.log('🔨 Force killing server process...')
                serverProcess.kill('SIGKILL')
                serverProcess = null
                resolve()
            }
        }, 5000)
    })
}

// Extension protocol registration
function registerExtensionProtocol() {
    // Get the cross-platform extensions directory
    function getExtensionsPath(): string {
        const appName = 'cdv-electron'

        switch (os.platform()) {
            case 'darwin': // macOS
                return path.join(os.homedir(), 'Library', 'Application Support', appName, 'extensions')
            case 'win32': // Windows
                return path.join(os.homedir(), 'AppData', 'Roaming', appName, 'extensions')
            case 'linux': // Linux
                return path.join(os.homedir(), '.config', appName, 'extensions')
            default:
                return path.join(os.homedir(), '.cdv-electron', 'extensions')
        }
    }

    protocol.registerFileProtocol('extension', (request, callback) => {
        try {
            // Parse the URL: extension://componentName/file.js
            const url = new URL(request.url)
            const componentName = url.hostname
            const filePath = url.pathname.substring(1) // Remove leading slash

            // Build the full path to the extension file
            const extensionsPath = getExtensionsPath()
            const fullPath = path.join(extensionsPath, componentName, filePath)

            console.log(`Extension protocol: Loading ${request.url} -> ${fullPath}`)

            // Check if file exists
            if (fs.existsSync(fullPath)) {
                callback({ path: fullPath })
            } else {
                console.error(`Extension file not found: ${fullPath}`)
                callback({ error: -6 }) // net::ERR_FILE_NOT_FOUND
            }
        } catch (error) {
            console.error('Extension protocol error:', error)
            callback({ error: -2 }) // net::ERR_FAILED
        }
    })

    console.log('✅ Extension protocol registered')
}

let win: BrowserWindow | null = null
const preload = path.join(__dirname, 'preload.js')
const url = VITE_DEV_SERVER_URL
const indexHtml = path.join(process.env.DIST, 'index.html')

async function createWindow() {
    win = new BrowserWindow({
        title: 'Higsby',
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

app.whenReady().then(async () => {
    try {
        // Register custom protocols first
        registerExtensionProtocol()

        // Start the server
        await startServer()

        // Then create the window
        await createWindow()
    } catch (error) {
        console.error('Failed to start application:', error)
        app.quit()
    }
})

app.on('window-all-closed', () => {
    win = null
    if (process.platform !== 'darwin') app.quit()
})

// Handle app shutdown
app.on('before-quit', async (event) => {
    if (serverProcess) {
        event.preventDefault()
        console.log('🔄 Shutting down server before quit...')

        try {
            await stopServer()
            app.quit()
        } catch (error) {
            console.error('Error stopping server:', error)
            app.quit()
        }
    }
})

// Handle force quit
app.on('will-quit', async (event) => {
    if (serverProcess) {
        event.preventDefault()
        await stopServer()
        process.exit(0)
    }
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

// IPC handlers for server status
ipcMain.handle('get-server-status', () => {
    return {
        running: serverProcess !== null,
        port: SERVER_PORT,
        url: `http://localhost:${SERVER_PORT}`
    }
})

ipcMain.handle('restart-server', async () => {
    try {
        await stopServer()
        await startServer()
        return { success: true }
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : String(error) }
    }
})

ipcMain.handle('get-extensions-path', async () => {
    try {
        const response = await fetch(`http://localhost:${SERVER_PORT}/api/extensions/path`)
        const data = await response.json()
        return data
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
        }
    }
})
