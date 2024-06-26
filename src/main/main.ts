/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import { Worker } from "worker_threads";
import { getPixels, savePixels } from 'ndarray-pixels'
import ndarray from 'ndarray'

let workerPath = ""
if (process.env.NODE_ENV === 'production') {
  workerPath = path.join(__dirname, '../../../../src/workers/caustic_design_worker.ts');
} else if (process.env.NODE_ENV === 'development') {
  workerPath = path.join(__dirname, '../workers/caustic_design_worker.ts');
}

const worker = new Worker(workerPath);

/*worker.onmessage = function(event) {
  console.log(event.data)
};*/

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

// Listen for messages from the worker
/*worker.on('message', message => {
  console.log('Received message from worker:', message);
  // Handle the message as needed
});*/

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 992,
    height: 774,
    icon: getAssetPath('icon.png'),
    resizable: false,
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  mainWindow.setMenu(null)

  worker.on('message', message => {
      mainWindow.webContents.send('asynchronous-message', message);
  });

  ipcMain.on('asynchronous-message', async (event, arg) => {
      if (arg.type === 'loadImage') {
        const imageBuffer = Buffer.from(arg.data.replace(/^data:image\/\w+;base64,/, ''), 'base64');

        const pixels = await getPixels(imageBuffer, 'image/png'); // Uint8Array -> ndarray

        let pixel_intensities_1d = [];
        const [width, height] = pixels.shape;
        for (let x = 0; x < width; ++x) {
            for (let y = 0; y < height; ++y) {
                let red = pixels.get(x, y, 0);
                let green = pixels.get(x, y, 1);
                let blue = pixels.get(x, y, 2);
                pixel_intensities_1d.push(((0.299 * red) + (0.587 * green) + (0.114 * blue)) / 255);
            }
        }

        worker.postMessage({type: 'loadImage', data: {imageBuffer: arg.data, ImageData: pixel_intensities_1d, width: width, height: height}})
      } else {
        worker.postMessage(arg);
      }
  })

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
