---
title: 硬件健康度预测项目文档
icon: microchip
date: 2026-03-27
category:
  - 技术
tag:
  - Python
  - 机器学习
  - XGBoost
  - MLflow
star: true
---

# 硬件健康度预测项目文档

基于 XGBoost 的硬件健康度评分系统，集成 Logging、MLflow、Git 三层版本管理框架，支持不平衡样本处理与概率校准。

<!-- more -->

---

## 项目概览

| 项目 | 说明 |
|------|------|
| **项目路径** | `D:\hardware selection program` |
| **运行环境** | Windows 11 + Python 3.12.10 + Jupyter Notebook (VSCode) |
| **核心算法** | XGBoost 二分类（健康 / 不健康） |
| **输出形式** | 0–100 健康度分数 + 风险等级 + 处置建议 |
| **版本管理** | Logging（文件日志）+ MLflow（实验追踪）+ Git（代码版本） |

---

## 目录结构

```
D:\hardware selection program\
├── configs\
│   └── baseline.yaml          # 实验参数配置
├── src\
│   ├── logger.py              # 日志管理模块
│   ├── config.py              # 配置加载模块
│   └── mlflow_tracker.py      # MLflow 追踪模块
├── data\
│   ├── raw\
│   │   └── hardware_data.csv  # 原始数据（需手动放入）
│   └── processed\             # 预处理后数据（自动生成）
├── experiments\               # 每次实验产出（自动生成）
│   └── EXP_YYYYMMDD_HHMMSS\
│       ├── data_report.json
│       ├── feature_importance.csv
│       ├── metrics.json
│       ├── calibration_curve.png
│       ├── confusion_matrix.png
│       ├── predictions.csv
│       ├── pipeline.pkl
│       └── config.yaml
├── logs\                      # 日志文件（自动生成）
├── models\
│   ├── production\            # 上线模型存放
│   └── archive\               # 历史模型归档
├── mlruns\                    # MLflow 实验数据（自动生成）
├── notebooks\                 # Jupyter Notebook 文件
├── reports\                   # 分析报告
├── run.py                     # 主训练脚本
└── test_init.py               # 初始化验证脚本
```

---

## 生成文件说明

### `src/logger.py` — 日志管理模块

**作用**：统一管理训练过程中所有日志输出，同时写入控制台和文件。

| 特性 | 说明 |
|------|------|
| 控制台输出 | INFO 及以上级别，实时查看训练进度 |
| 文件输出 | DEBUG 及以上级别，记录完整调试信息 |
| 日志轮转 | 单文件 10 MB 上限，保留最近 5 个备份 |
| 文件命名 | `logs/{实验ID}.log` |

**使用方式**：

```python
from src.logger import get_logger

logger = get_logger(__name__, experiment_id="EXP_001")
logger.info("训练开始")
logger.warning("样本不平衡！")
logger.error("数据文件不存在")
```

**操作说明**：
- 无需手动创建 `logs/` 目录，模块会自动创建
- 日志文件名与实验 ID 一一对应，便于事后追溯
- 如需查看完整调试日志，直接打开 `logs/{实验ID}.log`

---

### `src/config.py` — 配置加载模块

**作用**：读取 YAML 配置文件，支持点号访问嵌套参数，支持运行时修改和保存。

**核心方法**：

| 方法 | 说明 | 示例 |
|------|------|------|
| `get(key, default)` | 读取配置项 | `config.get('model.params.max_depth')` |
| `set(key, value)` | 修改配置项 | `config.set('model.params.max_depth', 7)` |
| `to_dict()` | 导出完整配置字典 | `config.to_dict()` |
| `save(path)` | 保存配置到文件 | `config.save('experiments/exp1/config.yaml')` |

**使用方式**：

```python
from src.config import load_config

config = load_config("configs/baseline.yaml")
print(config.get('experiment.name'))       # hardware_health_baseline
print(config.get('model.params.max_depth')) # 5
```

