# SIBYL

SIBYL is the dose evaluation code used by LHADDAS to compute ground-level gamma-ray dose rates from the atmospheric dispersion results produced by LOHDIM-LES.

SIBYL is **not bundled with this repository**. It is distributed separately as its own open-source project:

* **Repository**: https://github.com/satoh-daiki/SIBYL
* **License**: MIT License

## Setup

1. Obtain (or build) the SIBYL executable from the repository above, following its own build instructions.
2. Place the executable and any required runtime files (e.g., shared libraries, the `RESP` response-function data set) into this directory, under `bin/`:

   ```
   SIBYL/
   └── bin/
       ├── <SIBYL executable>
       ├── <required shared libraries>
       └── RESP/
   ```

3. In GUI-LHADDAS, point the SIBYL executable path (Settings tab) to the file placed under `bin/`. The path is configurable, so this location is a suggested default rather than a hard requirement.
