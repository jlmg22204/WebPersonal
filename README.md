# Marvicatta9.net

Web personal de **José Luis Martínez Galindo**: desarrollo de sistemas informáticos, páginas web y aplicaciones a la medida.

## Estructura

| Archivo | Contenido |
|---|---|
| `index.html` | Estructura y contenido de la página |
| `styles.css` | Estilos (paleta basada en el logo) |
| `script.js` | Menú móvil, pestañas, animaciones y formulario |
| `logo.jpeg`, `favicon.svg` | Recursos gráficos |

## Ver en local

```bash
python -m http.server 5500
```

Luego abrir http://localhost:5500

## Publicar

Es un sitio estático (HTML, CSS y JS), compatible con GitHub Pages, Netlify o cualquier hosting.

## Formulario de contacto (Supabase)

Las solicitudes del formulario se guardan en el proyecto de Supabase `marvicatta9-web`,
tabla `solicitudes_contacto` (ver `supabase/migrations/`). La clave usada en `script.js`
es publicable: los visitantes solo pueden **insertar** solicitudes, nunca leerlas.
Para revisarlas, entre al panel de Supabase → Table Editor → `solicitudes_contacto`.
