---
title: Python 数据结构常用语法速查
icon: pen-to-square
date: 2026-04-13
category:
  - 技术
tag:
  - Python
  - 数据结构
  - 算法
star: true
---

Python 三大核心数据结构——**字符串（str）、列表（list）、字典（dict）**的增删改查函数、时间复杂度与高频陷阱全面总结，适合备考与日常速查。

<!-- more -->

## 一、字符串（str）

### 核心前提：不可变（immutable）

字符串**不能原地修改**，所有"改"操作的本质都是创建新字符串。

| 操作 | 能否直接修改原字符串 |
| :--: | :----------: |
| 增   | ❌           |
| 删   | ❌           |
| 改   | ❌           |
| 查   | ✅           |

```python
s = "abc"
s = s + "d"   # 实际是创建了新字符串 "abcd"，原 "abc" 不变
```

---

### 查（读取）

```python
s = "hello"

# 索引访问 — O(1)
s[0]     # 'h'
s[-1]    # 'o'

# 切片 — O(n)，越界安全，返回新字符串
s[1:4]   # 'ell'
s[:3]    # 'hel'
s[::-1]  # 'olleh'（反转）

# 查找位置
s.find("l")    # 2，找不到返回 -1
s.index("l")   # 2，找不到则 ❌ 抛出 ValueError
s.rfind("l")   # 3（从右找）

# 判断是否存在
"l" in s       # True

# 统计次数
s.count("l")   # 2
```

### 改（返回新字符串）

```python
s = "hello"

s.replace("l", "x")   # "hexxo"，原字符串不变
s.upper()             # "HELLO"
s.lower()             # "hello"
s.capitalize()        # "Hello"
s.title()             # "Hello"
s.strip()             # 去除两端空格
s.lstrip()            # 去除左端空格
s.rstrip()            # 去除右端空格
```

### 增（拼接）

```python
# + 拼接 — 多次拼接效率低
"a" + "b"        # "ab"

# join — 推荐，效率高 — O(n)
"".join(["a", "b", "c"])    # "abc"
",".join(["a", "b", "c"])   # "a,b,c"

# 重复
"a" * 3    # "aaa"
```

### 删（用切片跳过）

```python
s = "abcdef"
s[:2] + s[3:]    # "abdef"（跳过索引2的字符 'c'）
```

### 判断类

```python
s.isalpha()    # 是否全字母
s.isdigit()    # 是否全数字
s.isalnum()    # 是否字母或数字
s.isspace()    # 是否全空格
```

### 分割与拼接

```python
"a,b,c".split(",")    # ['a', 'b', 'c']
"a b c".split()       # ['a', 'b', 'c']（默认按空格）
",".join(["a","b"])   # "a,b"
```

### 时间复杂度

| 操作              | 复杂度     |
| :-------------- | :------- |
| 索引访问 `s[i]`     | O(1)     |
| 切片              | O(n)     |
| 拼接 `+`          | O(n)     |
| `replace`       | O(n)     |
| `join`          | O(n)     |

### 高频陷阱

```python
# ❌ 字符串不可变，不能直接修改
s[0] = 'a'

# ❌ join 方向写反
lst.join(",")       # 错！
",".join(lst)       # ✅

# find vs index：找不到时行为不同
s.find("x")         # 返回 -1
s.index("x")        # ❌ 抛出异常

# 切片越界不报错
s[0:100]            # ✅ 安全
```

---

## 二、列表（list）

### 核心特点

| 特性   | 是否支持 |
| :--: | :--: |
| 有序   | ✅   |
| 可修改  | ✅   |
| 可重复  | ✅   |
| 支持索引 | ✅   |

### 查（读取）

```python
arr = [10, 20, 30, 20]

# 索引访问 — O(1)
arr[0]      # 10
arr[-1]     # 30

# 切片 — O(n)
arr[1:3]    # [20, 30]
arr[::-1]   # [20, 30, 20, 10]（反转）

# 判断是否存在
20 in arr   # True

# 查位置（找第一个）
arr.index(20)    # 1

# 统计次数
arr.count(20)    # 2
```

### 增（添加）

```python
arr = [1, 2, 3]

arr.append(4)         # [1, 2, 3, 4]         — O(1)
arr.insert(1, 100)    # [1, 100, 2, 3, 4]    — O(n)
arr.extend([5, 6])    # 在末尾批量追加        — O(k)

new = arr + [7, 8]    # 返回新列表，不修改原列表
```

### 改（修改）

```python
arr[0] = 100          # 直接修改
arr[1:3] = [9, 9]     # 切片修改
```

### 删（删除）

```python
arr.pop()       # 删除最后一个，返回该元素 — O(1)
arr.pop(1)      # 删除索引1的元素          — O(n)
arr.remove(20)  # 删除第一个值为20的元素   — O(n)
del arr[1]      # 按索引删除
arr.clear()     # 清空列表
```

### 排序与反转

```python
arr.sort()           # 原地升序排序，无返回值
arr.sort(reverse=True)  # 原地降序
sorted(arr)          # 返回新列表，不修改原列表
arr.reverse()        # 原地反转
```

### 统计与复制

```python
len(arr)
max(arr)
min(arr)
sum(arr)

arr.copy()    # 浅拷贝（推荐）
arr[:]        # 浅拷贝（等价）
arr2 = arr    # ⚠️ 引用，不是拷贝！
```