**操作说明**：
- 修改实验参数时，只需编辑 `configs/baseline.yaml`，无需改动代码
- 每次实验结束后，配置会自动备份到 `experiments/{实验ID}/config.yaml`

---

### `src/mlflow_tracker.py` — MLflow 追踪模块

**作用**：自动记录实验参数、评估指标、模型文件，支持多实验对比。

**核心方法**：

| 方法 | 说明 |
|------|------|
| `start_run(run_name, config)` | 开始一次实验运行，自动记录配置参数 |
| `log_metrics(metrics)` | 记录评估指标（PR-AUC、召回率等） |
| `log_model(model, path)` | 记录 XGBoost 模型及签名 |
| `log_artifacts(dir)` | 记录整个实验产出目录 |
| `end_run()` | 结束运行（`with` 语句会自动调用） |

**使用方式**：

```python
from src.mlflow_tracker import get_tracker

tracker = get_tracker("hardware_health_baseline")

with tracker.start_run(run_name="EXP_001", config=config.to_dict()):
    tracker.log_metrics({"pr_auc": 0.87, "recall": 0.93})
    tracker.log_model(model, "xgboost_model")
```

**操作说明**：
- 实验数据存储在项目根目录 `mlruns/` 下
- 启动可视化 UI：在终端运行 `mlflow ui --port 5000`，浏览器访问 `http://localhost:5000`
- 支持多次实验横向对比，无需手动记录参数

---

### `configs/baseline.yaml` — 实验参数配置

**作用**：集中管理所有可调参数，与代码解耦。

**关键参数说明**：

```yaml
data:
  raw_path: "data/raw/hardware_data.csv"  # ← 修改为你的数据文件路径
  target_column: "is_unhealthy"           # ← 修改为你数据中目标列的列名
  test_size: 0.15                         # 测试集占比 15%
  val_size: 0.15                          # 验证集占比 15%

model:
  params:
    max_depth: 5          # 树深度，防过拟合
    learning_rate: 0.1    # 学习率
    n_estimators: 200     # 最大树数量（早停会实际减少）
    scale_pos_weight: auto # 自动计算类别权重，处理不平衡

evaluation:
  threshold_target: 0.95  # 目标召回率，用于阈值选择
```

**操作说明**：
- **必须修改**：`data.raw_path` 和 `data.target_column`
- 不同调参方案建议复制为新文件（如 `configs/v2_deeper.yaml`），保持历史可追溯
- `scale_pos_weight: auto` 表示由代码自动计算，无需手动填写

---

### `test_init.py` — 初始化验证脚本

**作用**：验证三个自定义模块（logger、config、mlflow_tracker）全部可用，是正式训练前的"健康检查"。

**运行方式**：

```powershell
# 在项目根目录的终端中运行
cd D:\hardware selection program
python test_init.py
```

或在 Jupyter Notebook 中：

```python
import os
os.chdir(r"D:\hardware selection program")
exec(open("test_init.py").read())
```

**预期输出**：

```
测试1: 日志模块 → ✓ 日志模块测试通过
测试2: 配置模块 → ✓ 配置文件加载成功
测试3: MLflow模块 → ✓ MLflow模块测试通过
```

**操作说明**：
- 首次配置环境后必须运行，确认无报错再进行训练
- 若 MLflow 测试失败，检查 `mlflow` 包是否已安装：`pip install mlflow==2.16.2`

---

### `run.py` — 主训练脚本（核心文件）

**作用**：封装完整的 8 个训练代码块为 `HardwareHealthPredictor` 类，一键运行端到端流程。

---

## 8 个代码块详解

### 代码块 1：数据加载与探索 `block1_load_data()`

**目的**：加载原始 CSV 数据，输出数据概况报告。

**主要操作**：
- 读取数据，统计行列数、内存占用
- 分析目标变量分布，计算健康/不健康比例
- 识别缺失值列和特征类型（数值 / 类别）
- 根据不平衡比例给出处理建议

**输出文件**：`experiments/{实验ID}/data_report.json`

```json
{
  "total_samples": 10000,
  "healthy_count": 9800,
  "unhealthy_count": 200,
  "imbalance_ratio": 49.0
}
```

