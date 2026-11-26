# HiMorning应用API接口设计

## 🌐 API设计概览

### 设计原则
- **RESTful风格：** 遵循REST架构风格
- **统一响应格式：** 标准化的响应结构
- **版本管理：** 支持API版本控制
- **安全认证：** JWT令牌认证机制
- **错误处理：** 统一的错误码和错误信息

### 基础信息
- **Base URL：** `https://api.himorning.com/v1`
- **Content-Type：** `application/json`
- **字符编码：** UTF-8
- **认证方式：** Bearer Token (JWT)

## 📋 通用响应格式

### 成功响应
```json
{
  "success": true,
  "code": 200,
  "message": "操作成功",
  "data": {},
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### 错误响应
```json
{
  "success": false,
  "code": 400,
  "message": "请求参数错误",
  "error": {
    "type": "VALIDATION_ERROR",
    "details": [
      {
        "field": "phone",
        "message": "手机号格式不正确"
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### 分页响应
```json
{
  "success": true,
  "code": 200,
  "message": "查询成功",
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## 🔐 认证相关接口

### 1. 发送短信验证码
```http
POST /auth/sms/send
Content-Type: application/json

{
  "phone": "13800138000",
  "type": "LOGIN"
}
```

**响应：**
```json
{
  "success": true,
  "code": 200,
  "message": "验证码发送成功",
  "data": {
    "expires_in": 300
  }
}
```

### 2. 手机验证码登录
```http
POST /auth/login/phone
Content-Type: application/json

{
  "phone": "13800138000",
  "code": "123456",
  "device_info": {
    "device_id": "uuid-device-id",
    "platform": "ios",
    "version": "1.0.0"
  }
}
```

**响应：**
```json
{
  "success": true,
  "code": 200,
  "message": "登录成功",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 7200,
    "token_type": "Bearer",
    "user": {
      "id": 1,
      "nickname": "用户昵称",
      "avatar_url": "https://example.com/avatar.jpg",
      "phone": "138****8000",
      "is_new_user": false
    }
  }
}
```

### 3. 微信授权登录
```http
POST /auth/login/wechat
Content-Type: application/json

{
  "code": "wx_auth_code",
  "device_info": {
    "device_id": "uuid-device-id",
    "platform": "ios",
    "version": "1.0.0"
  }
}
```

### 4. 刷新令牌
```http
POST /auth/refresh
Authorization: Bearer {refresh_token}

{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 5. 用户注销
```http
POST /auth/logout
Authorization: Bearer {access_token}
```

## 👤 用户相关接口

### 1. 获取用户信息
```http
GET /users/profile
Authorization: Bearer {access_token}
```

**响应：**
```json
{
  "success": true,
  "code": 200,
  "data": {
    "id": 1,
    "nickname": "晨光小伙伴",
    "avatar_url": "https://example.com/avatar.jpg",
    "phone": "138****8000",
    "gender": "UNKNOWN",
    "city": "北京",
    "bio": "积极向上的生活态度",
    "theme": "sunrise",
    "stats": {
      "total_checkin_days": 28,
      "continuous_days": 7,
      "max_continuous_days": 15,
      "total_points": 280,
      "level": 2
    },
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### 2. 更新用户信息
```http
PUT /users/profile
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "nickname": "新昵称",
  "gender": "MALE",
  "city": "上海",
  "bio": "热爱生活的程序员"
}
```

### 3. 上传头像
```http
POST /users/avatar
Authorization: Bearer {access_token}
Content-Type: multipart/form-data

file: [image file]
```

### 4. 更新主题设置
```http
PUT /users/theme
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "theme": "morning"
}
```

### 5. 获取用户统计数据
```http
GET /users/stats?period=month
Authorization: Bearer {access_token}
```

## 📝 打卡相关接口

### 1. 创建打卡记录
```http
POST /checkins
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "type": "MORNING",
  "content": "今天的阳光特别温暖，心情很好！",
  "mood": "HAPPY",
  "images": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg"
  ],
  "location": "北京市朝阳区",
  "weather": "晴天",
  "is_public": true
}
```

**响应：**
```json
{
  "success": true,
  "code": 201,
  "message": "打卡成功",
  "data": {
    "id": 123,
    "type": "MORNING",
    "content": "今天的阳光特别温暖，心情很好！",
    "mood": "HAPPY",
    "images": [
      {
        "id": 1,
        "url": "https://example.com/image1.jpg",
        "thumbnail_url": "https://example.com/thumb1.jpg"
      }
    ],
    "checkin_date": "2024-01-15",
    "checkin_time": "08:30:00",
    "is_streak": true,
    "continuous_days": 8,
    "points_earned": 10,
    "created_at": "2024-01-15T08:30:00Z"
  }
}
```

### 2. 获取打卡历史
```http
GET /checkins?page=1&limit=20&type=MORNING&start_date=2024-01-01&end_date=2024-01-31
Authorization: Bearer {access_token}
```

### 3. 获取单个打卡详情
```http
GET /checkins/123
Authorization: Bearer {access_token}
```

### 4. 更新打卡记录
```http
PUT /checkins/123
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "content": "更新后的心语内容",
  "mood": "CALM",
  "is_public": false
}
```

### 5. 删除打卡记录
```http
DELETE /checkins/123
Authorization: Bearer {access_token}
```

### 6. 获取打卡统计
```http
GET /checkins/stats?period=month
Authorization: Bearer {access_token}
```

**响应：**
```json
{
  "success": true,
  "code": 200,
  "data": {
    "total_days": 28,
    "continuous_days": 7,
    "completion_rate": 0.85,
    "mood_distribution": {
      "HAPPY": 12,
      "CALM": 8,
      "TIRED": 3,
      "EXCITED": 5
    },
    "weekly_stats": [
      {
        "week": "2024-W01",
        "completed_days": 6,
        "total_days": 7
      }
    ],
    "streak_info": {
      "current_streak": 7,
      "best_streak": 15,
      "streak_start_date": "2024-01-09"
    }
  }
}
```

## 📰 内容相关接口

### 1. 获取推荐内容
```http
GET /contents/recommended?page=1&limit=10
Authorization: Bearer {access_token}
```

**响应：**
```json
{
  "success": true,
  "code": 200,
  "data": {
    "items": [
      {
        "id": 1,
        "title": "如何培养早起的习惯？",
        "summary": "早起不仅能让你拥有更多时间...",
        "cover_image": "https://example.com/cover.jpg",
        "category": {
          "id": 1,
          "name": "生活方式",
          "slug": "lifestyle"
        },
        "author": "健康专家",
        "view_count": 1250,
        "like_count": 89,
        "published_at": "2024-01-15T09:00:00Z",
        "is_liked": false,
        "reading_time": 5
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "totalPages": 5
    }
  }
}
```

### 2. 获取内容详情
```http
GET /contents/1
Authorization: Bearer {access_token}
```

### 3. 获取内容分类
```http
GET /contents/categories
Authorization: Bearer {access_token}
```

### 4. 按分类获取内容
```http
GET /contents?category_id=1&page=1&limit=10
Authorization: Bearer {access_token}
```

### 5. 搜索内容
```http
GET /contents/search?q=早起&page=1&limit=10
Authorization: Bearer {access_token}
```

### 6. 内容交互操作
```http
POST /contents/1/like
Authorization: Bearer {access_token}
```

```http
POST /contents/1/view
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "duration": 120
}
```

## 🤖 AI聊天相关接口

### 1. 发送消息
```http
POST /ai/chat/send
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "message": "今天感觉有点累，不知道该怎么办",
  "role": "GENTLE",
  "session_id": 123
}
```

**响应：**
```json
{
  "success": true,
  "code": 200,
  "data": {
    "session_id": 123,
    "message_id": 456,
    "response": "听起来你今天过得不容易，来个大大的拥抱 🤗。累了就好好休息一下，明天又是新的开始呢！",
    "emotion_analysis": {
      "detected_emotion": "tired",
      "confidence": 0.85,
      "suggestions": ["rest", "relax", "self_care"]
    },
    "tokens_used": 45
  }
}
```

### 2. 获取聊天历史
```http
GET /ai/chat/history?session_id=123&page=1&limit=20
Authorization: Bearer {access_token}
```

### 3. 创建新会话
```http
POST /ai/chat/sessions
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "role": "GENTLE",
  "title": "今日心情分享"
}
```

### 4. 切换AI角色
```http
PUT /ai/chat/sessions/123/role
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "role": "SUNNY"
}
```

### 5. 获取会话列表
```http
GET /ai/chat/sessions?page=1&limit=10
Authorization: Bearer {access_token}
```

## 🌟 分享相关接口

### 1. 生成成长海报
```http
POST /share/poster/generate
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "template": "growth",
  "time_range": "month",
  "config": {
    "include_photos": true,
    "include_text": true,
    "include_stats": true
  }
}
```

**响应：**
```json
{
  "success": true,
  "code": 200,
  "message": "海报生成中",
  "data": {
    "task_id": "poster_task_123",
    "estimated_time": 30,
    "status": "PROCESSING"
  }
}
```

### 2. 获取海报生成状态
```http
GET /share/poster/status/poster_task_123
Authorization: Bearer {access_token}
```

### 3. 创建数据报告
```http
POST /share/report/generate
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "time_range": "quarter",
  "report_type": "comprehensive"
}
```

### 4. 生成分享链接
```http
POST /share/link/generate
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "content_type": "profile",
  "privacy_level": "public",
  "expires_in": 2592000
}
```

### 5. 创建云端备份
```http
POST /share/backup/create
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "backup_type": "full",
  "include_images": true
}
```

### 6. 获取分享历史
```http
GET /share/history?type=POSTER&page=1&limit=10
Authorization: Bearer {access_token}
```

## 🔔 通知相关接口

### 1. 获取通知列表
```http
GET /notifications?page=1&limit=20&type=SYSTEM
Authorization: Bearer {access_token}
```

### 2. 标记通知已读
```http
PUT /notifications/123/read
Authorization: Bearer {access_token}
```

### 3. 批量标记已读
```http
PUT /notifications/batch/read
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "notification_ids": [123, 124, 125]
}
```

### 4. 获取未读通知数量
```http
GET /notifications/unread/count
Authorization: Bearer {access_token}
```

### 5. 更新通知设置
```http
PUT /notifications/settings
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "checkin_reminder": true,
  "achievement_notification": true,
  "content_recommendation": false,
  "reminder_times": ["08:00", "20:00"]
}
```

## 📊 统计分析接口

### 1. 获取应用统计
```http
GET /analytics/dashboard
Authorization: Bearer {access_token}
```

### 2. 获取用户行为分析
```http
GET /analytics/behavior?period=month
Authorization: Bearer {access_token}
```

## 🔧 系统接口

### 1. 健康检查
```http
GET /health
```

### 2. 获取应用配置
```http
GET /config/app
```

### 3. 上传文件
```http
POST /upload/image
Authorization: Bearer {access_token}
Content-Type: multipart/form-data

