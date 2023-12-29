import { app, shell, BrowserWindow } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { autoUpdater } from 'electron-updater'
import icon from '../../resources/icon.png?asset'

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
    autoUpdater.checkForUpdatesAndNotify()
  }

  autoUpdater.setFeedURL({
    provider: 'github',
    owner: 'jimweldev',
    repo: 'jimweldev/autoupdate',
    token: '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'
  })

  // AutoUpdater Configuration
  autoUpdater.autoDownload = false // Do not automatically download updates
  autoUpdater.checkForUpdates() // Check for updates on app start

  // SEND THE MESSAGE TO REACT JS
  mainWindow.webContents.on('did-finish-load', () => {
    const appVersion = app.getVersion()
    mainWindow.webContents.send('updateMessage', {
      message: 'hello from Electron',
      version: appVersion
    })
  })

  autoUpdater.on('update-available', () => {
    // Handle update available
    mainWindow.webContents.send('updateMessage', {
      message: 'Update available. Downloading...',
      version: app.getVersion()
    })
  })

  autoUpdater.on('update-not-available', () => {
    // Handle no update available
    mainWindow.webContents.send('updateMessage', {
      message: 'No update available.',
      version: app.getVersion()
    })
  })

  autoUpdater.on('update-downloaded', () => {
    // Handle update downloaded
    autoUpdater.quitAndInstall()
  })

  autoUpdater.on('error', (error) => {
    // Handle update error
    mainWindow.webContents.send('updateMessage', {
      message: `Update error: ${error.message}`,
      version: app.getVersion()
    })
  })
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // mainWindow.webContents.send('updateMessage', {
  //   message: 'updated',
  //   version: appVersion
  // })

  // autoUpdater.on('update-available', () => {
  //   mainWindow.webContents.send('updateMessage', {
  //     message: 'Update available. Downloading...',
  //     version: app.getVersion()
  //   })
  // })

  // autoUpdater.on('update-not-available', () => {
  //   mainWindow.webContents.send('updateMessage', {
  //     message: 'No update available.',
  //     version: app.getVersion()
  //   })
  // })

  // autoUpdater.on('download-progress', (progressObj) => {
  //   const message = `Download speed: ${progressObj.bytesPerSecond} - Downloaded ${progressObj.percent}% (${progressObj.transferred}/${progressObj.total})`
  //   mainWindow.webContents.send('updateMessage', {
  //     message,
  //     version: app.getVersion()
  //   })
  // })

  // autoUpdater.on('update-downloaded', () => {
  //   mainWindow.webContents.send('updateMessage', {
  //     message: 'Update downloaded. Restarting...',
  //     version: app.getVersion()
  //   })

  //   // Automatically restart the app to apply the update
  //   autoUpdater.quitAndInstall()
  // })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})