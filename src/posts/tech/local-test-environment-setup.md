---
title: 关于如何搭建本地测试环境
icon: pen-to-square
date: 2026-03-30
category:
  - 技术
tag:
  - Python
  - PyCharm
  - 环境配置
  - Windows
  - 新手向
star: true
---

# 关于如何搭建本地测试环境

作为一个计算机小白，我在用 PyCharm 搭建本地测试环境时，光是装几个包就碰了一脸壁。这篇文章记录我踩过的坑，希望帮到同样在公司电脑上折腾环境的你。

<!-- more -->

---

## 写在前面

我的环境：**PyCharm + Python 3.12 + Windows 11 + 公司内网电脑**。

公司电脑有几个特殊之处，会让你的安装之路比在自己电脑上难得多：

- **没有管理员权限**，装软件经常弹"需要管理员授权"
- **内网代理**，直接访问外网会超时或被拦截
- **数据安全策略**，部分目录写入受限
- **IT 部门管控**，某些端口或域名被封锁

记住这个前提，后面遇到奇怪报错，优先往这几个方向排查。

---

## 一、本地测试环境的原理

在正式安装之前，先搞清楚"本地测试环境"到底是什么，能省去很多盲目试错。

### 1.1 三层结构

```
你的代码
   ↓
Python 解释器（运行代码的引擎）
   ↓
依赖包（pip 管理的第三方库）
   ↓
操作系统 / JVM（部分库需要 Java 运行时支持）
```

- **Python 解释器**：代码的"翻译官"，把你写的 `.py` 文件变成机器能执行的指令
- **pip**：Python 的包管理工具，类似"应用商店"，负责下载和安装第三方库
- **Java（JDK/JRE）**：部分工具（如某些数据处理框架）底层依赖 Java 虚拟机运行
- **虚拟环境（venv）**：为每个项目创建独立的包空间，避免不同项目的依赖互相冲突

### 1.2 为什么要用虚拟环境

想象一下：项目 A 需要 `requests==2.28`，项目 B 需要 `requests==2.31`，如果都装在系统里，必然打架。虚拟环境就是给每个项目一个独立的"小房间"，互不干扰。

---

## 二、安装前必读：公司电脑注意事项

::: warning 数据安全与权限
公司电脑安装软件前，请确认以下几点：
1. 是否需要向 IT 部门申请安装权限
2. 安装的包是否在公司允许的白名单内
3. 涉及敏感数据的项目，不要把数据文件放在个人目录下
4. 不要关闭或绕过公司的安全软件
:::

---

## 三、pip 配置与使用

### 3.1 确认 pip 是否可用

在 PyCharm 底部的 **Terminal** 面板输入：

```bash
pip --version
```

正常输出类似：

```
pip 24.0 from C:\Users\你的用户名\AppData\...\pip (python 3.12)
```

如果提示 `pip is not recognized`，说明 Python 安装时没有勾选"Add to PATH"，需要重新安装 Python 并勾选该选项。

### 3.2 配置国内镜像源（公司内网必做）

公司网络访问 PyPI 官方源（pypi.org）经常超时，换成国内镜像源速度会快很多。

**临时使用**（单次安装时指定）：

```bash
pip install 包名 -i https://pypi.tuna.tsinghua.edu.cn/simple
```

**永久配置**（推荐，一劳永逸）：

在 PyCharm Terminal 中运行：

```bash
pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple
pip config set global.trusted-host pypi.tuna.tsinghua.edu.cn
```

验证配置是否生效：

```bash
pip config list
```

::: tip 如果公司有内部镜像源
问一下 IT 或同事，公司是否部署了内部 pip 镜像。如果有，优先用公司内部地址，速度更快，也不会触发安全策略。
:::

### 3.3 常见报错与解决

**报错 1：`ERROR: Could not find a version that satisfies the requirement`**

```
原因：包名写错，或镜像源里没有这个版本
解决：检查包名拼写，或指定版本号安装
```

```bash
# 先搜索确认包名
pip search 包名
# 或直接去 https://pypi.org 搜索
```

**报错 2：`PermissionError: [Errno 13] Permission denied`**

```
原因：没有写入系统目录的权限（公司电脑常见）
解决：加 --user 参数，安装到用户目录
```

```bash
pip install 包名 --user
```

**报错 3：`SSLError` 或 `ProxyError`**

```
原因：公司代理拦截了网络请求
解决：配置代理或使用公司内部镜像源
```

```bash
pip install 包名 --proxy http://公司代理地址:端口
```

---

## 四、Java 安装与配置

### 4.1 下载 JDK

::: warning 公司电脑注意
直接从官网下载可能需要 Oracle 账号，或被公司防火墙拦截。建议：
- 使用 **OpenJDK**（开源免费，无需账号）
- 从公司内网软件分发平台获取（如果有的话）
:::

推荐下载 **OpenJDK 17**（长期支持版）：访问 `https://adoptium.net`，选择 Windows x64 `.msi` 安装包。

### 4.2 安装步骤

1. 双击 `.msi` 文件
2. 若弹出"需要管理员权限"，联系 IT 协助安装
3. 安装时勾选 **"Set JAVA_HOME variable"** 和 **"JavaSoft registry keys"**（自动配置环境变量）