**注意事项**：
- 若目标列名与 `target_column` 配置不符，会抛出 `ValueError`
- 若数据中无不健康样本，流程终止

---

### 代码块 2：数据预处理 `block2_preprocess()`

**目的**：处理缺失值、异常值，完成类型编码。

**处理流程**：

```
原始数据
  ↓ 删除缺失率 > 80% 的列
  ↓ 数值列用中位数填充缺失
  ↓ 类别列用众数填充缺失
  ↓ IQR 法截断异常值（clip 到 [Q1-1.5*IQR, Q3+1.5*IQR]）
  ↓ LabelEncoder 编码类别特征
  ↓ 数据泄露检查
干净数据
```

**操作说明**：
- 异常值处理采用截断（clip）而非删除，保留样本数量
- 类别编码器（`label_encoders`）会被保存，预测时必须复用同一编码器
- 若出现数据泄露警告，检查特征中是否含有维修记录、故障标记等未来信息

---

### 代码块 3：特征工程 `block3_feature_engineering()`

**目的**：标准化数值特征，构造组合特征，过滤低方差特征。

**主要操作**：
- `StandardScaler` 标准化数值特征
- 自动检测温度（`temp`）和转速（`fan`/`speed`）列，构造比值特征
- `VarianceThreshold(0.01)` 删除近似常数特征
- 可选：用 XGBoost 初步筛选，保留累积重要性 95% 的特征

**输出文件**：`experiments/{实验ID}/feature_importance_prelim.csv`（启用特征筛选时）

**操作说明**：
- 标准化器（`scaler`）会被保存，预测时必须复用
- 若数据中无温度/转速特征，组合特征步骤自动跳过
- 在 `configs/baseline.yaml` 中设置 `feature_engineering.feature_selection: true` 启用特征筛选

---

### 代码块 4：数据分割 `block4_split_data()`

**目的**：分层划分训练集/验证集/测试集，计算类别权重。

**分割比例**（默认）：

```
全量数据 (100%)
├── 测试集 (15%)   ← 最终评估，训练过程不可见
├── 验证集 (15%)   ← 早停监控，训练过程不可见
└── 训练集 (70%)   ← 模型训练
```

**`scale_pos_weight` 计算**：

```python
scale_pos_weight = 健康样本数 / 不健康样本数
# 示例：9800 / 200 = 49.0
```

**操作说明**：
- 分割使用 `stratify=y`，保证各子集类别比例一致
- `scale_pos_weight` 自动写入模型配置，无需手动设置

---

### 代码块 5：模型训练 `block5_train_model()`

**目的**：训练 XGBoost 模型，使用早停防止过拟合。

**训练关键参数**：

| 参数 | 作用 |
|------|------|
| `scale_pos_weight` | 惩罚漏报不健康样本 |
| `early_stopping_rounds=20` | 验证集损失 20 轮不下降则停止 |
| `eval_metric='logloss'` | 以对数损失作为早停监控指标 |

**输出文件**：

| 文件 | 说明 |
|------|------|
| `training_history.json` | 每轮训练集/验证集损失曲线 |
| `feature_importance.csv` | 最终模型各特征重要性排名 |

**操作说明**：
- `model.best_iteration` 即最终使用的树数量，可用于下次调参参考
- 如果训练轮数较少（< 50），可考虑降低 `learning_rate` 或增大 `n_estimators`

---

### 代码块 6：模型评估 `block6_evaluate_model()`

**目的**：全面评估模型性能，重点关注不平衡场景下的少数类表现。

**评估指标体系**：

| 指标 | 说明 | 重要性 |
|------|------|--------|
| **PR-AUC** | Precision-Recall 曲线下面积，主指标 | ⭐⭐⭐ |
| **召回率**（少数类） | 不健康设备被识别出的比例，漏报代价高 | ⭐⭐⭐ |
| **F2-Score** | F-beta（β=2），召回率权重是精确率的 2 倍 | ⭐⭐ |
| **Brier Score** | 概率预测质量，越低越好（满分 0） | ⭐⭐ |
| ROC-AUC | 参考指标，不平衡时可能虚高 | ⭐ |

