# הוראות להעלאת האפליקציה ל-GitHub Pages

## שלב 1: הפעלת GitHub Pages

1. לכו ל-repository שלכם: https://github.com/ilanit17/mental-imagery-app
2. לחצו על **Settings** (הגדרות)
3. בתפריט השמאלי, לחצו על **Pages**
4. תחת **Source**, בחרו:
   - **Source**: `GitHub Actions` (לא "Deploy from a branch")
5. שמרו את השינויים

## שלב 2: הוספת מפתח API כ-Secret

**חשוב מאוד!** האפליקציה צריכה את מפתח ה-API של Gemini.

1. ב-Settings, לחצו על **Secrets and variables** > **Actions**
2. לחצו **New repository secret**
3. מלאו:
   - **Name**: `API_KEY`
   - **Value**: המפתח API שלכם מ-Google Gemini
4. לחצו **Add secret**

## שלב 3: הפעלת ה-Deployment

1. לכו ל-**Actions** ב-repository
2. לחצו על ה-workflow **Deploy to GitHub Pages**
3. לחצו **Run workflow** > **Run workflow**
4. המתנו 2-3 דקות

## שלב 4: קבלת הקישור

לאחר ה-deployment, הקישור הציבורי יהיה:
```
https://ilanit17.github.io/mental-imagery-app/
```

**הערה**: הקישור יופיע גם ב-Settings > Pages לאחר ה-deployment הראשון.

---

## עדכונים אוטומטיים

מעתה, כל push ל-branch `main` יעדכן אוטומטית את האפליקציה!

---

## הבדלים בין GitHub Pages ל-Vercel

| תכונה | GitHub Pages | Vercel |
|------|-------------|--------|
| קישור | `username.github.io/repo-name` | `app-name.vercel.app` |
| מהירות | טוב | מהיר יותר |
| משתני סביבה | דרך Secrets | דרך Dashboard |
| עדכונים | אוטומטי | אוטומטי |
| קל לשימוש | בינוני | קל מאוד |

**המלצה**: אם אתם כבר משתמשים ב-GitHub, GitHub Pages הוא בחירה טובה!

