将你上传的哈士奇精灵图保存为：

- `assets/husky-sheet.png`

当前动画配置按以下切图规则：
- 每帧尺寸：`288 x 220`
- 总行数：5 行（idle / walk / sleep / eat / click）
- 各行帧数：`6 / 4 / 4 / 4 / 5`

如果你导出的尺寸不同，只要改 `renderer.js` 里的 `FRAME_W` / `FRAME_H` 和 `STATES` 即可。