**输出文件**：

| 文件 | 内容 |
|------|------|
| `metrics.json` | 所有评估指标数值 |
| `calibration_curve.png` | 校准曲线 + 预测概率分布图 |
| `confusion_matrix.png` | 混淆矩阵热力图 |

**解读混淆矩阵**：

```
              预测健康    预测不健康
实际健康    [真阴性 TN]  [假阳性 FP]  ← 误报，成本较低
实际不健康  [假阴性 FN]  [真阳性 TP]  ← 漏报，成本较高！
```

---

### 代码块 7：模型优化与决策 `block7_optimize()`

**目的**：优化分类阈值和概率校准，将概率转换为健康度分数。

**阈值优化策略**：

| 策略 | 说明 | 适用场景 |
|------|------|---------|
| 基于 F2 最优 | 最大化 F2-Score 对应的阈值 | 平衡召回率与精确率 |
| 基于目标召回率 | 找到使召回率 ≥ 95% 的最低阈值 | 漏报代价极高时 |

**健康度等级定义**：

| 分数区间 | 等级 | 建议操作 |
|---------|------|---------|
| 90 – 100 | 优秀 | 无需关注 |
| 70 – 89 | 良好 | 常规监控 |
| 50 – 69 | 一般 | 重点关注 |
| 30 – 49 | 较差 | 计划维修 |
| 0 – 29 | 高危 | 立即处理 |

**概率校准触发条件**：
- 校准误差（Mean Absolute Calibration Error）> 0.1 时自动启用 Isotonic Regression 校准
- 校准后 Brier Score 变小则采用校准结果，否则保持原始概率

**输出文件**：

| 文件 | 内容 |
|------|------|
| `model.pkl` | 训练好的 XGBoost 模型 |
| `health_config.json` | 健康度转换配置（阈值等） |
| `config.yaml` | 本次实验配置备份 |

---

### 代码块 8：预测与部署准备 `block8_deploy()`

**目的**：封装预测函数，输出批量预测结果，保存完整 Pipeline。

**`predict_health_score()` 函数签名**：

```python
def predict_health_score(input_data: pd.DataFrame) -> list[dict]:
    """
    输入：特征 DataFrame（与训练时相同的列）
    输出：[
        {
            "health_score": 82.5,    # 0–100 健康度分数
            "risk_level": "良好",    # 风险等级
            "suggestion": "常规监控", # 处置建议
            "confidence": 0.825      # 置信度
        },
        ...
    ]
    """
```

**输出文件**：

| 文件 | 内容 |
|------|------|
| `predictions.csv` | 测试集全部预测结果 |
| `monitoring_metrics.json` | 监控基准指标（分布、平均分等） |
| `pipeline.pkl` | 完整 Pipeline（模型 + 编码器 + 标准化器） |

**操作说明**：
- 生产环境部署时加载 `pipeline.pkl` 即可，无需重新训练
- `monitoring_metrics.json` 中的分布信息用于上线后数据漂移监控

---

## 快速上手指南

### 第一次使用

**Step 1**：安装依赖

```powershell
cd D:\hardware selection program
pip install mlflow==2.16.2 pyyaml pandas numpy scikit-learn xgboost matplotlib seaborn joblib
```

**Step 2**：初始化 Git 仓库

```powershell
git init
git add .
git commit -m "Initialize project structure"
```

**Step 3**：放入数据文件

将数据文件复制到 `data/raw/`，并修改 `configs/baseline.yaml` 中的两个关键项：

```yaml
data:
  raw_path: "data/raw/你的文件名.csv"
  target_column: "你的目标列名"
```

**Step 4**：验证环境

```powershell
python test_init.py
```

三项测试全部通过后继续。

**Step 5**：运行训练

```powershell
python run.py --config configs/baseline.yaml
```

或在 Jupyter Notebook 中：

