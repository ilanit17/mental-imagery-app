#!/bin/bash
# סקריפט להעלאת הפרויקט ל-GitHub
# GitHub Deployment Script

echo "========================================"
echo "העלאת הפרויקט ל-GitHub"
echo "GitHub Deployment Script"
echo "========================================"
echo ""

# בדיקה אם יש remote כבר
EXISTING_REMOTE=$(git remote -v 2>/dev/null)
if [ ! -z "$EXISTING_REMOTE" ]; then
    echo "נמצא remote קיים:"
    echo "$EXISTING_REMOTE"
    echo ""
    read -p "האם להשתמש ב-remote הקיים? (y/n) " use_existing
    if [ "$use_existing" = "n" ] || [ "$use_existing" = "N" ]; then
        git remote remove origin 2>/dev/null
    else
        echo "משתמש ב-remote הקיים..."
        echo ""
        echo "דוחף שינויים ל-GitHub..."
        git push -u origin main
        if [ $? -eq 0 ]; then
            echo ""
            echo "✓ הפרויקט הועלה בהצלחה!"
            REMOTE_URL=$(git remote get-url origin)
            echo "קישור: $REMOTE_URL"
        fi
        exit 0
    fi
fi

echo "שלב 1: יצירת Repository ב-GitHub"
echo "----------------------------------------"
echo "1. פתחו את הדפדפן ולכו ל: https://github.com/new"
echo "2. מלאו את הפרטים:"
echo "   - Repository name: (לדוגמה: mental-imagery-app)"
echo "   - Description: Mental Imagery App for Reading Comprehension"
echo "   - בחרו: Public (לשיתוף ציבורי)"
echo "   - אל תוסיפו README, .gitignore או license"
echo "3. לחצו 'Create repository'"
echo ""
echo "לאחר יצירת ה-repository, GitHub יציג הוראות."
echo ""

read -p "הזינו את שם המשתמש ב-GitHub (username): " github_username
read -p "הזינו את שם ה-Repository: " repo_name

if [ -z "$github_username" ] || [ -z "$repo_name" ]; then
    echo "שגיאה: שם משתמש ושם repository נדרשים!"
    exit 1
fi

echo ""
echo "מגדיר remote..."
REMOTE_URL="https://github.com/$github_username/$repo_name.git"
git remote add origin "$REMOTE_URL" 2>/dev/null

if [ $? -ne 0 ]; then
    echo "שגיאה בהגדרת remote. ייתכן שהוא כבר קיים."
    echo "מנסה להסיר ולהגדיר מחדש..."
    git remote remove origin 2>/dev/null
    git remote add origin "$REMOTE_URL"
fi

echo "✓ Remote הוגדר: $REMOTE_URL"
echo ""

echo "דוחף שינויים ל-GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "========================================"
    echo "✓ הפרויקט הועלה בהצלחה ל-GitHub!"
    echo "========================================"
    echo ""
    echo "קישור ציבורי:"
    echo "https://github.com/$github_username/$repo_name"
    echo ""
    echo "ניתן לשתף את הקישור הזה עם אחרים!"
else
    echo ""
    echo "========================================"
    echo "שגיאה בהעלאת הפרויקט"
    echo "========================================"
    echo ""
    echo "אפשרויות לפתרון:"
    echo "1. ודאו שיצרתם את ה-repository ב-GitHub"
    echo "2. ודאו שהשם ושם המשתמש נכונים"
    echo "3. ודאו שיש לכם הרשאות ל-push"
    echo "4. נסו להריץ ידנית: git push -u origin main"
fi

