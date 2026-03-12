# ARCHITECTURE — System Architecture Diagram

## Three-layer Electron architecture

```mermaid
graph TB
    subgraph RENDERER["Renderer Process — src/renderer/"]
        direction TB
        IDX[index.js\nReact root]
        APP[app.js\nAuth state · Tab nav · Role filtering]
        LOGIN[LoginScreen.js]
        VIEWS[View Components\nDashboardView · InventoryView · NewSale\nSaleHistory · StockEntriesView · ReportsView\nConfigView · UsersView · ...]
        IDX --> APP
        APP --> LOGIN
        APP --> VIEWS
    end

    subgraph PRELOAD["Preload — src/main/preload.js"]
        BRIDGE["contextBridge.exposeInMainWorld('electron', {\n  auth, users, products, categories,\n  customers, suppliers, stockEntries,\n  sales, returns, dashboard, reports, backup\n})"]
    end

    subgraph MAIN["Main Process — src/main/main.js"]
        direction TB
        ELECTRON[Electron lifecycle\napp · BrowserWindow · dialog]
        SCHEMAS[EntitySchemas\nUser · Product · Category · Customer\nSupplier · StockEntry · Sale · SaleDetail\nReturn · ReturnDetail · BonificacionPriceLog]
        DS[(TypeORM DataSource\nSQLite · synchronize:true)]
        IPC[IPC Handlers\nipcMain.handle × 35+]
        SEED[seedDefaultAdmin\nadmin/admin on first run]
        BACKUP[Backup helpers\nauto-backup · export · import · restore]
        ELECTRON --> DS
        DS --> SCHEMAS
        DS --> SEED
        DS --> IPC
        ELECTRON --> BACKUP
    end

    subgraph STORAGE["Persistent Storage"]
        DB[(database.sqlite\napp.getPath userData)]
        CFG[config.json\nautoBackup flag]
        BKPS[backups/\ndaily .sqlite copies]
    end

    RENDERER -- "window.electron.*\nipcRenderer.invoke" --> PRELOAD
    PRELOAD -- "ipcMain.handle\nresponse" --> RENDERER
    PRELOAD <--> MAIN
    MAIN <--> STORAGE
```

## IPC call lifecycle

```mermaid
sequenceDiagram
    participant R as Renderer Component
    participant P as Preload (contextBridge)
    participant M as Main Process (ipcMain)
    participant DB as SQLite (TypeORM)

    R->>P: window.electron.auth.login({ username, password })
    P->>M: ipcRenderer.invoke('auth:login', credentials)
    M->>DB: repo('User').findOneBy({ username })
    DB-->>M: user row (or null)
    M->>M: hashPassword(password) === user.password_hash
    M-->>P: { id, name, username, role }
    P-->>R: Promise resolves with user object
    R->>R: setCurrentUser(user)
```

## Startup sequence

```mermaid
sequenceDiagram
    participant E as Electron
    participant DB as TypeORM / SQLite
    participant B as Backup
    participant IPC as IPC Handlers
    participant W as BrowserWindow

    E->>DB: initDatabase() — open + synchronize schema
    DB-->>E: DataSource ready
    E->>DB: seedDefaultAdmin() — insert admin if users table empty
    E->>B: runAutoBackup() — copy DB if autoBackup=true and no file today
    E->>IPC: setupIpcHandlers() — register all ipcMain.handle listeners
    E->>W: createWindow() — load index.html
    W->>W: React renders LoginScreen (currentUser = null)
```
