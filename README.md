# RetornoCero 🎸

Plataforma de gestión de acordes para banda de covers.

## Stack

- **Backend:** FastAPI (Python) — puerto 8200
- **Frontend:** React 18 + Vite + TailwindCSS — puerto 8201
- **Base de datos:** SQLite
- **Despliegue:** Docker Compose

## URL de producción

[doc.australbyte.cl/retornocero/](https://doc.australbyte.cl/retornocero/)

## Funcionalidades

- 🎵 Lista de canciones con búsqueda y filtro por tono
- 🎼 Visualización de acordes estilo CifraClub (acordes sobre la sílaba)
- 🔀 Transposición de tono con botones +/-
- ⏩ Auto-scroll ajustable para ensayos
- 🌓 Modo claro / oscuro (persiste)
- 📥 Importación desde CifraClub y Ultimate Guitar
- 🔐 Login con JWT (admin y lectores)
- 📺 Link a YouTube por canción

## Usuarios por defecto

| Usuario | Contraseña | Rol |
|---------|-----------|-----|
| joyarzo | Jose1520  | Admin |
| alvaro  | alvaro123 | Lector |
| dany    | dany123   | Lector |
| lenys   | lenys123  | Lector |
| jody    | jody123   | Lector |

## Despliegue

```bash
cd /srv/apps/retornocero
docker compose up -d --build
```
