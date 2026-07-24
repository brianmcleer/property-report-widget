<#
  publish.ps1  -  One-command publish/update for the Property Report widget repo.

  What it does, in order:
    1. Copies the latest widget from your Experience Builder folder into this repo's
       "property-report" subfolder, automatically skipping node_modules and .vs.
    2. Commits the changes.
    3. Publishes the repo to GitHub on first run, or pushes updates on later runs.
    4. (Optional) Cuts a versioned GitHub Release with a downloadable zip.

  HOW TO RUN (from a terminal opened in this folder):
    Normal update:
      powershell -ExecutionPolicy Bypass -File .\publish.ps1

    Update AND publish a release (e.g. version 1.0.0):
      powershell -ExecutionPolicy Bypass -File .\publish.ps1 -Release v1.0.0

  EDIT THIS ONCE: set $ExbWidgetPath below to your real widget folder if it ever moves.
#>

param(
    [string]$Release = "",
    [string]$CommitMessage = "Update Property Report widget ($(Get-Date -Format 'yyyy-MM-dd'))"
)

$ErrorActionPreference = "Stop"

# ----- Settings -------------------------------------------------------------
# Your live widget folder inside Experience Builder (the source of truth):
$ExbWidgetPath = "C:\arcgis-experience-builder-1.21\client\your-extensions\widgets\property-report"

# The repo is wherever this script lives:
$RepoPath   = $PSScriptRoot
$WidgetDest = Join-Path $RepoPath "property-report"
$RepoName   = "property-report-widget"
# ----------------------------------------------------------------------------

Write-Host "==> Repo:   $RepoPath"
Write-Host "==> Source: $ExbWidgetPath"

if (-not (Test-Path $ExbWidgetPath)) {
    throw "Cannot find the widget folder at:`n  $ExbWidgetPath`nEdit the `$ExbWidgetPath line in publish.ps1 and try again."
}

# 1) Mirror the widget into the repo, skipping node_modules / .vs / cruft.
Write-Host "`n==> Syncing widget files (skipping node_modules)..."
robocopy "$ExbWidgetPath" "$WidgetDest" /MIR /XD "node_modules" ".vs" /XF "*.user" "*.suo" /NFL /NDL /NJH /NJS /NP | Out-Null
if ($LASTEXITCODE -ge 8) { throw "robocopy failed with exit code $LASTEXITCODE" }
Write-Host "    Done."

# 2) Commit.
Push-Location $RepoPath
try {
    git add -A | Out-Null
    $pending = git status --porcelain
    if ([string]::IsNullOrWhiteSpace($pending)) {
        Write-Host "`n==> No changes to commit."
    } else {
        Write-Host "`n==> Committing: $CommitMessage"
        git commit -m "$CommitMessage" | Out-Null
    }

    # 3) Publish (first run) or push (later runs).
    $hasOrigin = (git remote) -contains "origin"
    $gh = Get-Command gh -ErrorAction SilentlyContinue

    if (-not $hasOrigin) {
        if ($gh) {
            Write-Host "`n==> First run: creating GitHub repo and pushing..."
            gh repo create $RepoName --public --source="." --remote="origin" --push
        } else {
            Write-Host "`n==> This repo isn't on GitHub yet and the GitHub CLI (gh) isn't installed."
            Write-Host "    Easiest fix: open GitHub Desktop and click 'Publish repository' once."
            Write-Host "    After that, re-run this script and it will push automatically."
            return
        }
    } else {
        Write-Host "`n==> Pushing to GitHub..."
        git push
    }

    # 4) Optional release.
    if ($Release -ne "") {
        if (-not $gh) {
            Write-Host "`n==> Skipping release: GitHub CLI (gh) not installed."
            Write-Host "    Install once with:  winget install --id GitHub.cli   then run:  gh auth login"
        } else {
            Write-Host "`n==> Creating release $Release ..."
            $zip = Join-Path $env:TEMP "property-report.zip"
            if (Test-Path $zip) { Remove-Item $zip -Force }
            Compress-Archive -Path $WidgetDest -DestinationPath $zip
            $notes = "Property Report Widget for ArcGIS Experience Builder. Download property-report.zip, extract, and drop the property-report folder into client\your-extensions\widgets. Then run npm install in the client folder and restart."
            gh release create $Release "$zip" --title "Property Report Widget $Release" --notes $notes
        }
    }

    Write-Host "`n==> Finished."
}
finally {
    Pop-Location
}
