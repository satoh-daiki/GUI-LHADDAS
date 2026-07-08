/**
 * LOHDIM形式 (KEY=VALUE) から 元のリスト形式 (Value !comment) へ変換する
 * @param data parseIniFormatなどで得られた Record<string, string> オブジェクト
 * @returns 元のテキスト形式の文字列
 */
export const convertToOriginalFormat = (data: Record<string, string>): string => {
  const formatDefinition = [
    { key: 'BUILDING_DATA', comment: 'building data', isFile: true },
    { key: 'TERRAIN_DATA', comment: 'elevation data', isFile: true },
    { key: 'VERTICAL_MESH_DATA', comment: 'vertical grid', isFile: true },
    { key: 'EMISSION_RATE_DATA', comment: 'release rate [Bq/sec]', isFile: true },
    { key: 'CELLS_EAST_WEST', comment: 'mesh number for the streamwise direction' },
    { key: 'CELLS_NORTH_SOUTH', comment: 'mesh number for the sapnawise direction' },
    { key: 'CELLS_VERTICAL', comment: 'Mesh number for the vertical direction' },
    { key: 'SIBYL_MODEL', comment: '1:dose calculation by SIBYL' },
    { key: 'BLDG_TERRAIN_CALC', comment: '1:with building 0:without building' },
    { key: 'DISPERSION_CALC', comment: '1:calculate gas dispersion 0:calculate only flow' },
    { key: 'DRY_DEPOSITION_CALC', comment: '1:calculate dry deposition 0: no deposition' },
    { key: 'TURBULENCE_GENERATION', comment: '1:with random number 0:without random number' },
    // 座標は特殊処理
    { key: 'COORDINATES', comment: 'plume release position' }, 
    { key: 'CONTINUE_CALC', comment: '1:restart 0:initial start' },
    { key: 'CALC_START', comment: 'start time step' },
    { key: 'OUTPUT_START', comment: 'start time step for calculating statistics' },
    { key: 'DISPERSION_START', comment: 'start time step for calculating gas dispersion' },
    { key: 'CALC_END', comment: 'end time step' },
    { key: 'OUTPUT_INTERVAL', comment: 'averaging time [second]' },
    { key: 'STEP_INTERVAL', comment: 'time step interval' },
    { key: 'HORIZONTAL_RESOLUTION', comment: 'grid resolution for streamwise and spanwise directions' },
    { key: 'FRICTION_VELOCITY', comment: 'friction velocity' },
    { key: 'ROUGHNESS_LENGTH', comment: 'roughness length' },
    { key: 'AVG_WIND_DIRECTION', comment: 'mean wind direction (0:North,90:East,180:South,270:West wind)' },
    { key: 'DRY_DEPO_VELOCITY', comment: 'dry deposition velocity [m/s]' },
  ];

  const resultLines = formatDefinition.map(item => {
    let value = "";

    // 座標の特殊処理: X, Y, Z をカンマ区切りで結合
    if (item.key === 'COORDINATES') {
      value = `${data['EMISSION_COORD_X']},${data['EMISSION_COORD_Y']},${data['EMISSION_COORD_Z']}`;
    } else {
      value = data[item.key] || "";
    }

    // ファイル名の場合はシングルクォーテーションで囲む
    //if (item.isFile && value) {
    //  value = `'${value}'`;
    //}

    // 出力フォーマットを整える（タブやスペースで位置調整するとより忠実になります）
    return `${value} !${item.comment}`;
  });

  return resultLines.join('\n');
};
