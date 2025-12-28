# פתרון בעיית API_KEY ב-GitHub Pages

## הבעיה

האפליקציה עלתה ל-GitHub Pages, אבל יש שגיאה ביצירת הטקסט כי ה-API_KEY לא נגיש.

## הפתרון

### שלב 1: ודאו שה-API_KEY מוגדר ב-GitHub Secrets

1. לכו ל: https://github.com/ilanit17/mental-imagery-app/settings/secrets/actions
2. ודאו שיש Secret בשם `API_KEY` עם המפתח שלכם
3. אם אין - הוסיפו אותו

### שלב 2: הפעילו את ה-Workflow מחדש

לאחר שה-API_KEY מוגדר, צריך לבנות מחדש:

1. לכו ל: https://github.com/ilanit17/mental-imagery-app/actions
2. לחצו על "Deploy to GitHub Pages (Simple)"
3. לחצו "Run workflow" > "Run workflow"
4. המתינו 2-3 דקות

### שלב 3: בדיקה

לאחר ה-build, נסו שוב ליצור טקסט. זה אמור לעבוד!

---

## למה זה קורה?

ב-GitHub Pages, הקוד הוא static - כלומר הוא נבנה פעם אחת ומוגש כקבצים. ה-API_KEY צריך להיות מוגדר **בזמן ה-build**, לא בזמן הריצה.

כשאתם מגדירים את ה-API_KEY ב-GitHub Secrets, הוא זמין ל-workflow בזמן ה-build, והוא נבנה לתוך הקוד.

---

## הערה חשובה על אבטחה

⚠️ **שימו לב**: ב-GitHub Pages, ה-API_KEY נבנה לתוך הקוד JavaScript, מה שאומר שהוא גלוי לכל מי שיפתח את הקוד ב-browser.

**אם זה בעיה**, מומלץ להשתמש ב-Vercel או Netlify, שמאפשרים להגדיר משתני סביבה בצורה בטוחה יותר.

---

## אם עדיין לא עובד

1. בדקו את ה-logs של ה-build ב-Actions
2. ודאו שה-API_KEY מוגדר נכון
3. נסו להריץ את ה-workflow שוב

