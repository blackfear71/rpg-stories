# Couleurs
$Host.UI.RawUI.ForegroundColor = "White"

# Applique la couleur au texte
function Write-Color {
    param (
        [string]$Text,
        [ConsoleColor]$Color = "White"
    )
    $oldColor = $Host.UI.RawUI.ForegroundColor
    $Host.UI.RawUI.ForegroundColor = $Color
    Write-Host $Text
    $Host.UI.RawUI.ForegroundColor = $oldColor
}

# Récupère le chemin relatif
function Get-RelativePath {
    param (
        [string]$From,
        [string]$To
    )
    $fromUri = New-Object System.Uri((Resolve-Path $From).ProviderPath + [System.IO.Path]::DirectorySeparatorChar)
    $toUri = New-Object System.Uri((Resolve-Path $To).ProviderPath)
    $relativeUri = $fromUri.MakeRelativeUri($toUri)
    $relativePath = [System.Uri]::UnescapeDataString($relativeUri.ToString())
    return $relativePath -replace '/', [System.IO.Path]::DirectorySeparatorChar
}

# Incrémente la version du package.json
function IncrementVersion {
    param (
        [string]$version,
        [string]$type
    )

    $parts = $version -split '\.'
    $major = [int]$parts[0]
    $minor = [int]$parts[1]
    $patch = [int]$parts[2]

    switch ($type) {
        "patch" {
            $patch++
        }
        "minor" {
            $minor++
            $patch = 0
        }
        "major" {
            $major++
            $minor = 0
            $patch = 0
        }
    }

    return "$major.$minor.$patch"
}

# Configuration
$FRONT_SRC_DIR = ".\app"
$BACK_SRC_DIR = ".\api"
$DEPLOY_DIST_DIR = ".\dist"
$DEPLOY_DIR = ".\dist\rpg-stories"
$DEPLOY_APP_DIR = $DEPLOY_DIR
$DEPLOY_API_DIR = Join-Path $DEPLOY_DIR "api"

# Choix de version
Write-Host "Choisissez le type de version :"
Write-Host "1. Patch"
Write-Host "2. Mineure"
Write-Host "3. Majeure"
Write-Host "4. Annuler le déploiement"
$versionChoice = Read-Host "Votre choix (1-4) "

if ($versionChoice -eq '4') {
    Write-Host "Déploiement annulé."
    exit
}

# Lire le fichier package.json
$packageJsonPath = ".\app\package.json"
$jsonText = Get-Content $packageJsonPath -Raw
$packageContent = $jsonText | ConvertFrom-Json
$currentVersion = $packageContent.version

# Déterminer le type de version
$versionType = switch ($versionChoice) {
    "1" { "patch" }
    "2" { "minor" }
    "3" { "major" }
    default {
        Write-Color "Choix invalide. Déploiement annulé." Red
        exit
    }
}

# Appel du script Node pour mettre à jour la version
Push-Location ".\app\scripts"
$newVersion = node updateVersion.cjs $versionType
Pop-Location

Write-Color "Version mise à jour : $currentVersion -> $newVersion" Green

# Nettoyage
Write-Color "Nettoyage du dossier de déploiement..." Blue
if (Test-Path $DEPLOY_DIR) {
    Remove-Item -Recurse -Force $DEPLOY_DIR
}
New-Item -ItemType Directory -Path $DEPLOY_APP_DIR -Force | Out-Null
New-Item -ItemType Directory -Path $DEPLOY_API_DIR -Force | Out-Null

# Build du front
Write-Color "Build du front React..." Yellow
Push-Location $FRONT_SRC_DIR
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Color "Erreur lors du build React." Red
    exit 1
}
Pop-Location

# Copie du build front
Write-Color "Copie du build React..." Blue
Copy-Item -Path (Join-Path $FRONT_SRC_DIR "build\*") -Destination $DEPLOY_APP_DIR -Recurse -Force

# Copie du backend PHP (avec .env)
#Write-Color "Copie du backend PHP... (avec .env)" Blue
#Copy-Item -Path (Join-Path $BACK_SRC_DIR "*") -Destination $DEPLOY_API_DIR -Recurse -Force

# Copie du backend PHP (sans .env)
Write-Color "Copie du backend PHP (sans .env, .log)..." Blue

Get-ChildItem -Path $BACK_SRC_DIR -Recurse -File | Where-Object {
    $_.Name -ne '.env' -and
    $_.Name -ne '.env.production' -and
    $_.Extension -ne '.log'
} | ForEach-Object {
    $relativePath = Get-RelativePath $BACK_SRC_DIR $_.FullName
    $destPath = Join-Path $DEPLOY_API_DIR $relativePath
    $destDir = Split-Path $destPath
    if (-not (Test-Path $destDir)) {
        New-Item -ItemType Directory -Path $destDir -Force | Out-Null
    }
    Copy-Item -Path $_.FullName -Destination $destPath -Force
}

# Copie du .env.production en .env dans le dossier de déploiement
$envProdPath = Join-Path $BACK_SRC_DIR ".env.production"
$envDestPath = Join-Path $DEPLOY_API_DIR ".env"

if (Test-Path $envProdPath) {
    Copy-Item -Path $envProdPath -Destination $envDestPath -Force
    Write-Color ".env.production copié dans le dossier de déploiement sous le nom .env" Blue
}
else {
    Write-Color "Fichier .env.production introuvable !" Red
}

# Déploiement terminé
Write-Color "Déploiement terminé dans '$DEPLOY_DIR'" Green

# Fin - attente d'appui sur une touche puis ouverture de l'explorateur
Write-Host "`nAppuyez sur une touche pour ouvrir le dossier dans l'Explorateur Windows..."
[void][System.Console]::ReadKey($true)

# Ouvre l'explorateur à l'emplacement du dossier de déploiement
Start-Process (Resolve-Path $DEPLOY_DIST_DIR)
exit