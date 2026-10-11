# Examples

Sample input/output data sets for trying the GUI-LHADDAS workflow without running your own LOHDIM-LES/SIBYL calculations.

Example data is **not bundled with this repository**. It is distributed as a single `examples.zip` archive on the [GitHub Releases](https://github.com/satoh-daiki/GUI-LHADDAS/releases) page, versioned alongside the application.

## Cases

| Case | Grid (x × y × z cells) | Output times | Description |
|---|---|---|---|
| `Simple` | 100 × 100 × 68 | 2 | Small case for a quick check of the workflow |
| `OklahomaCity` | 280 × 280 × 70 | 5 | Central business district of Oklahoma City; the illustrative example in the SoftwareX paper |
| `Kasumigaseki` | 300 × 300 × 106 | 5 | Kasumigaseki district of Tokyo; the largest case |

## Contents of each case

Each case contains all the files of a complete LOHDIM-LES → SIBYL run: the input files, the intermediate files passed from LOHDIM-LES to SIBYL, and the output files of both codes. All visualization functions of GUI-LHADDAS can therefore be tried without the LOHDIM-LES and SIBYL executables. `NNN` denotes the output-time index (`000`, `001`, ...).

| Files | Written by | Read by | Content |
|---|---|---|---|
| `LOHDIM-LES_input.data` | GUI-LHADDAS | LOHDIM-LES | Calculation parameters of LOHDIM-LES |
| Building data (`building.txt`, `oklahomacity.txt`, or `Kasumigaseki.txt`), `terrain.txt`, `zgrid.txt`, `release.txt` | (prepared by the user) | LOHDIM-LES | Building geometry, terrain elevation, vertical grid, and release rate |
| `SourceLocation.txt` | GUI-LHADDAS | GUI-LHADDAS | Latitude and longitude of the release point, used to place the grid on the map |
| `SIBYL_input.data` | GUI-LHADDAS | SIBYL | Calculation parameters of SIBYL |
| `Z.data`, `SHIELD.data`, `ELEVATION.data` | LOHDIM-LES | SIBYL | Vertical grid, building and terrain geometry |
| `SIBYL_PLUME_NNN.data`, `SIBYL_GROUND_NNN.data` | LOHDIM-LES | SIBYL | Time-averaged air concentration and surface deposition |
| `GUI_PLUME_NNN.data`, `GUI_GROUND_NNN.data` | LOHDIM-LES | GUI-LHADDAS | Air concentration and surface deposition for display (cells inside buildings are masked) |
| `GUI_DOSE_NNN.data` | SIBYL | GUI-LHADDAS | Dose rate for display |
| `SIBYL_RESULT_NNN.out` | SIBYL | (user) | Dose-rate results in the SIBYL output format |

See the user manual for the details of the file formats.

## Setup

1. Download `examples.zip` from the Releases page.
2. Extract it into this directory, so that the contents are located at:

   ```
   GUI-LHADDAS/
   └── examples/
       ├── Kasumigaseki/
       │   ├── LOHDIM-LES_input.data
       │   ├── SourceLocation.txt
       │   └── ...
       ├── OklahomaCity/
       │   ├── LOHDIM-LES_input.data
       │   ├── SourceLocation.txt
       │   └── ...
       └── Simple/
           ├── LOHDIM-LES_input.data
           ├── SourceLocation.txt
           └── ...
   ```

3. In GUI-LHADDAS, set the LOHDIM-LES and SIBYL I/O folder paths (Settings tab) to the example directory you want to use (e.g., `examples/OklahomaCity`). See the user manual's Getting Started chapter for the full walkthrough.

To run the calculations again, the LOHDIM-LES and SIBYL executables are required; see [`../LOHDIM-LES/README.md`](../LOHDIM-LES/README.md) and [`../SIBYL/README.md`](../SIBYL/README.md).
