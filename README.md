# Grimorio · Wiki cEDH

Wiki de cEDH en español: meta, primers de mazos, combos, política, glosario inglés/español, reglas e interacciones y entrenador de mulligan. Funciona en el celular y se puede instalar como app.

La sección **Mesa** (asistente de partida) es privada: no aparece en el menú. Se abre en `/#mesa` con la clave `APP_PASSWORD` y queda desbloqueada en ese dispositivo.

## Subirlo a Vercel

1. Crea un repo en GitHub (puede ser privado) y sube esta carpeta tal cual.
2. En vercel.com → **Add New → Project** → importa el repo. No hay que configurar build: es un sitio estático con una función en `api/`.
3. En **Settings → Environment Variables** agrega:
   - `ANTHROPIC_API_KEY`: tu clave de console.anthropic.com (la API se cobra aparte de tu plan de Claude).
   - `APP_PASSWORD`: una clave cualquiera, para que nadie más use tu API con el link.
   - `CLAUDE_MODEL` (opcional): por defecto `claude-sonnet-5-5`.
4. **Redeploy**. Abre la URL con `/#mesa` al final y escribe tu `APP_PASSWORD`. Sin `APP_PASSWORD` configurada, Mesa no se puede abrir en el sitio público.

Sin `ANTHROPIC_API_KEY` todo funciona igual salvo los botones de análisis con Claude.

## En el celular

- iPhone (Safari): Compartir → **Agregar a inicio**.
- Android (Chrome): menú → **Instalar app** o **Agregar a pantalla principal**.

## Actualizar

Reemplaza `index.html` por la versión nueva y haz push: Vercel redespliega solo.
