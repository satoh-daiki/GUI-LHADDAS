export const formatLohdimLesData = (data: FormData): string => {
    let content = '';
    
    content += `EMISSION_RATE_DATA = ${data.emissionRateData}\n`;
    content += `EMISSION_COORD_X = ${data.emissionPointCoord.coordX}\n`;
    content += `EMISSION_COORD_Y = ${data.emissionPointCoord.coordY}\n`;
    content += `EMISSION_COORD_Z = ${data.emissionPointCoord.coordZ}\n`;
  
    content += `HORIZONTAL_RESOLUTION = ${data.horizontalResolution}\n`;
    content += `CELLS_EAST_WEST = ${data.cellCount.cellsEastWest}\n`;
    content += `CELLS_NORTH_SOUTH = ${data.cellCount.cellsNorthSouth}\n`;
    content += `CELLS_VERTICAL = ${data.cellCount.cellsVertical}\n`;
    content += `VERTICAL_MESH_DATA = ${data.verticalMeshData}\n`;
  
    content += `CALC_START = ${data.calcStart}\n`;
    content += `OUTPUT_START = ${data.outputStart}\n`;
    content += `DISPERSION_START = ${data.dispersionStart}\n`;
    content += `CALC_END = ${data.calcEnd}\n`;
    content += `OUTPUT_INTERVAL = ${data.outputInterval}\n`;
    content += `STEP_INTERVAL = ${data.stepInterval}\n`;
  
    content += `BLDG_TERRAIN_CALC = ${data.bldgTerrainCalc}\n`;
    content += `BUILDING_DATA = ${data.buildingData}\n`;
    content += `TERRAIN_DATA = ${data.terrainData}\n`;
    
    content += `AVG_WIND_DIRECTION = ${data.averageWindDirection}\n`;
    content += `DISPERSION_CALC = ${data.dispersionCalc}\n`;
    content += `DRY_DEPOSITION_CALC = ${data.dryDepositionCalc}\n`;
    
    content += `DRY_DEPO_VELOCITY = ${data.dryDepoVelocity}\n`;
  
    content += `FRICTION_VELOCITY = ${data.frictionVelocity}\n`;
    content += `ROUGHNESS_LENGTH = ${data.roughnessLength}\n`;
    content += `TURBULENCE_GENERATION = ${data.turbulenceGeneration}\n`;
    
    content += `CONTINUE_CALC = ${data.continueCalc}\n`;
    content += `SIBYL_MODEL = ${data.sibylModel}\n`;
    
    return content;
  };

