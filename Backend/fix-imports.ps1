# PowerShell script to fix import paths
Write-Host "Fixing import paths in backend files..."

$srcPath = ".\src"
$files = Get-ChildItem -Path $srcPath -Recurse -Include "*.ts"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Fix import paths
    $content = $content -replace "@/database/entities/", "@/entities/"
    $content = $content -replace "@/shared/base/", "@/core/base/"
    $content = $content -replace "@/shared/dtos/", "@/dtos/"
    $content = $content -replace "@/shared/utils/", "@/utils/"
    $content = $content -replace "@/shared/middleware/", "@/middleware/"
    $content = $content -replace "@/database/repositories", "@/repositories"
    $content = $content -replace "@/modules/", "@/"
    
    if ($content -ne $originalContent) {
        Write-Host "Fixing imports in: $($file.FullName)"
        Set-Content -Path $file.FullName -Value $content -NoNewline
    }
}

Write-Host "Import paths fixed successfully!"
