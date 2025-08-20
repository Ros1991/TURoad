# Script PowerShell para criar assets placeholder para Expo
# Usa ImageMagick ou cria assets básicos para resolver o prebuild

Write-Host "🎨 Criando assets placeholder para TURoad..." -ForegroundColor Green

# Verificar se ImageMagick está disponível
$hasImageMagick = Get-Command "magick" -ErrorAction SilentlyContinue

if ($hasImageMagick) {
    Write-Host "✅ ImageMagick encontrado - criando PNGs de alta qualidade" -ForegroundColor Green
    
    # Criar icon.png (1024x1024)
    magick -size 1024x1024 xc:"#035A6E" -fill white -gravity center -pointsize 200 -annotate +0+0 "TR" icon.png
    
    # Criar adaptive-icon.png (1024x1024) 
    magick -size 1024x1024 xc:"#035A6E" -fill white -gravity center -pointsize 200 -annotate +0+0 "TR" adaptive-icon.png
    
    # Criar splash.png (1284x2778)
    magick -size 1284x2778 xc:white -fill "#035A6E" -gravity center -pointsize 100 -annotate +0-200 "TURoad" -pointsize 40 -annotate +0+100 "Descubra o turismo local" splash.png
    
    # Criar favicon.png (48x48)
    magick -size 48x48 xc:"#035A6E" -fill white -gravity center -pointsize 24 -annotate +0+0 "T" favicon.png
    
    Write-Host "✅ Assets PNG criados com ImageMagick!" -ForegroundColor Green
} else {
    Write-Host "⚠️ ImageMagick não encontrado - baixando placeholders online..." -ForegroundColor Yellow
    
    # URLs para placeholders via placeholder.com
    $assets = @(
        @{ name = "icon.png"; url = "https://via.placeholder.com/1024x1024/035A6E/FFFFFF?text=TR" }
        @{ name = "adaptive-icon.png"; url = "https://via.placeholder.com/1024x1024/035A6E/FFFFFF?text=TR" }
        @{ name = "splash.png"; url = "https://via.placeholder.com/1284x2778/FFFFFF/035A6E?text=TURoad" }
        @{ name = "favicon.png"; url = "https://via.placeholder.com/48x48/035A6E/FFFFFF?text=T" }
    )
    
    foreach ($asset in $assets) {
        try {
            Write-Host "📥 Baixando $($asset.name)..." -ForegroundColor Cyan
            Invoke-WebRequest -Uri $asset.url -OutFile $asset.name
            Write-Host "✅ $($asset.name) criado" -ForegroundColor Green
        } catch {
            Write-Host "❌ Erro ao baixar $($asset.name): $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "🎯 Assets criados! Próximos passos:" -ForegroundColor Green
Write-Host "1. pnpm prebuild (ou pnpm prebuild:clean)" -ForegroundColor White
Write-Host "2. Substitua os placeholders por seus assets reais" -ForegroundColor White
Write-Host "3. Use ferramentas como Figma, Canva ou appicon.co para criar assets profissionais" -ForegroundColor White
