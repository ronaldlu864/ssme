# SSME - Smart Supplier Match Engine

供应链智能供应商匹配引擎

## 部署步骤

### 1. 上传到 GitHub

1. 创建新的 GitHub 仓库
2. 上传所有文件（除了 node_modules 和 dist）

### 2. 连接 Vercel

1. 访问 https://vercel.com
2. 用 GitHub 登录
3. 导入 ssme 仓库
4. 框架选择 **Vite**
5. 点击 Deploy

### 3. 配置环境变量

在 Vercel 项目 Settings → Environment Variables 中添加：

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_OPENAI_API_KEY=sk-your-openai-key
VITE_APP_PASSWORD=your-password
```

**注意**：请使用您自己的 API Key，不要在代码中硬编码！

### 4. 添加自定义域名

1. Settings → Domains
2. 添加 ssme.scmpts.com
3. 配置 DNS CNAME 记录指向 cname.vercel-dns.com

## 登录密码

默认密码在环境变量 `VITE_APP_PASSWORD` 中设置