```python
import os, sys
os.chdir(r"D:\hardware selection program")
sys.path.insert(0, os.getcwd())

from run import HardwareHealthPredictor

predictor = HardwareHealthPredictor("configs/baseline.yaml")
model, metrics, predict_func = predictor.run_full_pipeline()
```

**Step 6**：查看实验结果

```powershell
mlflow ui --port 5000
# 浏览器访问 http://localhost:5000
```

---

### 使用训练好的模型预测新数据

```python
import joblib
import pandas as pd

# 加载 Pipeline
pipeline = joblib.load(r"experiments\EXP_YYYYMMDD_HHMMSS\pipeline.pkl")

model = pipeline['model']
scaler = pipeline['scaler']
label_encoders = pipeline['label_encoders']
numeric_cols = pipeline['numeric_cols']

# 准备新数据（需要与训练数据相同的特征列）
new_data = pd.read_csv("data/raw/new_hardware_data.csv")

# 预测（复用 block8 中封装的函数）
from run import HardwareHealthPredictor
predictor = HardwareHealthPredictor("configs/baseline.yaml")
predictor.model = model
predictor.scaler = scaler
predictor.label_encoders = label_encoders
predictor.numeric_cols = numeric_cols

results = predictor.block8_deploy.__func__  # 或直接调用封装好的 predict_health_score
```

---

## 实验产出文件汇总

每次运行 `run.py` 会在 `experiments/EXP_{时间戳}/` 下生成以下文件：

| 文件名 | 生成阶段 | 说明 |
|--------|---------|------|
| `data_report.json` | 代码块 1 | 数据概况统计 |
| `feature_importance_prelim.csv` | 代码块 3 | 初步特征重要性（可选） |
| `training_history.json` | 代码块 5 | 训练/验证损失曲线数据 |
| `feature_importance.csv` | 代码块 5 | 最终模型特征重要性 |
| `metrics.json` | 代码块 6 | 所有评估指标 |
| `calibration_curve.png` | 代码块 6 | 校准曲线图 |
| `confusion_matrix.png` | 代码块 6 | 混淆矩阵图 |
| `model.pkl` | 代码块 7 | XGBoost 模型 |
| `health_config.json` | 代码块 7 | 健康度转换配置 |
| `config.yaml` | 代码块 7 | 本次实验参数备份 |
| `predictions.csv` | 代码块 8 | 测试集预测结果 |
| `monitoring_metrics.json` | 代码块 8 | 上线监控基准 |
| `pipeline.pkl` | 代码块 8 | 完整推理 Pipeline |

---

## 常见问题排查

| 错误信息 | 原因 | 解决方法 |
|---------|------|---------|
| `FileNotFoundError: data/raw/...` | 数据路径配置错误 | 检查 `configs/baseline.yaml` 中 `raw_path` |
| `ValueError: 目标列不存在` | 目标列名配置错误 | 检查数据实际列名，修改 `target_column` |
| `ValueError: 数据中没有不健康样本` | 目标列值全为 1 | 确认目标列定义（0=不健康，1=健康） |
| `ModuleNotFoundError: src.logger` | 工作目录不对 | 在代码开头加 `os.chdir(r"D:\hardware selection program")` |
| `mlflow ui` 无响应 | mlflow 未安装或端口占用 | `pip install mlflow`，或换端口 `--port 5001` |
| 训练集存在缺失值（代码块 4 报错） | 预处理未完全覆盖某列 | 检查代码块 2 中缺失值填充逻辑 |

---

## 版本管理建议

```powershell
# 每次调参后提交
git add configs/
git commit -m "tune: 调整 max_depth=7, learning_rate=0.05"

# 达到里程碑时打 tag
git tag -a v1.0 -m "基线模型，PR-AUC=0.87"

# 查看实验历史
git log --oneline
```

**推荐工作流**：

```
调整 configs/baseline.yaml
    ↓
运行 python run.py
    ↓
在 MLflow UI 对比实验结果
    ↓
确认改进 → git commit
    ↓
下一轮调参
```
