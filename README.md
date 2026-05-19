# Husky Desktop Pet (Electron)

已按你的命名方式接入图片序列，不使用上传功能。

## 资源命名（放在 `asset/husky/`）
- `idle.png`
- `walk_01.png`
- `walk_02.png`
- `sleep.png`
- `eat.png`
- `click-reaction_01.png`

## 运行
```bash
npm install
npm start
```

## 功能
- 自动按以上文件名加载形象（缺失会在界面提示）
- 点击触发 click reaction
- 随机切换 idle / walk / sleep / eat，并同步动作文案
- 每分钟给出健康提醒（喝水 / 起身活动），文案随时间段变化
- 托盘图标 + 右键菜单：显示桌宠、隐藏桌宠、始终置顶、重置位置、退出
