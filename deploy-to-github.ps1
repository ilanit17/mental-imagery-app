# GitHub Deployment Script
# סקריפט להעלאת הפרויקט ל-GitHub

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "GitHub Deployment Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if remote exists
$existingRemote = git remote -v 2>$null
if ($existingRemote) {
    Write-Host "Found existing remote:" -ForegroundColor Yellow
    Write-Host $existingRemote -ForegroundColor Gray
    Write-Host ""
    $useExisting = Read-Host "Use existing remote? (y/n)"
    if ($useExisting -eq "n" -or $useExisting -eq "N") {
        git remote remove origin 2>$null
    } else {
        Write-Host "Using existing remote..." -ForegroundColor Green
        Write-Host ""
        Write-Host "Pushing to GitHub..." -ForegroundColor Cyan
        git push -u origin main
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "Success! Project uploaded to GitHub!" -ForegroundColor Green
            $remoteUrl = (git remote get-url origin)
            Write-Host "Link: $remoteUrl" -ForegroundColor Cyan
        }
        exit
    }
}

Write-Host "Step 1: Create Repository on GitHub" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray
Write-Host "1. Open browser and go to: https://github.com/new" -ForegroundColor White
Write-Host "2. Fill in the details:" -ForegroundColor White
Write-Host "   - Repository name: (e.g., mental-imagery-app)" -ForegroundColor Gray
Write-Host "   - Description: Mental Imagery App for Reading Comprehension" -ForegroundColor Gray
Write-Host "   - Select: Public (for public sharing)" -ForegroundColor Gray
Write-Host "   - Do NOT add README, .gitignore or license" -ForegroundColor Gray
Write-Host "3. Click 'Create repository'" -ForegroundColor White
Write-Host ""
Write-Host "After creating the repository, GitHub will show instructions." -ForegroundColor Yellow
Write-Host ""

$githubUsername = Read-Host "Enter your GitHub username"
$repoName = Read-Host "Enter the repository name"

if ([string]::IsNullOrWhiteSpace($githubUsername) -or [string]::IsNullOrWhiteSpace($repoName)) {
    Write-Host "Error: Username and repository name are required!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Setting up remote..." -ForegroundColor Cyan
$remoteUrl = "https://github.com/$githubUsername/$repoName.git"
git remote add origin $remoteUrl 2>$null

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error setting remote. It may already exist." -ForegroundColor Red
    Write-Host "Trying to remove and re-add..." -ForegroundColor Yellow
    git remote remove origin 2>$null
    git remote add origin $remoteUrl
}

Write-Host "Remote configured: $remoteUrl" -ForegroundColor Green
Write-Host ""

Write-Host "Pushing to GitHub..." -ForegroundColor Cyan
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "Success! Project uploaded to GitHub!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Public link:" -ForegroundColor Cyan
    Write-Host "https://github.com/$githubUsername/$repoName" -ForegroundColor White
    Write-Host ""
    Write-Host "You can share this link with others!" -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "Error uploading project" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Possible solutions:" -ForegroundColor Yellow
    Write-Host "1. Make sure you created the repository on GitHub" -ForegroundColor White
    Write-Host "2. Make sure the username and repository name are correct" -ForegroundColor White
    Write-Host "3. Make sure you have push permissions" -ForegroundColor White
    Write-Host "4. Try running manually: git push -u origin main" -ForegroundColor White
}
