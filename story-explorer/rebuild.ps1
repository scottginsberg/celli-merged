$content = Get-Content '../story.html'
$before = $content[0..1209]
$after = $content[4097..($content.Length-1)]
$combined = $before + $after
$combined | Set-Content 'index.html'
Write-Host "index.html rebuilt successfully"



