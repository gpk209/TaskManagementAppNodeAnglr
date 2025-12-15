# PowerShell script to create remaining Node.js project files
Write-Host "Creating Node.js project structure..." -ForegroundColor Green

# Create all necessary directories
$directories = @(
    "src\infrastructure\database",
    "src\infrastructure\models",
    "src\infrastructure\repositories",
    "src\services\exceptions",
    "src\services\interfaces",
    "src\services\implementations",
    "src\api\controllers",
    "src\api\routes",
    "src\api\middleware",
    "src\shared",
    "tests\unit\services",
    "logs",
    "Postman"
)

foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "Created: $dir" -ForegroundColor Cyan
    }
}

Write-Host "`nAll directories created successfully!" -ForegroundColor Green
Write-Host "Please run 'npm install' to install dependencies" -ForegroundColor Yellow
