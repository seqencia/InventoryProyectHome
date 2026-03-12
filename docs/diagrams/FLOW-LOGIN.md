# FLOW-LOGIN — Login and Role-Based Access

## Login flow

```mermaid
flowchart TD
    A([App start]) --> B{currentUser\nin React state?}
    B -- No --> C[Render LoginScreen]
    B -- Yes --> MAIN[Render main app]

    C --> D[User types username + password]
    D --> E[Click 'Iniciar Sesión']
    E --> F[renderer: window.electron.auth.login]
    F --> G[IPC: auth:login]

    G --> H[(Query users table\nWHERE username = ?)]
    H --> I{User found?}
    I -- No --> ERR1[throw 'Usuario o contraseña incorrectos']
    ERR1 --> C

    I -- Yes --> J[SHA-256 hash input password]
    J --> K{hash matches\npassword_hash?}
    K -- No --> ERR1
    K -- Yes --> L[Return id, name, username, role]

    L --> M[setCurrentUser in app.js]
    M --> MAIN

    MAIN --> N[Filter ALL_TABS by role]
    N --> O[Render filtered nav + active tab]
```

## Role-based tab access

```mermaid
flowchart LR
    subgraph ROLES
        A([Admin])
        V([Vendedor])
    end

    subgraph TABS
        T1[Dashboard]
        T2[Catálogo]
        T3[Entradas]
        T4[Proveedores]
        T5[Nueva Venta]
        T6[Historial]
        T7[Categorías]
        T8[Clientes]
        T9[Reportes]
        T10[Configuración]
    end

    A --> T1
    A --> T2
    A --> T3
    A --> T4
    A --> T5
    A --> T6
    A --> T7
    A --> T8
    A --> T9
    A --> T10

    V --> T1
    V --> T3
    V --> T5
    V --> T6
```

## Session lifecycle

```mermaid
stateDiagram-v2
    [*] --> LoggedOut : app start
    LoggedOut --> LoggedIn : auth:login success
    LoggedIn --> LoggedOut : user clicks Salir
    LoggedOut --> LoggedOut : auth:login failure (stays on LoginScreen)
    LoggedIn --> LoggedIn : user navigates tabs

    note right of LoggedOut : currentUser = null\nshows LoginScreen
    note right of LoggedIn : currentUser = { id, name, username, role }\ntabs filtered by role
```
