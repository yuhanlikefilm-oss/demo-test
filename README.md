# Husky Desktop Pet (Electron)

已改为“全项目目录扫描 PNG”，避免 asset/assets 路径差异导致的不识别。

## 识别规则
- 从项目根目录开始递归扫描（最多 4 层）
- 自动识别前缀：`idle` / `walk` / `sleep` / `eat` / `click-reaction` / `click`
- 自动按数字后缀排序，如 `_01` `_02` ...

## 运行
```bash
npm install
npm start
```

## 若仍不显示
- 看画布中的调试信息：
  - `scanned png`（扫描到的 png 总数）
  - `idle/walk/sleep/eat/click` 各状态命中帧数
- 若 `scanned png` 为 0，说明应用启动目录不是当前项目目录。
