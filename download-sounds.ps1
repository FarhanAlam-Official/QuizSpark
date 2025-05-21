# Create the sounds directory if it doesn't exist
$soundsDir = "public/sounds"
if (-not (Test-Path $soundsDir)) {
    New-Item -ItemType Directory -Path $soundsDir -Force
}

# Sound file URLs
$sounds = @{
    "click.mp3" = "https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3"
    "tick.mp3" = "https://assets.mixkit.co/active_storage/sfx/209/209-preview.mp3"
    "success.mp3" = "https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3"
    "error.mp3" = "https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3"
    "correct.mp3" = "https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3"
    "incorrect.mp3" = "https://assets.mixkit.co/active_storage/sfx/2691/2691-preview.mp3"
    "select.mp3" = "https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3"
    "complete.mp3" = "https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3"
    "fail.mp3" = "https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3"
}

# Download each sound file
foreach ($sound in $sounds.GetEnumerator()) {
    $outputFile = Join-Path $soundsDir $sound.Key
    Write-Host "Downloading $($sound.Key)..."
    Invoke-WebRequest -Uri $sound.Value -OutFile $outputFile
}

Write-Host "All sound files have been downloaded to $soundsDir" 