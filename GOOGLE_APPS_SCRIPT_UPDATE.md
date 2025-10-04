# تحديث Google Apps Script لدعم سجل التعديلات

## الخطوات المطلوبة:

### 1. إنشاء شيت جديد
- افتح Google Spreadsheet الخاص بك
- أضف شيت جديد بالضغط على زر "+"
- اسم الشيت: `UpdatesLog`
- في الصف الأول، أضف العناوين التالية:
  - `serial` | `updatedBy` | `updatedAt` | `fieldName` | `oldValue` | `newValue`

### 2. تحديث كود Google Apps Script

استبدل الكود الموجود في Google Apps Script بالكود التالي:

```javascript
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    if (action === 'updateRow') {
      return handleUpdateRow(data);
    } else if (action === 'logUpdate') {
      return handleLogUpdate(data);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: 'Unknown action'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function handleUpdateRow(data) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheetName = data.sheetName || 'Sheet1';
  const sheet = spreadsheet.getSheetByName(sheetName);
  
  if (!sheet) {
    throw new Error('Sheet not found: ' + sheetName);
  }
  
  const rowIndex = data.rowIndex;
  const values = data.values;
  
  // Update the entire row
  const range = sheet.getRange(rowIndex, 1, 1, values.length);
  range.setValues([values]);
  
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    message: 'Row updated successfully'
  })).setMimeType(ContentService.MimeType.JSON);
}

function handleLogUpdate(data) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheetName = data.sheetName || 'UpdatesLog';
  let sheet = spreadsheet.getSheetByName(sheetName);
  
  // Create sheet if it doesn't exist
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
    // Add headers
    sheet.getRange(1, 1, 1, 6).setValues([[
      'serial', 'updatedBy', 'updatedAt', 'fieldName', 'oldValue', 'newValue'
    ]]);
  }
  
  const updateData = data.updateData;
  
  // Append new row with update data
  sheet.appendRow([
    updateData.serial,
    updateData.updatedBy,
    updateData.updatedAt,
    updateData.fieldName,
    updateData.oldValue,
    updateData.newValue
  ]);
  
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    message: 'Update logged successfully'
  })).setMimeType(ContentService.MimeType.JSON);
}
```

### 3. نشر السكريبت
1. احفظ السكريبت
2. اضغط على "Deploy" > "New deployment"
3. اختر "Web app"
4. اختر "Execute as: Me"
5. اختر "Who has access: Anyone"
6. اضغط "Deploy"
7. انسخ الـ URL الجديد

### 4. تحديث الـ URL في Replit
- ارجع لـ Replit
- افتح Secrets
- تأكد أن `VITE_GOOGLE_APPS_SCRIPT_URL` يحتوي على الـ URL الجديد

## الميزات الجديدة:

✅ **سجل التعديلات**: كل تعديل يتم حفظه في شيت UpdatesLog
✅ **تتبع التغييرات**: يتم حفظ القيمة القديمة والجديدة
✅ **معلومات المستخدم**: يتم حفظ اسم المستخدم ووقت التعديل
✅ **صفحة سجل التعديلات**: يمكن للأدمن مشاهدة كل التعديلات

## ملاحظة مهمة:
- إذا كان الشيت `UpdatesLog` غير موجود، السكريبت سيقوم بإنشائه تلقائياً
- التعديلات ستظهر فوراً في صفحة "سجل التعديلات" (للأدمن فقط)
