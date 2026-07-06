# Examples

Sample input/output data sets for trying the GUI-LHADDAS workflow without running your own LOHDIM-LES/SIBYL calculations.

Example data is **not bundled with this repository**. It is distributed as a single `examples.zip` archive on the [GitHub Releases](https://github.com/satoh-daiki/GUI-LHADDAS/releases) page, versioned alongside the application.

## Setup

1. Download `examples.zip` from the Releases page.
2. Extract it into this directory, so that the contents are located at:

   ```
   GUI-LHADDAS/
   └── examples/
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
