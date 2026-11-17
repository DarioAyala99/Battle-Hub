# Battle Hub: gestor de torneos de juegos de pelea

SPA (Single Page Application) para organizar **torneos locales de juegos de pelea** (Street Fighter, Tekken, Guilty Gear, Mortal Kombat, etc.).

**Problema que resuelve:** en la comunidad FGC local los torneos se organizan en grupos de WhatsApp, posteos en redes sociales o servidores de discord. Battle Hub junta todo en un solo lugar: el organizador publica el torneo, los jugadores se inscriben eligiendo su personaje principal (*main*) y, al terminar, el organizador carga las posiciones. Todo eso alimenta un dashboard de estadísticas.

---

## Funcionalidades

| Rol | Puede |
|---|---|
| **Visitante** | Ver torneos (filtrar por juego/estado), ver detalle, inscriptos y podio |
| **Jugador** (`jugador`) | Registrarse, inscribirse eligiendo su main, cancelar su inscripción mientras el torneo esté abierto y ver su historial y títulos |
| **Organizador** (`admin`) | ABM de **juegos**, ABM de **torneos**, gestión de **inscripciones** (posiciones, correcciones, bajas), cambio de estado del torneo, **dashboard** y **anuncio con IA** |

### Requisitos de la consigna

| Requisito | Dónde está |
|---|---|
| Vue 3 + Composition API | Todos los `.vue` usan `<script setup>` |
| Vue Router | `src/router/index.js` (lazy loading y guards por sesión/rol) |
| Pinia | `src/stores/` (`authStore` persistido, `juegosStore` compartido y `uiStore` con las notificaciones) |
| Autenticación y roles | Supabase Auth + tabla `profiles.rol` + RLS (`supabase/schema.sql`) |
| ABM (3) | Juegos, Torneos e Inscripciones contra la REST API de Supabase (PostgREST) |
| Dashboard (opcional) | `src/views/admin/DashboardView.vue` (Chart.js), solo admin |
| PWA | `vite-plugin-pwa` en `vite.config.js` (instalable y con caché offline de assets e imágenes) |
| IA (opcional) | Edge Function `supabase/functions/ai-anuncio` (Cohere) que redacta el anuncio del torneo |
| Tests (opcional) | `tests/` con Vitest (reglas de negocio, estadísticas y stores) |
| CI/CD | `.github/workflows/` (`ci.yml`, `deploy.yml` y `supabase-functions.yml`) |

---

## Arquitectura

```
Vista (views/)  ->  Composable (composables/)  ->  Service (services/)  ->  api.js (Axios)  ->  Supabase
      |                    |                                                              (REST + Auth + RLS)
  Componentes        Store Pinia (stores/)
 presentacionales    Reglas puras (utils/)  <- testeadas con Vitest
```

```
src/
├── components/     # Presentacionales: TorneoCard, formularios, modal, badges, ImagenSegura...
├── composables/    # Lógica con estado: useTorneos, useTorneoDetalle, useDashboard, useAnuncioIA...
├── config/         # Lectura de variables de entorno (fail fast)
├── router/         # Rutas + guard de autenticación/rol
├── services/       # Única capa que conoce las URLs de Supabase (api.js con refresh de token)
├── stores/         # Pinia: auth (persistido), juegos (compartido), ui (toasts)
├── utils/          # Reglas de negocio puras: cupos, validaciones, estadísticas, fechas
└── views/          # Pantallas (las de admin en views/admin/)
supabase/
├── schema.sql      # Tablas, trigger de perfiles, RLS, validación de inscripciones y datos de ejemplo
└── functions/ai-anuncio/   # Edge Function de IA
tests/              # Vitest
```

### Decisiones técnicas
- **La seguridad está en la base, no en el frontend.** Quien decide realmente qué puede hacer cada usuario es RLS: un jugador no puede crear juegos, inscribir a otro jugador ni ponerse una posición, aunque arme la request a mano.
- **Trigger `validar_inscripcion`:** controla que el torneo esté abierto, que haya cupo y que el main pertenezca al juego. Bloquea la fila del torneo (`FOR UPDATE`) para que dos inscripciones simultáneas no superen el cupo.
- **`gamertag` copiado en `inscripciones`:** permite mostrar la lista pública de inscriptos sin exponer la tabla `profiles`, que tiene emails.
- **Hash history (`/#/torneos`):** GitHub Pages no puede redirigir las rutas de una SPA. Con history normal, un F5 en `/torneos` devuelve 404.
- **IA en una Edge Function:** la API key del LLM nunca llega al navegador. Además, la función verifica que el usuario sea admin **antes** de llamar al LLM, y valida su respuesta.
- **Arte oficial por URL:** `juegos.logo_url` y `torneos.banner_url` se cargan desde el panel. Si una imagen no carga, `ImagenSegura.vue` muestra una de respaldo.

---

## Instalación paso a paso

