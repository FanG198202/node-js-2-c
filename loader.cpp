#include <windows.h>
#include <fstream>

int main() {
    // 1. 從資源中提取JS
    HRSRC hRes = FindResource(NULL, MAKEINTRESOURCE(JS_FILE), "JS_RESOURCE_TYPE");
    HGLOBAL hData = LoadResource(NULL, hRes);
    LPVOID jsCode = LockResource(hData);
    DWORD jsSize = SizeofResource(NULL, hRes);

    // 2. 寫入臨時文件
    std::ofstream tmp("_tmp.js", std::ios::binary);
    tmp.write((char*)jsCode, jsSize);
    tmp.close();

    // 3. 調用JS引擎執行
    system("qjs _tmp.js");
    return 0;
}