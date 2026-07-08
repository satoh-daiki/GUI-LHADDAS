/**
 * SIBYL形式 (KEY = VALUE ! comment) へ変換する
 * @param data キーと値を持つオブジェクト (値にコメントが含まれている場合は除去して使用します)
 * @returns SIBYL入力ファイル形式の文字列
 */
export const convertToSibylFormat = (data: Record<string, string>): string => {
  // 1. 定義配列: 出力順序、コメント、セクション、フォーマット情報を定義
  const formatDefinition = [
    // --- MANDATORY PARAMETERs ---
    { key: 'file',     comment: '', isFile: true, section: 'MANDATORY' }, // fileはコメントなし、値はクォート付き
    { key: 'irs',      comment: 'mesh resolution (m)', section: 'MANDATORY' },
    { key: 'ns_x_sta', comment: 'start point on x axis for SOURCE REGION', section: 'MANDATORY' },
    { key: 'ns_x_end', comment: 'end   point on x axis', section: 'MANDATORY' },
    { key: 'ns_y_sta', comment: 'start point on y axis', section: 'MANDATORY' },
    { key: 'ns_y_end', comment: 'end   point on y axis', section: 'MANDATORY' },
    { key: 'ns_z_sta', comment: 'start point on z axis', section: 'MANDATORY' },
    { key: 'ns_z_end', comment: 'end   point on z axis', section: 'MANDATORY' },
    { key: 'nt_x_sta',     comment: 'start point on x axis for TARGET REGION', section: 'MANDATORY' },
    { key: 'nt_x_end',     comment: 'end   point on x axis', section: 'MANDATORY' },
    { key: 'nt_y_sta',     comment: 'start point on y axis', section: 'MANDATORY' },
    { key: 'nt_y_end',     comment: 'end   point on y axis', section: 'MANDATORY' },   

    // --- OPTIONAL PARAMETERs ---
    { key: 'nsh_max',      comment: 'maximum mesh number of SHIELD alogn z axis', section: 'OPTIONAL' },
    { key: 'imode',        comment: 'Calculation mode: 0= Total, 1= Ground, 2= Plume, 3= Total w GUI', section: 'OPTIONAL' },
    { key: 'irestart',     comment: 'restart flag:  0= initial, 1= restart', section: 'OPTIONAL' },
    { key: 'irestart_out', comment: 'output for restart: 0= no, 1= yes', section: 'OPTIONAL' },
  ];

  // 2. ヘッダー情報の生成 (現在日時)
  const lines: string[] = [];
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const timeStr = now.toTimeString().split(' ')[0]; // HH:MM:SS

  lines.push('! ================================');
  lines.push('! SIBYL input file created by GUI ');
  lines.push('! --------------------------------');
  lines.push(`! < Date > ${dateStr}`);
  lines.push(`! < Time > ${timeStr}`);
  lines.push('! ================================');
  lines.push('!');

  let currentSection = '';

  formatDefinition.forEach(item => {
    // any型回避のため、元のコードに沿った形で値を取得（元コードの仕様に基づく）
    const rawValue = String((item as any).value !== undefined && (item as any).value !== null ? (item as any).value : "");
    const trimmedValue = rawValue.trim();

    if (item.section === 'OPTIONAL' && trimmedValue === "") {
      return; 
    }   

    if (item.section !== currentSection) {
      if (currentSection !== '') {
        lines.push('!'); // セクション間の空白行の代わりに確実に入れる
      }
      currentSection = item.section;
      lines.push(`! ##### ${item.section} PARAMETERs #####`);
    }

    let formattedValue = "";
    const VALUE_PADDING = 10; 

    if (item.isFile) {
      formattedValue = rawValue ? rawValue : "''";
    } else {
      formattedValue = rawValue.padStart(VALUE_PADDING, ' ');
    }

    const KEY_PADDING = 13;
    const paddedKey = item.key.padEnd(KEY_PADDING, ' ');
    const commentPart = item.comment ? `  ! ${item.comment}` : '';
    
    lines.push(`${paddedKey}= ${formattedValue}${commentPart}`);
  });

  // 配列を改行で結合（最後に1つだけ改行を入れる）
  return lines.join('\n') + '\n';
};