file: [image file]
folder: checkins
```

## 📋 错误码定义

### 通用错误码
- `400` - 请求参数错误
- `401` - 未授权访问
- `403` - 权限不足
- `404` - 资源不存在
- `409` - 资源冲突
- `429` - 请求频率限制
- `500` - 服务器内部错误

### 业务错误码
- `10001` - 验证码错误或已过期
- `10002` - 用户不存在
- `10003` - 用户已被封禁
- `10004` - 令牌无效或已过期
- `20001` - 今日已完成打卡
- `20002` - 不在打卡时间范围内
- `30001` - 内容不存在或已下线
- `40001` - AI服务暂时不可用
- `50001` - 文件上传失败
- `50002` - 文件格式不支持

## 🚀 API使用示例

### JavaScript/TypeScript
```typescript
// 登录示例
const loginWithPhone = async (phone: string, code: string) => {
  try {
    const response = await fetch('/api/v1/auth/login/phone', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone,
        code,
        device_info: {
          device_id: 'web-client',
          platform: 'web',
          version: '1.0.0'
        }
      }),
    });
    
    const result = await response.json();
    
    if (result.success) {
      // 保存token
      localStorage.setItem('access_token', result.data.access_token);
      localStorage.setItem('refresh_token', result.data.refresh_token);
      return result.data;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('登录失败:', error);
    throw error;
  }
};

// 创建打卡记录示例
const createCheckin = async (checkinData: any) => {
  const token = localStorage.getItem('access_token');
  
  try {
    const response = await fetch('/api/v1/checkins', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(checkinData),
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('打卡失败:', error);
    throw error;
  }
};
```

---

**API设计说明：**
- 遵循RESTful设计原则，使用标准HTTP方法
- 统一的响应格式，便于前端处理
- 完善的错误处理和状态码定义
- 支持分页、搜索、筛选等常用功能
- JWT认证机制，保证API安全性 