# Husky Desktop Pet (Electron)

这版改成在 preload 里直接读取目录并按文件名前缀分类，不再依赖前端猜测路径。

## 支持目录
- `asset/`
- `assets/`
- `asset/husky/`
- `assets/husky/`

## 支持命名前缀
- `idle_01.png ...` 或 `idle.png`
- `walk_01.png ...` 或 `walk.png`
- `sleep_01.png ...` 或 `sleep.png`
- `eat_01.png ...` 或 `eat.png`
- `click-reaction_01.png ...` 或 `click-reaction.png`

## 运行
```bash
npm install
npm start
```

如果仍不显示：
1. 先重启应用。
2. 看窗口里的调试行（会显示扫描到的帧数量与扫描目录）。
3. 确保是 `.png` 后缀，且前缀拼写一致（如 `click-reaction`）。
