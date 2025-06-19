#!/usr/bin/env node
process.env.NODE_OPTIONS = '--max_old_space_size=4096';
process.env.NODE_ENCODING = 'utf8';
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 預設設定
const config = {
  verbose: false,
  silent: true,  // 預設為靜默模式
  waitKey: false
};

/**
 * 顯示幫助訊息
 */
function showHelp() {
    // 在 EXE 環境下，process.argv[0] 是 EXE 的路徑
    // 在 Node.js 環境下，process.argv[1] 是 JS 檔案的路徑
    const appName = process.pkg 
      ? path.basename(process.execPath, '.exe') 
      : path.basename(process.argv[0], '.exe');
    
    console.log(`
  使用方式: ${appName} [選項]
  
  選項:
    -v, --verbose   顯示詳細執行過程
    -s, --silent    靜默模式 (預設)
    -w, --wait      執行完畢後等待按鍵
    -h, --help      顯示此幫助訊息
  
  範例:
    顯示詳細資訊: ${appName} -v
    靜默執行:     ${appName} -s
    等待按鍵:     ${appName} -w
    `);
    process.exit(0);
}

/**
 * 解析命令列參數
 */
function parseArgs() {
  const args = process.argv.slice(2);
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '-v':
      case '--verbose':
        config.verbose = true;
        config.silent = false;
        break;
      case '-s':
      case '--silent':
        config.silent = true;
        config.verbose = false;
        break;
      case '-w':
      case '--wait':
        config.waitKey = true;
        break;
      case '-h':
      case '--help':
        showHelp();
        break;
      default:
        if (!config.silent) {
          console.error(`未知選項: ${arg}`);
          showHelp();
        }
    }
  }
}

/**
 * 輸出日誌
 * @param {string} message 要輸出的訊息
 * @param {boolean} force 是否強制輸出（忽略靜默模式）
 */
function log(message, force = false) {
  if (!config.silent || force) {
    console.log(message);
  }
}

/**
 * 建立設定檔的備份
 * @param {string} configPath - 要備份的設定檔路徑
 */
function createConfigBackup(configPath) {
  try {
    if (fs.existsSync(configPath)) {
      const dir = path.dirname(configPath);
      const ext = path.extname(configPath);
      const baseName = path.basename(configPath, ext);
      const backupPath = path.join(dir, `backup_${baseName}.txt`);
      
      fs.copyFileSync(configPath, backupPath);
      log(`✅ 已建立設定檔備份: ${backupPath}`, config.verbose);
    }
  } catch (error) {
    log(`❌ 建立設定檔備份時發生錯誤: ${error.message}`, true);
  }
}

/**
 * 從外部命令獲取 PO Token
 * @returns {string} 從 youtube-po-token-generator 獲取的 PO Token
 */
function getPoToken() {
    try {
      log('正在獲取 PO Token...', true);  // 強制顯示這個重要訊息
      
      // 使用 binary 模式讀取輸出
      const result = execSync('youtube-po-token-generator', { 
        encoding: 'binary'
      });
      
      // 將 binary 轉換為字串
      const output = result.toString('binary').trim();
      log(`原始輸出: ${output}`, config.verbose);  // 記錄原始輸出用於除錯
  
      // 解析 JSON 輸出
      const data = JSON.parse(output);
      
      if (!data || !data.poToken) {
        throw new Error('無效的 PO Token 格式');
      }
      
      log('✅ 成功獲取 PO Token', true);
      return data.poToken;
    } catch (error) {
      log(`❌ 獲取 PO Token 失敗: ${error.message}`, true);
      if (config.verbose) {
        log(`錯誤詳細資訊: ${error.stack}`, true);
      }
      process.exit(1);
    }
}

/**
 * 更新 yt-dlp 的設定檔，加入 PO Token 相關參數
 * @param {string} poToken - 要寫入設定檔的 PO Token
 */
function updateYtdlpConfig(poToken) {
    const configDir = path.join(process.env.APPDATA, 'yt-dlp');
    const configPath = path.join(configDir, 'config.txt');
    const extractorArgs = `--extractor-args "youtube:player-client=default,mweb;po_token=mweb.gvs+${poToken}"`;
  
    log(`設定檔路徑: ${configPath}`, config.verbose);
  
    if (!fs.existsSync(configDir)) {
      log('建立設定檔目錄...', config.verbose);
      fs.mkdirSync(configDir, { recursive: true });
    }
  
    // 建立設定檔備份
    createConfigBackup(configPath);
  
    let configContent = '';
    if (fs.existsSync(configPath)) {
      log('讀取現有設定檔...', config.verbose);
      // 使用 'binary' 編碼讀取檔案
      configContent = fs.readFileSync(configPath, { encoding: 'binary' });
    }
  
    log('更新設定檔內容...', config.verbose);
    configContent = configContent.replace(
      /--extractor-args "youtube:player-client=.+?"/g,
      ''
    ).trim();
  
    configContent += `\n${extractorArgs}\n`;
    
    // 使用 'binary' 編碼寫入檔案
    fs.writeFileSync(configPath, configContent.trim(), { encoding: 'binary' });
    log('✅ 已更新 yt-dlp 配置文件', true);
}
  

/**
 * 等待使用者按鍵
 */
function waitForUserInput() {
  return new Promise(resolve => {
    if (process.platform === 'win32') {
      const readline = require('readline');
      readline.emitKeypressEvents(process.stdin);
      if (process.stdin.isTTY) process.stdin.setRawMode(true);
      process.stdin.once('keypress', (str, key) => {
        if (key.ctrl && key.name === 'c') process.exit();
        resolve();
      });
    } else {
      process.stdin.setRawMode(true);
      process.stdin.resume();
      process.stdin.once('data', resolve);
    }
  });
}

// 主程式進入點
(async function main() {
  try {
    // 解析命令列參數
    parseArgs();
    
    log('開始更新 yt-dlp PO Token...', true);
    const poToken = getPoToken();
    updateYtdlpConfig(poToken);
    
    if (config.waitKey) {
      log('\n✅ 程式執行完畢，按任意鍵結束...', true);
      await waitForUserInput();
    }
  } catch (error) {
    log(`\n❌ 發生錯誤: ${error.message}`, true);
    if (config.waitKey) {
      log('按任意鍵結束...', true);
      await waitForUserInput();
    }
    process.exit(1);
  }
})();