### 4.3 验证安装

打开 PowerShell 或 PyCharm Terminal：

```bash
java -version
```

输出类似以下内容表示成功：

```
openjdk version "17.0.10" 2024-01-16
OpenJDK Runtime Environment Temurin-17.0.10+7 (build 17.0.10+7)
```

### 4.4 手动配置环境变量（如果 `java -version` 报错）

1. 按 `Win + S` 搜索"编辑系统环境变量"
2. 点击"环境变量"
3. 在"系统变量"中新建：
   - 变量名：`JAVA_HOME`
   - 变量值：`C:\Program Files\Eclipse Adoptium\jdk-17.0.10.7-hotspot`（改为你的实际安装路径）
4. 找到 `Path` 变量，点击编辑，新增：`%JAVA_HOME%\bin`
5. 重启 PyCharm 和 Terminal 使配置生效

---

## 五、安装 strust 包

### 5.1 安装方式

在 PyCharm Terminal 中运行：

```bash
pip install strust
```

如网络受限，加上镜像源：

```bash
pip install strust -i https://pypi.tuna.tsinghua.edu.cn/simple
```

### 5.2 在 PyCharm 中通过界面安装（更直观）

1. 打开 **File → Settings → Project → Python Interpreter**
2. 点击右侧 **+** 号
3. 搜索 `strust`
4. 点击 **Install Package**

### 5.3 验证安装

```python
import strust
print(strust.__version__)
```

---

## 六、在 PyCharm 中创建虚拟环境（强烈推荐）

### 6.1 创建步骤

1. 打开 **File → Settings → Project → Python Interpreter**
2. 点击右上角齿轮图标 → **Add Interpreter**
3. 选择 **Virtualenv Environment** → **New environment**
4. 路径默认在项目目录下的 `venv` 文件夹，保持默认即可
5. Base interpreter 选择 **Python 3.12**
6. 点击 **OK**

### 6.2 在虚拟环境中安装包

创建完虚拟环境后，Terminal 提示符前会出现 `(venv)`，表示已激活虚拟环境：

```bash
(venv) PS D:\your-project> pip install pip java strust
```

所有包都安装在 `venv/` 目录下，不影响系统全局环境。

---

## 七、我遇到最多的两类报错

### 7.1 `No module named 'xxx'` / `xxx 里没有这个函数`

这是我踩得最多的坑，根本原因几乎都是：**安装包的 Python 环境和 PyCharm 使用的 Python 环境不一致**。

```
典型场景：
- 在系统 Python 里用 pip 装了包
- 但 PyCharm 用的是虚拟环境里的 Python
- 两个环境互相独立，自然找不到
```

**排查方法**：

```python
# 在 PyCharm 中运行这段代码，看实际用的是哪个 Python
import sys
print(sys.executable)
# 输出类似：C:\Users\你的用户名\project\venv\Scripts\python.exe
```

然后用这个路径对应的 pip 安装包：

```bash
C:\Users\你的用户名\project\venv\Scripts\pip.exe install 包名
```

或者直接在 PyCharm Terminal 里安装（Terminal 会自动激活虚拟环境）。

### 7.2 `FileNotFoundError` / `找不到 file or document`

常见原因和解决方法：

| 原因 | 解决方法 |
|------|---------|
| 路径中有中文或空格 | 把项目路径改为纯英文，如 `D:\projects\my_project` |
| 路径分隔符写错 | Windows 路径用 `\\` 或原始字符串 `r"D:\path"` |
| 工作目录不对 | 在 PyCharm 右上角运行配置中检查 `Working directory` |
| 文件名大小写不对 | Windows 不区分大小写但 Python 代码区分，保持一致 |
| 公司权限限制了目录访问 | 把文件放到用户目录下，如 `C:\Users\你的用户名\` |

**路径问题最佳实践**：

```python
# 不推荐：硬编码绝对路径
open("D:\my project\data\file.csv")

# 推荐：用 pathlib 处理路径，自动兼容各系统
from pathlib import Path
BASE_DIR = Path(__file__).parent
data_file = BASE_DIR / "data" / "file.csv"
open(data_file)
```

---

## 八、快速检查清单

遇到问题时，按顺序检查以下几项，能解决 80% 的常见报错：

- [ ] PyCharm 选择的 Python 解释器是否是虚拟环境里的？
- [ ] 包是否安装在当前激活的虚拟环境里？（Terminal 前有 `(venv)`）
- [ ] 网络是否通畅？是否需要配置代理或镜像源？
- [ ] 路径中是否有中文、空格或特殊字符？
- [ ] 是否需要管理员权限？（尝试加 `--user` 参数）
- [ ] 重启 PyCharm 和 Terminal 后再试？（环境变量修改后必须重启）

---

## 九、总结

搭建本地环境本质上就是把"代码需要的东西"都装对地方，然后让 PyCharm 知道去哪里找它们。在公司电脑上额外需要注意权限和网络两个拦路虎。

遇到报错不要慌，把报错信息完整复制，去搜索引擎搜一下，大概率有人遇到过同样的问题。每踩一个坑，就少一个坑。

> "每一个看起来奇怪的报错，背后都有一个很朴素的原因。"
