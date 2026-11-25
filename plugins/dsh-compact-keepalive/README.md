# 手动压缩断线续跑

在 Web 会话发出 `/compact` 后，只要 Host 已经接收，刷新或关闭发起页面不会取消压缩。重开原会话即可看到原命令的结果，不必重新提交。

## 安装

适用于 DSH Web `0.2.2-rc.5`，无额外配置。安装到 `web` profile：

```sh
dsh plugin --profile web add \
  'github:Xinglei-dev/dsh-plugin#path:/plugins/dsh-compact-keepalive'
```

本地开发可在插件管理中添加本目录。安装后在插件管理中确认「手动压缩断线续跑」已启用；若管理器提示需要重启，请按提示安排重启。

## 行为边界

- 只作用于 Web 发出的、无参数及附件的内置 `/compact`，不改变自动压缩或模型工具。
- 仍受会话显式取消、Agent 销毁和 Host 停机约束。不自动重发，也不在 Host 重启后接续未完成的压缩。
- 连接丢失不证明 Host 接收了命令。重连后先查看原会话；如果已出现压缩记录，请等待该次操作结算。
- 可以停用或卸载插件还原原有行为。停用不打断已接手的压缩。若版本不匹配或插件加载报错，先停用插件，再确认 DSH 版本和插件管理中的错误详情。

插件在 [这个版本的命令执行入口](https://github.com/deepseek-ai/deepseek-harness/blob/dsh-v0.2.2-rc.5/packages/interaction/commands/src/index.ts#L360-L430) 更换已接收请求的取消信号；继续使用 DSH 的压缩锁、会话日志和渲染逻辑。
