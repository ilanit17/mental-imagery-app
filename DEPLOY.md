# הוראות להעלאת האפליקציה לאירוח ציבורי

## אפשרות 1: Vercel (מומלץ - הכי קל)

### שלב 1: התחברות ל-Vercel

1. לכו ל: https://vercel.com
2. לחצו "Sign Up" והתחברו עם חשבון GitHub שלכם
3. אשרו את הגישה ל-GitHub repositories

### שלב 2: ייבוא הפרויקט

1. ב-Vercel Dashboard, לחצו "Add New Project"
2. בחרו את ה-repository: `ilanit17/mental-imagery-app`
3. Vercel יזהה אוטומטית שזה Vite project

### שלב 3: הגדרת משתני סביבה

**חשוב מאוד!** לפני ה-deploy, הוסיפו את משתנה הסביבה:

1. בקטע "Environment Variables", לחצו "Add"
2. הוסיפו:
   - **Name**: `API_KEY`
   - **Value**: המפתח API שלכם מ-Google Gemini
   - בחרו את כל הסביבות (Production, Preview, Development)

3. לחצו "Deploy"

### שלב 4: קבלת הקישור

לאחר ה-deploy (2-3 דקות), תקבלו קישור ציבורי כמו:
```
https://mental-imagery-app.vercel.app
```

---

## אפשרות 2: Netlify

### שלב 1: התחברות

1. לכו ל: https://netlify.com
2. התחברו עם GitHub

### שלב 2: ייבוא הפרויקט

1. לחצו "Add new site" > "Import an existing project"
2. בחרו את ה-repository
3. הגדרות:
   - Build command: `npm run build`
   - Publish directory: `dist`

### שלב 3: משתני סביבה

1. Site settings > Environment variables
2. הוסיפו: `API_KEY` עם הערך שלכם

---

## אפשרות 3: GitHub Pages

1. ב-GitHub repository, לכו ל-Settings > Pages
2. בחרו Source: GitHub Actions
3. צרו workflow file (אני יכול לעזור בזה)

---

## הערות חשובות

⚠️ **מפתח API**: ודאו שהמפתח מוגדר כמשתנה סביבה ולא בקוד!

✅ **קישור ציבורי**: לאחר ה-deploy, תקבלו קישור שניתן לשתף עם כל אחד

🔄 **עדכונים אוטומטיים**: כל push ל-GitHub יעדכן את האפליקציה אוטומטית

---

## המלצה

**Vercel** הוא הכי קל ומהיר - פשוט התחברו עם GitHub, בחרו את ה-repo, הוסיפו את משתנה הסביבה `API_KEY`, ולחצו Deploy!

