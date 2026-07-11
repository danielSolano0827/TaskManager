# Task Tracker

App de escritorio para gestionar tareas académicas con sistema de puntos, niveles y rangos (gamificación). Construida con **Tauri v2**, **React**, **TypeScript** y **SQLite**.

## Características

- Registro e inicio de sesión de usuarios (password hasheado con bcrypt).
- Creación de tareas por tipo (lectura, quiz, tarea, examen, proyecto, proyecto final), cada una con un puntaje base distinto.
- Al completar una tarea se ingresa una calificación (0-100) y se otorga un porcentaje de los puntos base según esa nota.
- Sistema de niveles y rangos calculado automáticamente según los puntos acumulados del usuario.
- Persistencia local en SQLite (no requiere servidor ni conexión a internet).

## Requisitos previos

- **Node.js** (v18 o superior) y npm.
- **Rust** (instalado vía [rustup](https://www.rust-lang.org/tools/install)).
- En Windows: **Visual Studio Build Tools** con el workload "Desktop development with C++".
- Revisa los prerequisitos oficiales de Tauri: https://tauri.app/start/prerequisites/

Verifica que Rust esté correctamente instalado:
```powershell
rustc --version
cargo --version
```

## Instalación

1. Clona el repositorio:
```powershell
git clone <url-del-repo>
cd task-tracker
```

2. Instala las dependencias:
```powershell
npm install
```

## Correr en modo desarrollo

```powershell
npm run tauri dev
```

La primera vez puede tardar varios minutos porque Rust compila todas las dependencias de Tauri desde cero. Las siguientes veces es mucho más rápido.

Cambios en el frontend (`.tsx`, `.ts`) se recargan solos (hot reload). Cambios en el backend Rust (`src-tauri/`) requieren detener el proceso (`Ctrl + C`) y volver a correr `npm run tauri dev`.

## Generar el instalador (build de producción)

```powershell
npm run tauri build
```

Esto genera un instalador (`.msi` / `.exe`) en:
```
src-tauri/target/release/bundle/
```

Al instalarlo, la app queda disponible como cualquier programa nativo de Windows (ícono, acceso directo, doble click para abrir).

## Base de datos

La app usa **SQLite** a través del plugin oficial `@tauri-apps/plugin-sql`. El archivo de base de datos (`tasks.db`) se crea automáticamente la primera vez que se ejecuta la app, en:
```
%APPDATA%\com.daniel.task-tracker\tasks.db
```

No requiere ningún servicio corriendo en background; es solo un archivo en disco.

### Inspeccionar la base de datos manualmente

Puedes usar [DB Browser for SQLite](https://sqlitebrowser.org/) para ver y editar los datos:

1. Abre DB Browser for SQLite.
2. **File → Open Database** → selecciona `tasks.db` en la ruta indicada arriba.
3. Pestaña **Browse Data** para ver las tablas y filas.

> ⚠️ Si tienes el archivo abierto en DB Browser mientras la app está corriendo, puede producirse un error de `database is locked` al intentar escribir desde la app. Cierra la base en DB Browser antes de usar la app.

### Esquema

- **`users`**: usuario, password hasheado, puntos, nivel, rango.
- **`task_types`**: catálogo de tipos de tarea con su puntaje base (lectura: 10, quiz: 20, tarea: 30, examen: 50, proyecto: 80, proyecto final: 150).
- **`tasks`**: tareas de cada usuario, asociadas a un tipo, con estado, calificación y puntos ganados.

Los puntos ganados por tarea se calculan como:
```
points_earned = base_points * (grade / 100)
```

El nivel se deriva de los puntos totales del usuario, y el rango del nivel alcanzado.

## Estructura del proyecto

```
task-tracker/
├── src/                  # Frontend (React + TypeScript)
│   ├── App.tsx           # Componente principal
│   ├── AuthForm.tsx      # Pantalla de login/registro
│   ├── auth.ts           # Lógica de autenticación (login, register)
│   ├── db.ts             # Conexión y setup de la base de datos SQLite
│   └── main.tsx
├── src-tauri/            # Backend (Rust + configuración de Tauri)
│   ├── src/main.rs
│   ├── capabilities/     # Permisos de Tauri (incluye permisos del plugin SQL)
│   └── tauri.conf.json
└── package.json
```

## Problemas comunes

| Problema | Solución |
|---|---|
| `rustc` no reconocido en una terminal | Cierra y vuelve a abrir la terminal/VS Code por completo tras instalar Rust |
| `sql.execute not allowed` / `sql.load not allowed` | Agregar los permisos del plugin SQL (`sql:default`, `sql:allow-execute`, `sql:allow-select`, `sql:allow-load`) en `src-tauri/capabilities/default.json` |
| `database is locked` | Cerrar DB Browser for SQLite si está abierto, o reiniciar `npm run tauri dev` |
| Cambios en Rust no se reflejan | El hot reload no aplica al backend; detener y volver a correr `npm run tauri dev` |
