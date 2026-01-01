# פתרון סופי - API_KEY לא נבנה לתוך הקוד

## הבעיה

השגיאה אומרת: `API_KEY is not configured`

זה אומר שה-API_KEY לא נבנה לתוך הקוד בזמן ה-build.

## הפתרון - 3 שלבים

### שלב 1: ודאו שה-API_KEY מוגדר ב-GitHub Secrets

1. לכו ל: **https://github.com/ilanit17/mental-imagery-app/settings/secrets/actions**
2. בדקו אם יש Secret בשם `API_KEY`
3. אם **אין** - הוסיפו אותו:
   - לחצו **"New repository secret"**
   - **Name**: `API_KEY` (חייב להיות בדיוק כך!)
   - **Value**: המפתח API שלכם מ-Google Gemini
   - לחצו **"Add secret"**

### שלב 2: הפעילו את ה-Workflow מחדש

**חשוב מאוד!** אחרי שהוספתם את ה-API_KEY, צריך לבנות מחדש:

1. לכו ל: **https://github.com/ilanit17/mental-imagery-app/actions**
2. לחצו על **"Deploy to GitHub Pages (Simple)"**
3. לחצו **"Run workflow"** > **"Run workflow"**
4. המתינו 2-3 דקות עד שה-build מסתיים

### שלב 3: בדיקה

לאחר ה-build:
1. רעננו את האפליקציה: https://ilanit17.github.io/mental-imagery-app/
2. נסו ליצור טקסט
3. זה אמור לעבוד!

---

## למה זה קורה?

ב-GitHub Pages, הקוד הוא **static** - כלומר הוא נבנה פעם אחת ומוגש כקבצים. ה-API_KEY צריך להיות מוגדר **בזמן ה-build**, לא בזמן הריצה.

כשאתם מגדירים את ה-API_KEY ב-GitHub Secrets, הוא זמין ל-workflow בזמן ה-build, והוא נבנה לתוך הקוד JavaScript.

---

## אם עדיין לא עובד

### בדיקה 1: האם ה-Workflow רץ עם ה-API_KEY?

1. לכו ל-Actions
2. לחצו על ה-run האחרון
3. לחצו על "build-and-deploy"
4. לחצו על "Verify API_KEY in build"
5. מה כתוב שם? האם כתוב "✅ API_KEY secret is set"?

אם כתוב "❌ ERROR" - זה אומר שה-API_KEY לא מוגדר ב-Secrets.

### בדיקה 2: האם ה-API_KEY נבנה לתוך הקוד?

1. פתחו את האפליקציה: https://ilanit17.github.io/mental-imagery-app/
2. לחצו F12 > Network
3. רעננו את הדף
4. מצאו את קובץ ה-JavaScript הראשי (כנראה `index-[hash].js`)
5. לחצו עליו > Response
6. חפשו "API_KEY" - האם יש ערך שם?

אם לא, זה אומר שה-API_KEY לא נבנה לתוך הקוד, וצריך להריץ את ה-workflow שוב.

---

## פתרון חלופי: Vercel (מומלץ מאוד!)

אם GitHub Pages עדיין לא עובד, **Vercel הוא הרבה יותר קל ובטוח**:

1. לכו ל: **https://vercel.com**
2. התחברו עם GitHub
3. בחרו את ה-repository: `ilanit17/mental-imagery-app`
4. הוסיפו `API_KEY` כמשתנה סביבה
5. לחצו **Deploy**

זה יעבוד תוך 2 דקות, וה-API_KEY יהיה בטוח יותר!

---

## סיכום

**הבעיה**: ה-API_KEY לא מוגדר ב-GitHub Secrets או שה-workflow לא רץ מחדש אחרי שהוספתם אותו.

**הפתרון**: 
1. הוסיפו את ה-API_KEY ב-Secrets
2. הריצו את ה-workflow שוב
3. המתינו ל-build

או פשוט השתמשו ב-Vercel - זה הרבה יותר קל! 🚀