export const convertNestedJsonToSibyl = (data: SibylInputJson): string => {
  
  const prefix = data.doseRateType === 'airkerma' ? 'K' : 'H';

  // 2. マッピング定義: SIBYLキー、コメント、セクション、そして「データの取得元」を定義
  const formatDefinition = [
    // --- MANDATORY PARAMETERs ---
    { 
      key: 'file', 
      comment: '', 
      section: 'MANDATORY', 
      isFile: true,
      value: `'RESP_${prefix}_${data.nuclide}.bin'`
    },
    { 
      key: 'irs', 
      comment: 'mesh resolution (m)', 
      section: 'MANDATORY',
      value: data.cellSize 
    },
    { 
      key: 'ns_x_sta', 
      comment: 'start point on x axis for SOURCE REGION', 
      section: 'MANDATORY',
      value: data.source.xStart 
    },
    { key: 'ns_x_end', comment: 'end   point on x axis', section: 'MANDATORY', value: data.source.xEnd },
    { key: 'ns_y_sta', comment: 'start point on y axis', section: 'MANDATORY', value: data.source.yStart },
    { key: 'ns_y_end', comment: 'end   point on y axis', section: 'MANDATORY', value: data.source.yEnd },
    { key: 'ns_z_sta', comment: 'start point on z axis', section: 'MANDATORY', value: data.source.zStart },
    { key: 'ns_z_end', comment: 'end   point on z axis', section: 'MANDATORY', value: data.source.zEnd },

    { key: 'nt_x_sta', comment: 'start point on x axis for TARGET REGION', section: 'MANDATORY', value: data.target.xStart },
    { key: 'nt_x_end', comment: 'end   point on x axis', section: 'MANDATORY', value: data.target.xEnd },
    { key: 'nt_y_sta', comment: 'start point on y axis', section: 'MANDATORY', value: data.target.yStart },
    { key: 'nt_y_end', comment: 'end   point on y axis', section: 'MANDATORY', value: data.target.yEnd },

    // --- OPTIONAL PARAMETERs ---
    { 
      key: 'ctitle', 
      comment: 'title for this calc', 
      section: 'OPTIONAL', 
      value:data.title
    },
    {
      key: 'att',
      comment: 'gamma attenuation coefficient (cm2/g)',
      section: 'OPTIONAL',
      value: data.obstacle.gamma
    },
    {
      key: 'den',
      comment: 'effective density (g/cm3)',
      section: 'OPTIONAL',
      value: data.obstacle.effectiveDensity
    },
    { 
      key: 'nsh_max', 
      comment: 'maximum mesh number of SHIELD alogn z axis', 
      section: 'OPTIONAL',
      value: data.obstacle.zMaxCell 
    },
    { 
      key: 'imode', 
      comment: 'Calculation mode: 0= Total, 1= Ground, 2= Plume, 3= Total w GUI', 
      section: 'OPTIONAL',
      value: 3 
    },
    // 入力JSONに存在しない固定値やフラグが必要な場合は直接記述、またはJSON定義に追加してください
    { key: 'irestart', comment: 'restart flag:  0= initial, 1= restart', section: 'OPTIONAL', value: '0' },
    { key: 'irestart_out', comment: 'output for restart: 0= no, 1= yes', section: 'OPTIONAL', value: '0' },
    //{ key: 'doseRateType', comment: 'doseRateType ambient or airkerma', section: 'OPTIONAL', value: data.doseRateType },
    { 
      key: 'nc_x_sta', 
      comment: 'start point on x axis for Calc REGION', 
      section: 'OPTIONAL',
      value: data.calcArea.xStart 
    },
    { key: 'nc_x_end', comment: 'end   point on x axis', section: 'OPTIONAL', value: data.calcArea.xEnd },
    { key: 'nc_y_sta', comment: 'start point on y axis', section: 'OPTIONAL', value: data.calcArea.yStart },
    { key: 'nc_y_end', comment: 'end   point on y axis', section: 'OPTIONAL', value: data.calcArea.yEnd },
  ];

  //memo GUIに存在していて、input.dataには存在していない項目（これらを追加すると計算が流れない）

    //{ key: 'doseRateType', comment: 'doseRateType ambient or airkerma', section: 'OPTIONAL', value: data.doseRateType },
    //{ 
    //  key: 'nc_x_sta', 
    //  comment: 'start point on x axis for Calc REGION', 
    //  section: 'OPTIONAL',
    //  value: data.calcArea.xStart 
    //},
    //{ key: 'nc_x_end', comment: 'end   point on x axis', section: 'OPTIONAL', value: data.calcArea.xEnd },
    //{ key: 'nc_y_sta', comment: 'start point on y axis', section: 'OPTIONAL', value: data.calcArea.yStart },
    //{ key: 'nc_y_end', comment: 'end   point on y axis', section: 'OPTIONAL', value: data.calcArea.yEnd },
    //{ 
    //  key: 'title', 
    //  comment: 'title for this calc', 
    //  section: 'OPTIONAL', 
    //  value:data.title
    //}

  // 3. ヘッダー生成 (現在日時)
  const lines: string[] = [];
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toTimeString().split(' ')[0];

  lines.push('! ================================');
  lines.push('! SIBYL input file created by GUI ');
  lines.push('! --------------------------------');
  lines.push(`! < Date > ${dateStr}`);
  lines.push(`! < Time > ${timeStr}`);
  lines.push('! ================================');
  lines.push('!');

  let currentSection = '';

  formatDefinition.forEach(item => {
    const valueStr = String(item.value !== undefined && item.value !== null ? item.value : "");
    const trimmedValue = valueStr.trim();

    if (item.section === 'OPTIONAL' && trimmedValue === "") {
      return; 
    }   

    if (item.section !== currentSection) {
      if (currentSection !== '') {
        lines.push('!'); // セクション間の空白行の代わりに確実に入れる
      }
      currentSection = item.section;
      lines.push(`! ##### ${item.section} PARAMETERs #####`);
    }

    let formattedValue = valueStr;
    const VALUE_PADDING = 10; 

    if (item.isFile) {
      formattedValue = valueStr.includes("'") ? valueStr : `'${valueStr}'`;
    } else {
      formattedValue = valueStr.padStart(VALUE_PADDING, ' ');
    }

    const KEY_PADDING = 13;
    const paddedKey = item.key.padEnd(KEY_PADDING, ' ');
    const commentPart = item.comment ? `  ! ${item.comment}` : '';

    lines.push(`${paddedKey}= ${formattedValue}${commentPart}`);
  });

  return lines.join('\n') + '\n';

};
