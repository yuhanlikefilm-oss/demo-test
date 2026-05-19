# Husky Desktop Pet (Electron)

已按你的命名方式接入图片序列，不使用上传功能。

## 资源命名（放在 `asset/husky/`，也兼容 `assets/husky/`）
支持以下两种命名：
- 带序号：`idle_01.png`、`walk_01.png`、`sleep_01.png`、`eat_01.png`、`click-reaction_01.png`
- 单文件：`idle.png`、`walk.png`、`sleep.png`、`eat.png`、`click-reaction.png`

你截图里的命名（如 `idle_01.png`、`eat_04.png`、`click-reaction_03.png`）可直接识别。

## 运行
```bash
npm install
npm start
```

## 功能
- 自动按以上文件名加载形象（缺失会在界面提示）
- 点击触发 click reaction
- 随机切换 idle / walk / sleep / eat，并同步动作文案（频率已降低）
- 喝水/起身提醒每半小时一次，且文案随时间段变化
- 托盘图标 + 右键菜单：显示桌宠、隐藏桌宠、始终置顶、重置位置、退出
