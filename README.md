# Husky Desktop Pet (Electron)

如果你放了图片仍不显示，最新版本会在 **preload 层用文件系统直接扫描**，而不是只靠前端路径猜测。

## 支持目录
- `asset/`
- `assets/`
- `asset/husky/`
- `assets/husky/`

## 支持命名
- `idle_01.png` ~ `idle_12.png`（或 `idle.png`）
- `walk_01.png` ~ `walk_12.png`（或 `walk.png`）
- `sleep_01.png` ~ `sleep_12.png`（或 `sleep.png`）
- `eat_01.png` ~ `eat_12.png`（或 `eat.png`）
- `click-reaction_01.png` ~ `click-reaction_12.png`（或 `click-reaction.png`）

## 运行
```bash
npm install
npm start
```

> 复制新素材后建议重启一次应用，确保重新扫描文件。