### 1. Requisitos
- Node.js 20 o superior
- Una cuenta gratuita en [Supabase](https://supabase.com)

### 2. Clonar e instalar
```bash
git clone https://github.com/DarioAyala99/Battle-Hub.git
cd fgc-hub
npm install
```

### 3. Crear el proyecto en Supabase
1. En Supabase: **New project**.
2. Abrí **SQL Editor -> New query**, pegá el contenido de `supabase/schema.sql` y ejecutá **Run**.
3. Opcional, para desarrollo: en **Authentication -> Sign In / Providers -> Email**, desactivá **Confirm email** para poder entrar sin confirmar el correo.

### 4. Variables de entorno
```bash
cp .env.example .env
```
Completar `.env` con los datos de **Project Settings -> API**:
```env
VITE_SUPABASE_URL=xxxxxx
VITE_SUPABASE_ANON_KEY=xxxxxx
```

### 5. Levantar la app
```bash
npm run dev
```
Abrí http://localhost:5173.

### 6. Convertirte en organizador (admin)
1. Registrate desde la app.
2. En el SQL Editor de Supabase ejecutá:
   ```sql
   update public.profiles set rol = 'admin' where email = 'tu-email@ejemplo.com';
   ```
3. Recargá la página: aparecen **Dashboard**, **Gestionar torneos** y **Juegos**.

### 7. Cargar el arte oficial
En **Juegos -> Editar** pegá en *URL del logo / arte oficial* la URL de una imagen del sitio o press kit oficial del juego. En cada torneo podés cargar además un *banner* propio. Si un sitio bloquea el hotlinking, la imagen de respaldo aparece sola. En ese caso conviene subir la imagen a **Supabase Storage** (bucket público) y usar esa URL.

### 8. IA: Edge Function de anuncios
```bash
npm i -g supabase                       # o: npx supabase ...
supabase login
supabase link --project-ref <tu-project-ref>
supabase secrets set COHERE_API_KEY=<tu-api-key-de-cohere>
supabase functions deploy ai-anuncio
```
La API key de Cohere es gratuita para pruebas y se crea en https://dashboard.cohere.com. Una vez desplegada la función, en **Gestionar torneos** aparece el botón **✨ IA** de cada torneo.

---

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo con HMR |
| `npm test` | Corre los tests unitarios (Vitest) |
| `npm run test:watch` | Tests en modo watch |
| `npm run build` | Build de producción en `dist/` (con service worker de la PWA) |
| `npm run preview` | Sirve el build para probar la PWA localmente |

---

## Despliegue (CI/CD con GitHub Actions + GitHub Pages)

| Workflow | Cuándo corre | Qué hace |
|---|---|---|
| `ci.yml` | Cada push y pull request | `npm ci`, tests y build |
| `deploy.yml` | Push a `main` (o a mano) | Tests, build con los secrets y publicación en GitHub Pages |
| `supabase-functions.yml` | Push a `main` que cambie `supabase/functions/` | Despliega la Edge Function. Si faltan sus secrets, se saltea |

### Configuración (una sola vez)
1. Subí el repo a GitHub. La rama tiene que llamarse `main`.
2. **Settings -> Pages -> Build and deployment -> Source: GitHub Actions**.
3. **Settings -> Secrets and variables -> Actions -> New repository secret**, y cargá:

### Secrets de GitHub necesarios

| Secret | Obligatorio | Dónde se obtiene | Para qué |
|---|---|---|---|
| `VITE_SUPABASE_URL` | Sí | Supabase -> Project Settings -> API -> Project URL | URL base de la API. Se incrusta en el build |
| `VITE_SUPABASE_ANON_KEY` | Sí | Supabase -> Project Settings -> API -> `anon` `public` | Clave pública del proyecto. Es segura en el navegador porque los permisos los define RLS |
| `SUPABASE_ACCESS_TOKEN` | No (IA) | https://supabase.com/dashboard/account/tokens | Permite al workflow desplegar la Edge Function |
| `SUPABASE_PROJECT_REF` | No (IA) | Es el `xxxxxxxx` de `https://xxxxxxxx.supabase.co` | Indica a qué proyecto desplegar |

>**Nunca** cargar la `service_role key` ni la API key de Cohere como variable `VITE_*`: todo lo que empieza con `VITE_` termina publicado en el JavaScript del sitio. La key de Cohere va solo en los secrets de Supabase (`supabase secrets set`).

4. Hacé push a `main`. En la pestaña **Actions** se ve el progreso. La app queda en `https://darioayala99.github.io/Battle-Hub/`.
5. En Supabase, en **Authentication -> URL Configuration**, agregá esa URL como *Site URL*, para que los emails de confirmación redirijan bien.

`VITE_BASE` no es un secret: el workflow lo arma solo con el nombre del repo para que los assets carguen desde `/<repo>/`.

---

## Cómo probar los flujos principales

1. **Visitante:** entrá sin loguearte, filtrá torneos y abrí un detalle. El botón te pide iniciar sesión.
2. **Jugador:** registrate e inscribite a "Iron Fist Yatay" eligiendo un main. Probá inscribirte de nuevo (bloqueado) y cancelá la inscripción desde *Mis inscripciones*.
3. **Seguridad:** con el jugador, navegá a `/#/admin/juegos` y verás la pantalla 403.
4. **Organizador:** creá un juego, creá un torneo con cupo 2 y llenalo con dos cuentas. La tercera cuenta recibe "El torneo no tiene más cupo".
5. **Resultados:** pasá el torneo a *Finalizado* y cargá las posiciones en *Inscripciones*. Se ven el podio, el historial del jugador y el ranking del dashboard.
6. **PWA:** con `npm run build && npm run preview`, en Chrome aparece el ícono de instalar en la barra de direcciones.

---

## Aviso legal
Los nombres, logos y artes de los juegos son marcas registradas y propiedad de sus respectivos dueños. Se usan solo con fines ilustrativos en un proyecto educativo sin fines de lucro.
