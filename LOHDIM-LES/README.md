# LOHDIM-LES

LOHDIM-LES is the local-scale high-resolution atmospheric dispersion model used by LHADDAS to compute building-resolving dispersion of airborne material using large-eddy simulation. Its output is used by SIBYL to compute the ground-level dose-rate distribution.

LOHDIM-LES is **not bundled with this repository**. Unlike SIBYL, it is not distributed as an open-source project; it is registered in JAEA's Program and Database retrieval System (PRODAS) and available upon request:

* **Request portal**: https://prodas.jaea.go.jp
* **Request contact**: [ccse-web@jaea.go.jp](mailto:ccse-web@jaea.go.jp)
* **License**: Not open source; terms are provided upon request.

## Setup

1. Request the LOHDIM-LES executable by emailing [ccse-web@jaea.go.jp](mailto:ccse-web@jaea.go.jp).
2. Place the executable and any required runtime files (e.g., shared libraries) into this directory, under `bin/`:

   ```
   LOHDIM-LES/
   └── bin/
       ├── <LOHDIM-LES executable>
       └── <required shared libraries>
   ```

3. In GUI-LHADDAS, point the LOHDIM-LES executable path (Settings tab) to the file placed under `bin/`. The path is configurable, so this location is a suggested default rather than a hard requirement.
