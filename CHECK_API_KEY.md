# בדיקה מהירה - האם ה-API_KEY מוגדר?

## שלב 1: בדיקת GitHub Secrets

1. לכו ל: https://github.com/ilanit17/mental-imagery-app/settings/secrets/actions
2. בדקו אם יש Secret בשם `API_KEY`
3. אם **אין** - הוסיפו אותו:
   - לחצו "New repository secret"
   - **Name**: `API_KEY` (חייב להיות בדיוק כך!)
   - **Value**: המפתח API שלכם מ-Google Gemini
   - לחצו "Add secret"

## שלב 2: הפעלת ה-Workflow מחדש

**חשוב מאוד!** אחרי שהוספתם את ה-API_KEY, צריך לבנות מחדש:

1. לכו ל: https://github.com/ilanit17/mental-imagery-app/actions
2. לחצו על "Deploy to GitHub Pages (Simple)"
3. לחצו "Run workflow" > "Run workflow"
4. המתינו 2-3 דקות עד שה-build מסתיים

## שלב 3: בדיקה בדפדפן

1. פתחו את האפליקציה: https://ilanit17.github.io/mental-imagery-app/
2. לחצו F12 כדי לפתוח את ה-Developer Tools
3. לכו ל-Console
4. נסו ליצור טקסט
5. אם יש שגיאה, תראו אותה ב-Console

---

## אם עדיין לא עובד

### בדיקה 1: האם ה-API_KEY נבנה לתוך הקוד?

1. פתחו את האפליקציה: https://ilanit17.github.io/mental-imagery-app/
2. לחצו F12 > Network
3. רעננו את הדף
4. מצאו את קובץ ה-JavaScript הראשי (כנראה `index-[hash].js`)
5. לחצו עליו > Response
6. חפשו "API_KEY" - האם יש ערך שם?

אם לא, זה אומר שה-API_KEY לא נבנה לתוך הקוד, וצריך להריץ את ה-workflow שוב.

### בדיקה 2: האם ה-Workflow רץ עם ה-API_KEY?

1. לכו ל-Actions
2. לחצו על ה-run האחרון
3. לחצו על "build-and-deploy"
4. לחצו על "Check if API_KEY secret exists"
5. מה כתוב שם? האם כתוב "✅ API_KEY secret is set"?

---

## פתרון חלופי: Vercel (מומלץ)

אם GitHub Pages לא עובד, Vercel הוא הרבה יותר קל:

1. לכו ל: https://vercel.com
2. התחברו עם GitHub
3. בחרו את ה-repository
4. הוסיפו `API_KEY` כמשתנה סביבה
5. לחצו Deploy

זה יעבוד תוך 2 דקות!

