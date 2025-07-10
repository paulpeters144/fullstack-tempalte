<#
.SYNOPSIS
    Deletes 'node_modules' directories in the current directory and specified subdirectories.

.DESCRIPTION
    This script navigates to the current directory, then to 'shared' and 'backend'
    subdirectories, and removes any 'node_modules' folders found in these locations.
    It uses Remove-Item with -Recurse and -Force to ensure complete deletion.
    Error handling is included to manage cases where directories might not exist
    or deletion fails.

.NOTES
    Author: Gemini
    Version: 1.0
    Date: July 10, 2025
#>

# Define the directories to check for node_modules
$directoriesToCheck = @(
    "."         # Current directory
    "shared"    # Subdirectory 'shared'
    "backend"   # Subdirectory 'backend'
    "frontend"   # Subdirectory 'backend'
    "infra"   # Subdirectory 'backend'
)

Write-Host "Starting node_modules cleanup script..." -ForegroundColor Cyan

foreach ($dir in $directoriesToCheck) {
    $fullPath = Join-Path (Get-Location) $dir
    $nodeModulesPath = Join-Path $fullPath "node_modules"

    Write-Host "`nChecking for node_modules in: $($fullPath)" -ForegroundColor Yellow

    # Check if the directory exists before attempting to change into it
    if (Test-Path -Path $fullPath -PathType Container) {
        Push-Location $fullPath

        if (Test-Path -Path $nodeModulesPath -PathType Container) {
            Write-Host "Found node_modules at $($nodeModulesPath). Deleting..." -ForegroundColor Green
            try {
                Remove-Item -Path $nodeModulesPath -Recurse -Force -ErrorAction Stop
                Write-Host "Successfully deleted node_modules in $($fullPath)" -ForegroundColor Green
            }
            catch {
                Write-Host "Error deleting node_modules in $($fullPath): $($_.Exception.Message)" -ForegroundColor Red
            }
        }
        else {
            Write-Host "node_modules not found in $($fullPath). Skipping." -ForegroundColor DarkYellow
        }

        Pop-Location # Go back to the previous location
    }
    else {
        Write-Host "Directory '$($fullPath)' does not exist. Skipping." -ForegroundColor DarkYellow
    }
}

$fileToRemove = "pnpm-lock.yaml"

# --- Remove pnpm-workspaces.yaml from the initial current directory ---
Write-Host "`nChecking for '$($fileToRemove)' in the current directory..." -ForegroundColor Yellow

# Get the initial current directory before any Push-Location operations
$initialCwd = Get-Location

$pnpmWorkspacesFilePath = Join-Path $initialCwd $fileToRemove

if (Test-Path -Path $pnpmWorkspacesFilePath -PathType Leaf) { # -PathType Leaf checks for a file
    Write-Host "Found '$($fileToRemove)' at $($pnpmWorkspacesFilePath). Deleting..." -ForegroundColor Green
    try {
        Remove-Item -Path $pnpmWorkspacesFilePath -Force -ErrorAction Stop
        Write-Host "Successfully deleted '$($fileToRemove)'." -ForegroundColor Green
    }
    catch {
        Write-Host "Error deleting '$($fileToRemove)': $($_.Exception.Message)" -ForegroundColor Red
    }
}
else {
    Write-Host "'$($fileToRemove)' not found in the current directory. Skipping." -ForegroundColor DarkYellow
}

Write-Host "`nCleanup script finished." -ForegroundColor Cyan