### 时间复杂度

| 操作              | 复杂度        |
| :-------------- | :--------- |
| 索引访问 `arr[i]`   | O(1)       |
| `append`        | O(1)       |
| `pop()`（末尾）    | O(1)       |
| `insert` / 中间删除 | O(n)       |
| `pop(0)`        | O(n)       |
| 查找（`in`）       | O(n)       |
| `sort`          | O(n log n) |

> **规律：凡是涉及"移动元素"的操作 = O(n)**

### 高频陷阱

```python
# ❌ sort() 没有返回值
x = arr.sort()
print(x)    # None

# ❌ pop(0) 是 O(n)，慎用
arr.pop(0)

# ❌ arr2 = arr 是引用，修改会互相影响
arr2 = arr
arr2[0] = 999
print(arr[0])   # 999！

# ❌ + 不修改原列表
arr + [3]
print(arr)    # 原列表不变

# remove vs pop
arr.remove(20)   # 按值删
arr.pop(1)       # 按索引删
```

---

## 三、字典（dict）

### 核心特点

| 特性      | 说明        |
| :-----: | :-------: |
| 查找速度    | O(1)（哈希表） |
| key 唯一  | ✅         |
| 可修改     | ✅         |
| key 必须  | 不可变类型     |

```python
# ✅ 可作为 key：str、int、tuple
# ❌ 不可作为 key：list、dict
d = {[1, 2]: "a"}   # ❌ TypeError
```

### 查（读取）

```python
d = {"a": 1, "b": 2}

d["a"]              # 1，key 不存在则 ❌ KeyError
d.get("a")          # 1
d.get("x")          # None（不报错）
d.get("x", 0)       # 0（带默认值）

"a" in d            # True（判断 key 是否存在）
```

### 增 / 改

```python
d["c"] = 3          # key 不存在 → 新增；key 存在 → 覆盖
d.update({"d": 4, "e": 5})   # 批量新增或覆盖

d.setdefault("f", 0)  # key 不存在时才新增，存在时不覆盖
```

### 删（删除）

```python
del d["a"]             # 直接删除，key 不存在则 ❌ KeyError
d.pop("a")             # 删除并返回值，key 不存在则 ❌
d.pop("x", None)       # 安全写法，找不到返回 None
d.popitem()            # 删除并返回最后插入的键值对
d.clear()              # 清空字典
```

### 遍历

```python
d = {"a": 1, "b": 2}

for k in d:              # 遍历 key（默认）
for v in d.values():     # 遍历 value
for k, v in d.items():   # 遍历键值对（最常用）
```

### 时间复杂度

| 操作 | 复杂度  |
| :-: | :--: |
| 查找 | O(1) |
| 插入 | O(1) |
| 删除 | O(1) |

### 算法中的高频用法

```python
# 计数器（最常用套路）
d = {}
for x in arr:
    d[x] = d.get(x, 0) + 1

# 快速查找（两数之和思路）
seen = {}
for i, v in enumerate(arr):
    if target - v in seen:
        return [seen[target - v], i]
    seen[v] = i
```

### 高频陷阱

```python
# ❌ key 不存在时直接访问会报错
d["x"]          # KeyError，用 get 代替

# ❌ key 必须是不可变类型
d[[1, 2]] = 3   # TypeError

# 覆盖问题：同一 key 后赋值覆盖前者
d = {}
d["a"] = 1
d["a"] = 2
print(d)   # {"a": 2}

# 遍历默认是 key，不是键值对
for x in d:
    print(x)   # 只打印 key

# pop 比 del 更安全
del d["x"]          # ❌ 可能报错
d.pop("x", None)    # ✅ 安全
```

---

## 四、三大结构横向对比

| 特性      | str    | list   | dict          |
| :-----: | :----: | :----: | :-----------: |
| 是否可变    | ❌      | ✅      | ✅             |
| 是否有序    | ✅      | ✅      | ✅（Python 3.7+）|
| 查找复杂度   | O(n)   | O(n)   | O(1)          |
| 索引访问    | O(1)   | O(1)   | —             |
| 末尾增删    | O(n)   | O(1)   | O(1)          |
| 适用场景    | 文本处理   | 有序序列   | 映射 / 计数      |

---

## 五、一页速记卡

### 字符串

```python
s[i]           # 查，O(1)
s[1:4]         # 切片，O(n)
s[::-1]        # 反转
s.find(x)      # 找不到返 -1
s.index(x)     # 找不到报错
s.replace(a,b) # 替换，返回新串
"".join(lst)   # 列表→字符串
s.split(",")   # 字符串→列表
s.strip()      # 去两端空格
```

### 列表

```python
arr[i]         # 查，O(1)
arr.append(x)  # 末尾加，O(1)
arr.pop()      # 末尾删，O(1)
arr.insert(i,x)# 中间插，O(n)
arr.remove(x)  # 按值删，O(n)
arr.sort()     # 原地排序，无返回值
sorted(arr)    # 返回新列表
arr.copy()     # 浅拷贝
```

### 字典

```python
d[k]           # 查，可能报错
d.get(k, 0)    # 查，安全
d[k] = v       # 增/改
d.pop(k, None) # 删，安全
d.items()      # 键值对遍历
d[x] = d.get(x, 0) + 1   # 计数套路
```
