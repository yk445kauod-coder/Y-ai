# نظام القدرات - Skills System

## نظرة عامة

نظام القدرات في AILA هو نظام معياري يتيح إضافة قدرات جديدة للنظام دون تعديل النواة الأساسية.

---

## هيكل النظام

```
┌─────────────────────────────────────────────────────────────────┐
│                     AILA SKILLS SYSTEM                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                  Skill Invoker                          │    │
│  │  • تحليل طلبات المستخدمين                                │    │
│  │  • استخراج النية (Intent)                              │    │
│  │  • اختيار المهارات المناسبة                            │    │
│  │  • تنفيذ سلسلة مهارات                                  │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                  Skill Registry                         │    │
│  │  • تسجيل/إلغاء تسجيل المهارات                         │    │
│  │  • البحث والتصفية                                      │    │
│  │  • الإحصائيات                                         │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                   Skills                                │    │
│  │                                                           │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │    │
│  │  │  Coding    │  │   Search   │  │ Communication│      │    │
│  │  │   Skill    │  │   Skill    │  │    Skill    │      │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘      │    │
│  │                                                           │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │    │
│  │  │  Analysis   │  │  Creative  │  │    IoT     │      │    │
│  │  │   Skill    │  │   Skill    │  │    Skill    │      │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘      │    │
│  │                                                           │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## أنواع القدرات

### 1. قدرات البرمجة (Coding Skills)
```typescript
- كتابة الأكواد
- مراجعة الكود
- إصلاح الأخطاء
- تحسين الأداء
- كتابة الاختبارات
- إنشاء التوثيق
```

### 2. قدرات البحث (Research Skills)
```typescript
- البحث في الويب
- تحليل المستندات
- البحث الأكاديمي
- تحليل البيانات
```

### 3. قدرات التواصل (Communication Skills)
```typescript
- إرسال البريد الإلكتروني
- إرسال الرسائل
- إدارة التقويم
- إدارة المهام
```

### 4. قدرات التحليل (Analysis Skills)
```typescript
- تحليل البيانات
- المقارنة
- التقارير
- التصور
```

### 5. قدرات الإبداع (Creative Skills)
```typescript
- كتابة المحتوى
- التصميم
- إنشاء الصور
- الكتابة الإبداعية
```

### 6. قدرات IoT
```typescript
- التحكم بالأجهزة الذكية
- قراءة المستشعرات
- الأتمتة المنزلية
```

---

## نظام استدعاء القدرات

### Intent Analysis
```typescript
const invoker = getSkillInvoker();

// تحليل طلب المستخدم
const analysis = await invoker.analyzeIntent(
  "ابحث عن أفضل laptop ثم قارن الأسعار"
);

// النتيجة:
// {
//   intents: [{ primary: 'search', secondary: ['analysis'] }],
//   suggestedSkills: ['web-search', 'data-analysis'],
//   requiresMultipleSkills: true
// }
```

### Skill Execution
```typescript
// تنفيذ تلقائي للمهارات
const result = await invoker.invoke(
  "اكتب دالة لفرز مصفوفة في JavaScript"
);

// النتيجة:
// {
//   success: true,
//   results: [...],
//   skillsUsed: ['coding'],
//   output: { code: '...', explanation: '...' }
// }
```

---

## نظام الوظائف (Functions)

### الوظائف المباشرة المتاحة

```typescript
// File Operations
CreateFile(path, content)
ReadFile(path)
DeleteFile(path)
ListDirectory(path, recursive)

// System Operations
RunCommand(command)
OpenApplication(name)
CloseApplication(name)
LockScreen()
RestartComputer()

// Browser Operations
OpenBrowser(url)
TakeScreenshot(fullPage)

// Communication
SendEmail(to, subject, body)
SendMessage(platform, recipient, message)

// Media
TakePhoto(camera)
RecordAudio(duration)
Speak(text, voice)

// AI Operations
GenerateImage(prompt, size)
TranslateText(text, targetLanguage)

// IoT
ControlDevice(deviceId, action, value)
GetSensorData(deviceId, sensor)

