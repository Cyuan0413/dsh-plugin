# 使用统计

在 DSH Web 的「统计」侧栏比较模型响应速度，查看各模型的 Token 用量、估算成本、工具调用与会话活动。已在 DSH Web `0.2.2-rc.5` 上验证。

## 安装

在 Web 的 **设置 → 插件** 中添加 `github:Xinglei-dev/dsh-plugin#path:/plugins/dsh-plugin-stats`，或使用命令：

```sh
dsh plugin --profile web add 'github:Xinglei-dev/dsh-plugin#path:/plugins/dsh-plugin-stats'
```

如果已装过其他来源的同名插件，先移除旧插件，再安装本版本。安装后刷新 Web 页面；只有插件管理器提示需要重启时才安排重启。通常无需更改统计目录，使用同一个 `web` profile 和数据目录即可继续查看已保留的记录。

## 怎么看模型速度

上方的「模型速度」按供应商和模型分组，可切换最近 1、12 或 24 小时。TTFT 从请求开始计到首个有效输出片段，生成耗时从首个计到最后一个有效输出片段。生成速度只纳入生成耗时严格超过 2 秒的请求；每列速度都用本列有效样本的总输出 Token 除以总耗时。端到端耗时包括首包等待和生成，不使用 2 秒门槛。旧的会话步骤记录不包含请求级计时，不进入这张表。

下方的用量、成本、图表和工具统计仍使用全部保留的会话步骤记录，不受模型速度时间窗影响。成本参考内置的 [models.dev](https://models.dev) 价格快照；没有匹配价格的模型显示为未知成本，仍统计 Token。

## 配置与数据

统计侧栏可以设置保留期限、文件大小、步骤采样间隔、步骤吞吐上限、是否记录会话 ID，以及模型的自定义价格。可在插件加载配置中通过 `dataDir` 指定存放目录；默认使用当前 profile 下的 `stats/`。请求级速度与会话步骤分别保留，记录不包含提示词或回复正文。

若能打开面板但看不到模型速度，先确认安装后已有模型请求、时间窗覆盖该请求，再通过面板的「刷新」按钮重查。速度没有有效样本时显示 `—`；这不表示请求数或输出 Token 为零。

## 来源

基于 Huakun Shen 的 [dsh-plugin-stats](https://github.com/HuakunShen/dsh-plugin-stats)，保留原 [MIT 许可](LICENSE)。维护本仓库版本见[开发说明](docs/development.md)。
