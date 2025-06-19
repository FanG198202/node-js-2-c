#!/usr/bin/env qjs

// 移除 Node.js 特有的環境變量
// 替換 QuickJS 兼容的模塊
const std = require('std');
const os = require('os');

// 配置對像
const config = {
  verbose: false,
  silent: true,  // 默認靜默模式
  waitKey: false
};

/**
 * 顯示幫助信息
 */
function showHelp() {
    const appName = os.args[0].split('/').pop().replace('.js', '');
    
    std.out.printf(`
  使用方式: ${appName} [選項]
  
  選項:
    -v, --verbose   顯示詳細執行過程
    -s, --silent    靜默模式 (默認)
    -w, --wait      執行完畢後等待按鍵
    -h, --help      顯示此幫助信息
  
  示例:
    顯示詳細信息: ${appName} -v
    靜默執行:     ${appName} -s
    等待按鍵:     ${appName} -w
    `);
    std.exit(0);
}

/**
 * 解析命令行參數
 */
function parseArgs() {
  const args = os.args.slice(1);
  
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
          std.err.printf(`未知選項: ${arg}\n`);
          showHelp();
        }
    }
  }
}

/**
 * 輸出日誌
 * @param {string} message 要輸出的消息
 * @param {boolean} force 是否強制輸出（忽略靜默模式）
 */
function log(message, force = false) {
  if (!config.silent || force) {
    std.out.printf(`${message}\n`);
  }
}

/**
 * 獲取 PO Token
 * @returns {string} 從外部命令獲取的 PO Token
 */
function getPoToken() {
    try {
      log('正在獲取 PO Token...', true);
      
      // 使用 QuickJS 的系統命令
      const result = std.system('youtube-po-token-generator');
      const output = result.stdout.trim();
      log(`原始輸出: ${output}`, config.verbose);
  
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
        log(`錯誤詳細信息: ${error.stack}`, true);
      }
      std.exit(1);
    }
}

/**
 * 更新 yt-dlp 配置文件
 * @param {string} poToken 要寫入的 PO Token
 */
function updateYtdlpConfig(poToken) {
    const configDir = std.getenv('APPDATA') + '/yt-dlp';
    const configPath = configDir + '/config.txt';
    const extractorArgs = `--extractor-args "youtube:player-client=default,mweb;po_token=mweb.gvs+${poToken}"`;
  
    log(`配置文件路徑: ${configPath}`, config.verbose);
  
    if (!std.fs.stat(configDir)) {
      log('創建配置目錄...', config.verbose);
      std.fs.mkdir(configDir, { recursive: true });
    }
  
    let configContent = '';
    if (std.fs.stat(configPath)) {
      log('讀取現有配置文件...', config.verbose);
      configContent = std.loadFile(configPath, 'utf8');
    }
  
    log('更新配置文件內容...', config.verbose);
    configContent = configContent.replace(
      /--extractor-args "youtube:player-client=.+?"/g,
      ''
    ).trim();
  
    configContent += `\n${extractorArgs}\n`;
    
    std.saveFile(configPath, configContent.trim(), 'utf8');
    log('✅ 已更新 yt-dlp 配置文件', true);
}

/**
 * 等待用戶按鍵
 */
function waitForUserInput() {
  log('按任意鍵繼續...', true);
  std.in.getc();
}

// 主程序入口
(function main() {
  try {
    // 解析命令行參數
    parseArgs();
    
    log('開始更新 yt-dlp PO Token...', true);
    const poToken = getPoToken();
    updateYtdlpConfig(poToken);
    
    if (config.waitKey) {
      log('\n✅ 程序執行完畢，按任意鍵結束...', true);
      waitForUserInput();
    }
  } catch (error) {
    log(`\n❌ 發生錯誤: ${error.message}`, true);
    if (config.waitKey) {
      log('按任意鍵結束...', true);
      waitForUserInput();
    }
    std.exit(1);
  }
})();