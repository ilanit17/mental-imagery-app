# פתרון מהיר - GitHub Pages לא רץ

## שלבים מהירים לפתרון

### שלב 1: ודאו ש-GitHub Pages מופעל

1. לכו ל: https://github.com/ilanit17/mental-imagery-app/settings/pages
2. תחת **Source**, ודאו שבחרתם: **GitHub Actions** (לא "Deploy from a branch")
3. אם לא - בחרו "GitHub Actions" ושמרו

### שלב 2: הוסיפו את ה-API_KEY Secret

1. לכו ל: https://github.com/ilanit17/mental-imagery-app/settings/secrets/actions
2. לחצו **"New repository secret"**
3. מלאו:
   - **Name**: `API_KEY`
   - **Value**: המפתח API שלכם
4. לחצו **"Add secret"**

### שלב 3: הפעילו את ה-Workflow ידנית

1. לכו ל: https://github.com/ilanit17/mental-imagery-app/actions
2. לחצו על **"Deploy to GitHub Pages"** או **"Deploy to GitHub Pages (Simple)"**
3. לחצו **"Run workflow"** > **"Run workflow"**
4. המתינו 2-3 דקות

### שלב 4: בדקו את התוצאה

1. אחרי ה-run, לחצו עליו
2. אם יש שגיאה - לחצו על "build" כדי לראות מה השגיאה
3. שלחו לי את השגיאה ואתקן

---

## אם עדיין לא עובד

### אפשרות A: נסו את ה-Workflow הפשוט

יצרתי workflow חדש בשם `deploy-simple.yml` שהוא פשוט יותר. נסו להריץ אותו:

1. לכו ל-Actions
2. בחרו **"Deploy to GitHub Pages (Simple)"**
3. לחצו **"Run workflow"**

### אפשרות B: השתמשו ב-Vercel (הכי קל)

אם GitHub Pages לא עובד, Vercel הוא הרבה יותר קל:

1. לכו ל: https://vercel.com
2. התחברו עם GitHub
3. בחרו את ה-repository
4. הוסיפו `API_KEY` כמשתנה סביבה
5. לחצו Deploy

זה יעבוד תוך 2 דקות!

---

## מה עשיתי

1. ✅ יצרתי workflow פשוט יותר (`deploy-simple.yml`)
2. ✅ שיפרתי את ה-workflow הקיים
3. ✅ הוספתי הוראות ברורות

נסו את השלבים למעלה ותגידו לי מה קורה!

