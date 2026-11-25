# 开发使用统计插件

在本插件目录运行命令；本仓库根不需要工作区依赖。

```sh
pnpm install --frozen-lockfile --ignore-scripts
pnpm typecheck
pnpm test
pnpm build
pnpm test:bundle
```

`src/` 是源代码，`lib/` 是随插件提交的 Host、Web 和维护 CLI 产物。变更源码后重建并提交产物，使 GitHub 子路径安装不必执行构建脚本。测试使用离线数据，不读取实际 profile 的统计记录。需要更新内置模型价格时，单独运行 `pnpm update-pricing`，再重建。

维护 CLI 的 `dsh-stats export` 导出步骤样本。`dsh-stats recompute` 会改写既有步骤采样，应在停用记录器后使用 `--dry-run` 先检查结果。
