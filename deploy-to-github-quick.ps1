# Quick GitHub Deployment Script
# Usage: .\deploy-to-github-quick.ps1 -Username "your-username" -RepoName "repo-name"

param(
    [Parameter(Mandatory=$true)]
    [string]$Username,
    
    [Parameter(Mandatory=$true)]
    [string]$RepoName
)

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
            Write-Host "Link: https://github.com/$Username/$RepoName" -ForegroundColor Cyan
        }
        exit
    }
}

Write-Host "Setting up remote..." -ForegroundColor Cyan
$remoteUrl = "https://github.com/$Username/$RepoName.git"
git remote remove origin 2>$null
git remote add origin $remoteUrl

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error setting remote." -ForegroundColor Red
    exit 1
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
    Write-Host "https://github.com/$Username/$RepoName" -ForegroundColor White
    Write-Host ""
    Write-Host "You can share this link with others!" -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "Error uploading project" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Make sure:" -ForegroundColor Yellow
    Write-Host "1. You created the repository on GitHub first" -ForegroundColor White
    Write-Host "2. The repository name is correct: $RepoName" -ForegroundColor White
    Write-Host "3. You have push permissions" -ForegroundColor White
    Write-Host ""
    Write-Host "Create repository at: https://github.com/new" -ForegroundColor Cyan
}

