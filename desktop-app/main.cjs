const { app, BrowserWindow, Menu, dialog, net, protocol, shell } = require('electron');
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const DEV_URL = (process.env.ELECTRON_START_URL || '').trim();
const SMOKE = process.env.ELECTRON_SMOKE === '1';

app.setName('Fuerza y Acondicionamiento Entidades');

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'app',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
      stream: true,
    },
  },
]);

function frontendRoot() {
  if (app.isPackaged) return path.join(process.resourcesPath, 'frontend');
  return path.join(__dirname, 'frontend');
}

function resolveIcon() {
  const packaged = path.join(process.resourcesPath, 'frontend', 'FAP-circle.png');
  const dev = path.join(__dirname, '..', 'public', 'FAP-circle.png');
  if (app.isPackaged && fs.existsSync(packaged)) return packaged;
  if (fs.existsSync(dev)) return dev;
  return undefined;
}

function resolveFrontendFile(requestUrl) {
  const root = path.resolve(frontendRoot());
  const url = new URL(requestUrl);
  let pathname = decodeURIComponent(url.pathname);
  if (pathname.endsWith('/')) pathname += 'index.html';
  const rel = pathname.replace(/^[/\\]+/, '');
  const filePath = path.resolve(root, rel);
  const rootWithSep = root.endsWith(path.sep) ? root : `${root}${path.sep}`;
  if (filePath !== root && !filePath.startsWith(rootWithSep)) {
    return path.join(root, 'index.html');
  }
  return filePath;
}

function isAllowedNavigation(target) {
  if (DEV_URL) {
    try {
      return new URL(target).origin === new URL(DEV_URL).origin;
    } catch {
      return false;
    }
  }
  return target.startsWith('app://');
}

function buildMenu() {
  const viewSubmenu = [
    { role: 'reload', label: 'Recargar' },
    { role: 'forceReload', label: 'Forzar recarga' },
    { type: 'separator' },
    { role: 'resetZoom', label: 'Tamaño real' },
    { role: 'zoomIn', label: 'Aumentar' },
    { role: 'zoomOut', label: 'Reducir' },
    { type: 'separator' },
    { role: 'togglefullscreen', label: 'Pantalla completa' },
  ];
  if (!app.isPackaged) {
    viewSubmenu.push(
      { type: 'separator' },
      { role: 'toggleDevTools', label: 'Herramientas de desarrollo' },
    );
  }

  const template = [
    { label: 'Archivo', submenu: [{ role: 'quit', label: 'Salir' }] },
    { label: 'Ver', submenu: viewSubmenu },
    {
      label: 'Ventana',
      submenu: [
        { role: 'minimize', label: 'Minimizar' },
        { role: 'close', label: 'Cerrar' },
      ],
    },
  ];

  if (process.platform === 'darwin') {
    template.unshift({
      label: app.name,
      submenu: [
        { role: 'about', label: 'Acerca de' },
        { type: 'separator' },
        { role: 'hide', label: 'Ocultar' },
        { role: 'hideOthers', label: 'Ocultar otras' },
        { role: 'unhide', label: 'Mostrar todas' },
        { type: 'separator' },
        { role: 'quit', label: 'Salir' },
      ],
    });
  }

  return Menu.buildFromTemplate(template);
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 960,
    minHeight: 640,
    title: 'Fuerza y Acondicionamiento Entidades',
    backgroundColor: '#070b12',
    show: false,
    autoHideMenuBar: true,
    icon: resolveIcon(),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      // El build empaquetado vive en app://. El API sigue en PUBLIC_API_URL
      // (otro origen) y el backend no lista ese scheme en CORS. En dev se
      // abre el Astro de :4322, con el mismo origen que el navegador.
      webSecurity: Boolean(DEV_URL),
    },
  });

  win.once('ready-to-show', () => {
    if (!SMOKE) win.show();
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/i.test(url) || url.startsWith('mailto:')) shell.openExternal(url);
    return { action: 'deny' };
  });

  win.webContents.on('will-navigate', (event, url) => {
    if (isAllowedNavigation(url)) return;
    event.preventDefault();
    if (/^https?:/i.test(url)) shell.openExternal(url);
  });

  if (SMOKE) {
    win.webContents.on('console-message', (event) => {
      if (event.message) console.log('PAGE', event.message);
    });
    win.webContents.on('did-fail-load', (_event, code, description, url, isMainFrame) => {
      if (!isMainFrame) return;
      console.error('did-fail-load', code, description, url);
      app.exit(1);
    });
    win.webContents.once('did-finish-load', async () => {
      try {
        const report = await win.webContents.executeJavaScript(`
          new Promise((resolve) => {
            setTimeout(() => {
              const island = document.querySelector('astro-island');
              const hydrated = Boolean(island) && !island.hasAttribute('ssr');
              resolve([document.title, document.querySelector('form') ? 'form' : 'noform', hydrated ? 'hydrated' : 'ssr'].join('|'));
            }, 800);
          })
        `);
        console.log('SMOKE', report);
        const [title, form, hydrated] = String(report).split('|');
        app.exit(title.includes('Fuerza') && form === 'form' && hydrated === 'hydrated' ? 0 : 1);
      } catch (error) {
        console.error(error);
        app.exit(1);
      }
    });
  }

  if (DEV_URL) win.loadURL(DEV_URL);
  else win.loadURL('app://localhost/');

  return win;
}

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => {
    const win = BrowserWindow.getAllWindows()[0];
    if (!win) return;
    if (win.isMinimized()) win.restore();
    win.focus();
  });

  app.whenReady().then(() => {
    if (!DEV_URL) {
      const indexFile = path.join(frontendRoot(), 'index.html');
      if (!fs.existsSync(indexFile)) {
        dialog.showErrorBox(
          'Falta el front',
          'No está el build local. En desktop-app corré: npm run sync',
        );
        app.exit(1);
        return;
      }

      protocol.handle('app', (request) => {
        try {
          let filePath = resolveFrontendFile(request.url);
          if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
            const accept = request.headers.get('Accept') || '';
            if (accept.includes('text/html')) filePath = path.join(frontendRoot(), 'index.html');
            else return new Response('Not found', { status: 404 });
          }
          return net.fetch(pathToFileURL(filePath).toString());
        } catch (error) {
          console.error(error);
          return new Response('Error', { status: 500 });
        }
      });
    }

    Menu.setApplicationMenu(buildMenu());
    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });
}
