# Work 连接器

从 ChatGPT Work 派发任务到已有 DSH Workspace，回到原 Work 对话接收结果。每次派发创建普通 DSH 会话。Work 续办会复用原会话但返回新的任务 ID；在 DSH 面板中也能打开同一会话。完整历史留在本机，回报只带状态、关联 ID 和简短结果。

## 安装与连接

适用环境：DSH Web `0.2.2-rc.5`、Linux x86_64。首版只支持 Secure MCP Tunnel，不公开 MCP 服务或 DSH Web 面板。随包包含 [OpenAI Tunnel runtime v0.0.21](https://github.com/openai/tunnel-client/releases/tag/v0.0.21) 的 Linux amd64 运行时和第三方许可，不需要另装 Tunnel 服务。

```sh
dsh plugin --profile web add 'github:Xinglei-dev/dsh-plugin#path:/plugins/dsh-work-connector'
```

### 在 DSH Web 中配置

安装后默认不联网。面板所有者打开「设置 → Work 连接器」即可填写全部连接参数，不必编辑 profile 或设置进程环境变量。

1. **连接设置**：填写 OpenAI Platform 上关联了目标 ChatGPT 工作区的 Tunnel ID 和运行密钥（Tunnel Read + Use，不使用管理密钥）。填写 HTTP(S) 出站代理，然后勾选允许派发的现有 Workspace。Tunnel 控制面、订阅验证和签名回报共用该代理；缺少代理不会启动，连接失败不回退直连。
2. **事件回报**：不用填写回调地址。ChatGPT 在订阅任务时提供地址和签名密钥；连接器先发送签名挑战，收到正确响应后才投递该任务的结果。验证和投递只连接经检查的公网 IPv4，不跟随重定向；代理须允许向目标 IP 的 443 端口 CONNECT。
3. **保存配置**只保存草稿，不建立网络连接。确认后单独点**启用连接**，再刷新运行状态。运行时要改参数，先点**停用连接**；这不会中止已受理的 DSH 任务。
4. 在 ChatGPT 添加自定义 MCP 服务，连接方式选 **Tunnel**，选择目标 Tunnel，认证方式选 **No authentication（无认证）**。见 [Secure MCP Tunnel](https://developers.openai.com/api/docs/guides/secure-mcp-tunnels) 和 [MCP Events](https://developers.openai.com/plugins/build/mcp-events)。

**代理用户名和密码（Basic 认证）**：在「出站代理」直接填写 `https://用户名:密码@代理主机:端口`。只对用户名和密码分别做 URL 百分号编码，不编码整个地址。例如虚构密码 `p@ss:word` 应写成 `p%40ss%3Aword`。代理提供 TLS 时优先用 `https://`；使用 `http://` 时，到代理这一段不会加密 Basic 凭据。代理凭据用于 CONNECT，不作为签名回报的请求头发给回调服务。

运行密钥和代理地址只写入 DSH 凭据存储，不回显。再次保存时留空会保留原值，勾选「清除已存值」才会清除。不要在聊天、日志或截图中提供凭据；只在受信任的 HTTPS 面板或本机回环上配置。已有 profile 的代理和 `DSH_WORK_TUNNEL_KEY` 可继续使用；在界面替换或清除相应字段后，以新设置为准。

**仅供本人使用。** 不要共享 Tunnel 或 ChatGPT 连接器。能通过这条连接调用工具的人均使用同一身份；工作区白名单限制派发位置，不降低 DSH Agent 的工具权限。任务和订阅归属当前 Tunnel，切换到另一条 Tunnel 不会接管旧任务。升级前按用户身份派发的任务不会自动转入单人连接；已有会话仍可在 DSH 面板中打开。

## 在 Work 中使用

例如：「列出我可以使用的工作区。在指定工作区做一项只读检查，返回会话 ID；订阅这次任务，完成或需要我介入时在这条对话告诉我。」`dispatch` 返回任务 ID 和会话 ID；工具接受只表示指令已入队。`status` 查询任务，`continue_task` 在原会话排队。写入重试须使用相同的 `idempotencyKey` 和参数。每个新任务要按返回的 `taskId` 订阅 `dsh.task.updated`。

`completed` 表示 Agent 明确报告完成，不代替用户验收；只有轮次结束时返回 `turn_returned`。审批和追问在 DSH 面板处理。人工指令与派发指令进入同一轮时，可能显示 `review_required`，避免把后续聊天结果归给原任务。

## 排障与数据

- **隧道未就绪**：检查 Tunnel 绑定、运行凭据、代理连通性。设置页「刷新」重新读取官方运行时的就绪状态。不要以仅有子进程作为连通依据。
- **能派活、收不到回报**：确认原 Work 对话已经订阅正确的任务、验证挑战通过，检查回调域名能否解析到公网 IPv4，以及代理是否允许 CONNECT。设置页将待送、重试和停止投递的订阅分开显示。连续失败达到重试上限、HTTP 410 或 413 会停止该订阅的投递；排除原因后重新订阅。
- **重启与数据保护**：任务归属、派发请求 ID、待投事件、订阅回调 URL 和签名密钥保存在当前 profile 的私有 `work-connector` 目录中。文件权限不是加密；不要共享或上传数据库。事件采用至少一次投递，重试保留事件 ID。启用前请按自身留存要求管理这份数据。

安装与离线代理验证不代表真实 Work 会话已接收回报。实际验收应从一条 Work 对话派发短任务，在原 DSH 面板看到它，并在该对话中收到匹配回报。