// Utility
ReadClipboard()
WriteClipboard(text)
SendNotification(title, body)
GetCurrentTime(timezone)
Calculate(expression)
```

---

## نظام سير العمل (Workflows)

### إنشاء سير عمل
```typescript
const workflow = workflowEngine.createFromTemplate({
  name: "بحث وإنشاء تقرير",
  steps: [
    { name: "البحث", type: "action", config: { action: { function: "webSearch", parameters: { query: "AI trends 2024" } } },
    { name: "التحليل", type: "action", config: { action: { function: "analyzeData", parameters: {} } } },
    { name: "التقرير", type: "action", config: { action: { function: "createReport", parameters: {} } } }
  ],
  entryPoint: "البحث"
});

// تنفيذ سير العمل
const execution = await workflowEngine.execute(workflow.id, { topic: "AI" });
```

---

## نظام الجسور (Bridges)

### الجسور المتاحة
```typescript
// Browser Bridge
browserBridge.connect();
browserBridge.send({ action: "navigate", payload: { url: "..." } });

// GitHub Bridge
githubBridge.connect({ token: "..." });
githubBridge.send({ action: "createIssue", payload: { owner, repo, title, body } });

// Discord Bridge
discordBridge.connect({ webhookUrl: "..." });
discordBridge.send({ action: "sendMessage", payload: { content: "..." } });

// MQTT Bridge (IoT)
mqttBridge.connect({ brokerUrl: "mqtt://..." });
mqttBridge.send({ action: "publish", payload: { topic: "home/light", message: "on" } });

// Bluetooth Bridge
bluetoothBridge.connect({ deviceId: "..." });
```

---

## ملفات الإعداد (.md)

### ملفات الإعداد المتاحة
```typescript
// persona.md - شخصية AILA
// owner.md - معلومات المالك
// memory.md - إعدادات الذاكرة
// voice.md - إعدادات الصوت
// skills.md - إعدادات القدرات
// security.md - إعدادات الأمان
// automation.md - سير العمل
// wakewords.md - كلمات التنبيه

// الحصول على ملف إعدادات
const persona = configManager.get('persona');
console.log(persona.content);

// تحديث ملف إعدادات
await configManager.update('persona', '# شخصية جديدة\n\n...');

// تحليل إلى كائن
const config = configManager.parse('memory');
```

---

## الأمان

### مستويات الخطورة
```typescript
type DangerLevel = 'safe' | 'low' | 'medium' | 'high' | 'critical';

// الوظائف الحرجة تتطلب تأكيد
const result = await functionRegistry.execute({
  functionName: 'DeleteFile',
  parameters: { path: '/important/file.txt' }
});
// يتطلب تأكيد المستخدم
```

---

## API Reference

### SkillInvoker
```typescript
interface SkillInvoker {
  analyzeIntent(request: string, context?: Record<string, unknown>): Promise<IntentAnalysis>;
  invoke(request: string, context?: Record<string, unknown>, options?: InvocationOptions): Promise<InvocationResult>;
  executeChain(executions: SkillExecution[], context?: Record<string, unknown>): Promise<SkillChain>;
}
```

### FunctionRegistry
```typescript
interface FunctionRegistry {
  register(definition: FunctionDefinition, executor: FunctionExecutor): void;
  execute(request: FunctionCallRequest): Promise<FunctionCallResult>;
  getAllDefinitions(): FunctionDefinition[];
  getByCategory(category: FunctionCategory): FunctionDefinition[];
}
```

### WorkflowEngine
```typescript
interface WorkflowEngine {
  register(workflow: WorkflowDefinition): void;
  execute(workflowId: string, input?: Record<string, unknown>): Promise<WorkflowExecution>;
  cancelExecution(executionId: string): boolean;
  getExecution(executionId: string): WorkflowExecution | undefined;
}
```

### BridgeManager
```typescript
interface BridgeManager {
  register(bridge: IBridge): void;
  connectAll(): Promise<void>;
  send(bridgeId: string, message: BridgeMessage): Promise<unknown>;
  getByType(type: BridgeType): IBridge[];
}
```

---

## أمثلة

### مثال 1: طلب بسيط
```typescript
const invoker = getSkillInvoker();
const result = await invoker.invoke("اكتب كود Hello World");
```

### مثال 2: طلب معقد
```typescript
const result = await invoker.invoke(
  "ابحث عن أفضل laptop للتصميم، قارن الأسعار، وأرسل النتائج بالبريد"
);
```

### مثال 3: سير عمل
```typescript
const workflow = createDailyReportWorkflow();
const execution = await workflowEngine.execute(workflow.id);
```

---

## التوسعة

### إضافة Skill جديد
```typescript
class MyCustomSkill implements Skill {
  readonly id = 'my-custom-skill';
  readonly name = 'مهارة مخصصة';
  // ...
}

const registry = getSkillRegistry();
await registry.register(new MyCustomSkill());
```

### إضافة Function جديد
```typescript
functionRegistry.register({
  name: 'MyFunction',
  description: 'وظيفتي المخصصة',
  category: 'utility',
  dangerLevel: 'safe',
  parameters: [...]
}, async (params) => {
  // التنفيذ
  return { success: true, output: '...' };
});
```

### إضافة Bridge جديد
```typescript
class MyBridge extends BaseBridge {
  // ...
}

bridgeManager.register(new MyBridge({ id: 'my-bridge', type: 'custom' }));
```

---

## الملاحظات

- جميع القدرات تعمل بشكل مستقل
- يمكن تعطيل أي قدرة دون التأثير على الباقي
- النظام يدعم التوسع اللاحق
- الإعدادات قابلة للتتبع باستخدام Git
