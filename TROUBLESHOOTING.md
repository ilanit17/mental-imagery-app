# פתרון בעיות - GitHub Pages Deployment

## בעיה: Build נכשל

אם ה-build נכשל, בדקו את הדברים הבאים:

### 1. בדיקת ה-API_KEY Secret

**חשוב מאוד!** ודאו שה-API_KEY מוגדר:

1. לכו ל: https://github.com/ilanit17/mental-imagery-app/settings/secrets/actions
2. בדקו שיש Secret בשם `API_KEY`
3. אם אין - לחצו "New repository secret" והוסיפו:
   - **Name**: `API_KEY`
   - **Value**: המפתח API שלכם מ-Google Gemini

### 2. בדיקת ה-Logs

1. לכו ל-Actions ב-repository
2. לחצו על ה-run שנכשל
3. לחצו על ה-job "build"
4. קראו את השגיאה המדויקת

### 3. שגיאות נפוצות

#### שגיאה: "API_KEY is not defined"
**פתרון**: הוסיפו את ה-API_KEY כ-Secret (ראה סעיף 1)

#### שגיאה: "Module not found" או "Cannot find module"
**פתרון**: 
```bash
npm install
git add package-lock.json
git commit -m "Add package-lock.json"
git push
```

#### שגיאה: "Build failed" ללא פרטים
**פתרון**: 
1. בדקו את ה-logs המלאים
2. נסו לבנות מקומית: `npm run build`
3. אם זה עובד מקומית, הבעיה היא ב-GitHub Actions

### 4. בדיקה מקומית

לפני push, בדקו שהבנייה עובדת מקומית:

```bash
npm install
npm run build
```

אם זה עובד מקומית אבל לא ב-GitHub, הבעיה היא כנראה ב-Secrets או ב-environment variables.

### 5. איפוס ה-Workflow

אם כלום לא עובד:

1. מחקו את ה-workflow הקיים (או אני יכול לעזור)
2. צרו workflow חדש
3. ודאו שה-API_KEY מוגדר

---

## עדכון ה-Workflow

אם תרצו, אני יכול לעדכן את ה-workflow עם הודעות שגיאה טובות יותר.

---

## פנייה לעזרה

אם הבעיה נמשכת, שלחו:
1. את השגיאה המדויקת מה-logs
2. תמונה של ה-Actions page
3. האם ה-API_KEY מוגדר

