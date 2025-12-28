# סקריפט להעלאת הפרויקט ל-GitHub
# PowerShell Script for GitHub Deployment

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "העלאת הפרויקט ל-GitHub" -ForegroundColor Cyan
Write-Host "GitHub Deployment Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# בדיקה אם יש remote כבר
$existingRemote = git remote -v
if ($existingRemote) {
    Write-Host "נמצא remote קיים:" -ForegroundColor Yellow
    Write-Host $existingRemote -ForegroundColor Gray
    Write-Host ""
    $useExisting = Read-Host "האם להשתמש ב-remote הקיים? (y/n)"
    if ($useExisting -eq "n" -or $useExisting -eq "N") {
        git remote remove origin 2>$null
    } else {
        Write-Host "משתמש ב-remote הקיים..." -ForegroundColor Green
        Write-Host ""
        Write-Host "דוחף שינויים ל-GitHub..." -ForegroundColor Cyan
        git push -u origin main
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "✓ הפרויקט הועלה בהצלחה!" -ForegroundColor Green
            $remoteUrl = (git remote get-url origin)
            Write-Host "קישור: $remoteUrl" -ForegroundColor Cyan
        }
        exit
    }
}

Write-Host "שלב 1: יצירת Repository ב-GitHub" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray
Write-Host "1. פתחו את הדפדפן ולכו ל: https://github.com/new" -ForegroundColor White
Write-Host "2. מלאו את הפרטים:" -ForegroundColor White
Write-Host "   - Repository name: (לדוגמה: mental-imagery-app)" -ForegroundColor Gray
Write-Host "   - Description: Mental Imagery App for Reading Comprehension" -ForegroundColor Gray
Write-Host "   - בחרו: Public (לשיתוף ציבורי)" -ForegroundColor Gray
Write-Host "   - אל תוסיפו README, .gitignore או license" -ForegroundColor Gray
Write-Host "3. לחצו 'Create repository'" -ForegroundColor White
Write-Host ""
Write-Host "לאחר יצירת ה-repository, GitHub יציג הוראות." -ForegroundColor Yellow
Write-Host ""

$githubUsername = Read-Host "הזינו את שם המשתמש ב-GitHub (username)"
$repoName = Read-Host "הזינו את שם ה-Repository"

if ([string]::IsNullOrWhiteSpace($githubUsername) -or [string]::IsNullOrWhiteSpace($repoName)) {
    Write-Host "שגיאה: שם משתמש ושם repository נדרשים!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "מגדיר remote..." -ForegroundColor Cyan
$remoteUrl = "https://github.com/$githubUsername/$repoName.git"
git remote add origin $remoteUrl

if ($LASTEXITCODE -ne 0) {
    Write-Host "שגיאה בהגדרת remote. ייתכן שהוא כבר קיים." -ForegroundColor Red
    Write-Host "מנסה להסיר ולהגדיר מחדש..." -ForegroundColor Yellow
    git remote remove origin 2>$null
    git remote add origin $remoteUrl
}

Write-Host "✓ Remote הוגדר: $remoteUrl" -ForegroundColor Green
Write-Host ""

Write-Host "דוחף שינויים ל-GitHub..." -ForegroundColor Cyan
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✓ הפרויקט הועלה בהצלחה ל-GitHub!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "קישור ציבורי:" -ForegroundColor Cyan
    Write-Host "https://github.com/$githubUsername/$repoName" -ForegroundColor White
    Write-Host ""
    Write-Host "ניתן לשתף את הקישור הזה עם אחרים!" -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "שגיאה בהעלאת הפרויקט" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "אפשרויות לפתרון:" -ForegroundColor Yellow
    Write-Host "1. ודאו שיצרתם את ה-repository ב-GitHub" -ForegroundColor White
    Write-Host "2. ודאו שהשם ושם המשתמש נכונים" -ForegroundColor White
    Write-Host "3. ודאו שיש לכם הרשאות ל-push" -ForegroundColor White
    Write-Host "4. נסו להריץ ידנית: git push -u origin main" -ForegroundColor White
}

