# PowerShell script to fix ALL import paths and references
Write-Host "Fixing ALL import paths and references in backend files..."

$srcPath = ".\src"
$files = Get-ChildItem -Path $srcPath -Recurse -Include "*.ts"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Fix remaining @/shared and @/database paths
    $content = $content -replace "@/shared/", "@/"
    $content = $content -replace "@/database/", "@/"
    
    # Fix service imports in controllers
    $content = $content -replace "from '\./([A-Z]\w+Service)'", "from '@/services/`$1'"
    $content = $content -replace "import { ([A-Z]\w+Service) } from '\./\1'", "import { `$1 } from '@/services/`$1'"
    
    # Fix repository imports
    $content = $content -replace "from '\./([A-Z]\w+Repository)'", "from '@/repositories/`$1'"
    $content = $content -replace "import { ([A-Z]\w+Repository) } from '\./\1'", "import { `$1 } from '@/repositories/`$1'"
    
    # Fix controller imports
    $content = $content -replace "from '\./([A-Z]\w+Controller)'", "from '@/controllers/`$1'"
    $content = $content -replace "import { ([A-Z]\w+Controller) } from '\./\1'", "import { `$1 } from '@/controllers/`$1'"
    
    # Fix routes imports
    $content = $content -replace "from '@/auth/routes'", "from '@/routes/authRoutes'"
    $content = $content -replace "from '@/users/routes'", "from '@/routes/usersRoutes'"
    $content = $content -replace "from '@/categories/routes'", "from '@/routes/categoriesRoutes'"
    $content = $content -replace "from '@/types/routes'", "from '@/routes/typesRoutes'"
    $content = $content -replace "from '@/cities/routes'", "from '@/routes/citiesRoutes'"
    $content = $content -replace "from '@/faq/routes'", "from '@/routes/faqRoutes'"
    
    # Fix BaseMapper references (doesn't exist, use BaseController pattern instead)
    $content = $content -replace "import { BaseMapper } from '@/shared/mappers/BaseMapper';", "// BaseMapper removed - using direct mapping"
    $content = $content -replace "extends BaseMapper", "// extends BaseMapper"
    
    # Fix specific naming conventions
    $content = $content -replace "auth\.dto", "AuthDto"
    $content = $content -replace "category\.dto", "CategoryDto"
    $content = $content -replace "city\.dto", "CityDto"
    $content = $content -replace "user\.dto", "UserDto"
    $content = $content -replace "location\.dto", "LocationDto"
    $content = $content -replace "route\.dto", "RouteDto"
    
    if ($content -ne $originalContent) {
        Write-Host "Fixing imports in: $($file.Name)"
        Set-Content -Path $file.FullName -Value $content -NoNewline
    }
}

Write-Host "All import paths and references fixed successfully!"
