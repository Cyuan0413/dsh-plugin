# Work 连接器

从 ChatGPT Work 派发任务到已有 DSH Workspace，回到原 Work 对话接收结果。每次派发创建普通 DSH 会话。Work 续办会复用原会话但返回新的任务 ID；在 DSH 面板中也能打开同一会话。完整历史留在本机，回报只带状态、关联 ID 和简短结果。

## 安装与连接

适用环境：DSH Web `0.2.2-rc.5`、Linux x86_64。首版只支持 Secure MCP Tunnel，不公开 MCP 服务或 DSH Web 面板。随包包含 [OpenAI Tunnel runtime v0.0.21](https://github.com/openai/tunnel-client/releases/tag/v0.0.21) 的 Linux amd64 运行时和第三方许可，不需要另装 Tunnel 服务。

```sh
dsh plugin --profile web add 'github:Xinglei-dev/dsh-plugin#path:/plugins/dsh-work-connector'
```

安装后默认不启动隧道，也不发送回报。打开 DSH Web「设置 → Work 连接器」查看隧道与回报状态。准备连接前，需要一个关联目标 ChatGPT 工作区的 Tunnel、一个允许 HTTPS CONNECT 的 HTTP(S) 代理，以及能为 ChatGPT 签发 JWT 访问令牌的 OAuth 授权服务器。插件是资源服务器，不负责用户登录或签发令牌。

在 DSH Web 进程的启动环境中安全设置 `DSH_WORK_TUNNEL_KEY`（有 Tunnel Read + Use 权限的运行密钥，不是管理密钥）。代理需要认证时，使用环境变量保存完整代理地址，不把用户名、密码填进配置。不要向聊天或日志粘贴凭据。

在 web profile 中为 `work-connector` 条目配置以下字段，再设 `enabled: true`。以下是该条目的 **config 内容**，占位值需替换：

```yaml
enabled: true
tunnelId: <OpenAI Platform 给出的完整 tunnel ID>
proxy: env:DSH_WORK_PROXY
workspaceIds: [<已注册的 DSH Workspace ID>]
callbackHosts: [<Work 实际回调域名>]
issuer: https://id.example.org
resource: https://<该 Tunnel 的 MCP 资源主机和路径>
jwksFile: /etc/dsh/work-issuer-public-jwks.json
subjects: [<允许派发的用户 sub>]
```

- `resource` 必须与访问令牌的 `aud` 完全一致，`issuer` 与 `iss` 一致。令牌需带 `exp`、被允许的 `sub` 和 `dsh.work` scope。`jwksFile` 提供该 issuer 的**公钥**集，密钥轮换后重载插件。允许用户共享配置中的 Workspace 白名单，但查询、续办和订阅按派发者隔离。只允许信任的操作者使用：Workspace 白名单限制派发位置，不会降低 DSH Agent 本身的工具权限。
- `callbackHosts` 填经管理员核实的确切回调主机，不填通配符、URL 或代理地址。回调仅支持标准 HTTPS 端口、可从本机解析的公网 IPv4；代理须允许对已解析 IP 的 443 端口 CONNECT，TLS 仍按原域名验证。Tunnel 控制面、订阅验证和后续签名回报共用 `proxy`。缺少代理不启动，出错不回退直连；本机 MCP 转发不走代理。
- 在 ChatGPT 添加自定义 MCP 服务，连接方式选 **Tunnel**，选择匹配的 Tunnel、配置 OAuth，并安装到目标 Work 工作区。授权服务器、Tunnel 与工作区的管理权限分别配置。见 [Secure MCP Tunnel](https://developers.openai.com/api/docs/guides/secure-mcp-tunnels) 和 [MCP Events](https://developers.openai.com/plugins/build/mcp-events)。

## 在 Work 中使用

例如：「列出我可以使用的工作区。在指定工作区做一项只读检查，返回会话 ID；订阅这次任务，完成或需要我介入时在这条对话告诉我。」`dispatch` 返回任务 ID 和会话 ID；工具接受只表示指令已入队。`status` 查询任务，`continue_task` 在原会话排队。写入重试须使用相同的 `idempotencyKey` 和参数。每个新任务要按返回的 `taskId` 订阅 `dsh.task.updated`。

`completed` 表示 Agent 明确报告完成，不代替用户验收；只有轮次结束时返回 `turn_returned`。审批和追问在 DSH 面板处理。人工指令与派发指令进入同一轮时，可能显示 `review_required`，避免把后续聊天结果归给原任务。

## 排障与数据

- **隧道未就绪**：检查 Tunnel 绑定、运行凭据、代理与 OAuth 元数据可达性。设置页「刷新」重新读取官方运行时的就绪状态。不要以仅有子进程作为连通依据。
- **能派活、收不到回报**：确认原 Work 对话已经订阅正确的任务、验证挑战通过，检查域名白名单及代理的 CONNECT 策略。设置页将待送、重试和停止投递的订阅分开显示。连续失败达到重试上限、HTTP 410 或 413 会停止该订阅的投递；排除原因后重新订阅。
- **重启与数据保护**：任务归属、派发请求 ID、待投事件、订阅回调 URL 和签名密钥保存在当前 profile 的私有 `work-connector` 目录中。文件权限不是加密；不要共享或上传数据库。事件采用至少一次投递，重试保留事件 ID。启用前请按自身留存要求管理这份数据。

安装与离线代理验证不代表真实 Work 会话已接收回报。实际验收应从一条 Work 对话派发短任务，在原 DSH 面板看到它，并在该对话中收到匹配回报。
