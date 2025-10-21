# Split celli-refactor into organized subfolders
# Large folders (>99 items) get split into folder1, folder2, etc.

Write-Host "========================================"
Write-Host "CELLI-REFACTOR SPLITTER v2 (PowerShell)"
Write-Host "========================================"
Write-Host ""
Write-Host "This will create a 'split' folder containing:"
Write-Host "- Small folders copied as-is (under 100 items)"
Write-Host "- Large folders split into folder1\folder\, folder2\folder\, etc. (100+ items)"
Write-Host ""

# Create split directory
if (Test-Path "split") {
    Write-Host "Cleaning existing split directory..."
    Remove-Item "split" -Recurse -Force
}
New-Item -ItemType Directory -Path "split" | Out-Null

Write-Host "Creating split directory..."
Write-Host ""

# Copy critical root files first
Write-Host "Copying critical root files..."
Write-Host ""

$criticalFiles = @()

# Get all HTML files
$criticalFiles += Get-ChildItem -File -Filter "*.html" -ErrorAction SilentlyContinue

# Get all batch files
$criticalFiles += Get-ChildItem -File -Filter "*.bat" -ErrorAction SilentlyContinue

# Get JSON files
$criticalFiles += Get-ChildItem -File -Filter "*.json" -ErrorAction SilentlyContinue

# Get recently edited markdown files (last 30 days)
$recentDate = (Get-Date).AddDays(-30)
$criticalFiles += Get-ChildItem -File -Filter "*.md" -ErrorAction SilentlyContinue | Where-Object { $_.LastWriteTime -gt $recentDate }

# Get README and important docs regardless of date
$criticalFiles += Get-ChildItem -File -ErrorAction SilentlyContinue | Where-Object { 
    $_.Name -match "^(README|START|QUICK|GUIDE|INSTRUCTIONS|COMPLETE|FINAL|STATUS)" -and 
    ($_.Extension -eq ".md" -or $_.Extension -eq ".txt")
}

# Remove duplicates
$criticalFiles = $criticalFiles | Sort-Object -Property FullName -Unique

Write-Host "  Found $($criticalFiles.Count) critical files to copy"

# Create root-files directory in split
New-Item -ItemType Directory -Path "split\root-files" -Force | Out-Null

foreach ($file in $criticalFiles) {
    Copy-Item $file.FullName "split\root-files\$($file.Name)" -ErrorAction SilentlyContinue
    Write-Host "  + $($file.Name)"
}

Write-Host ""
Write-Host "Critical files copied to split\root-files\"
Write-Host ""

# Process each root-level folder
Write-Host "Processing root-level folders..."
Write-Host ""

Get-ChildItem -Directory | Where-Object { $_.Name -ne "split" } | ForEach-Object {
    $folder = $_
    Write-Host "Analyzing: $($folder.Name)"
    
    # Count items in this folder
    $items = Get-ChildItem -Path $folder.FullName -Recurse -File -ErrorAction SilentlyContinue
    $itemCount = ($items | Measure-Object).Count
    
    Write-Host "  Found $itemCount items"
    
    # Check if split is needed
    if ($itemCount -gt 99) {
        Write-Host "  (Splitting - more than 99 items)"
        Write-Host ""
        
        # Calculate number of splits
        $maxPerSplit = 99
        $numSplits = [Math]::Ceiling($itemCount / $maxPerSplit)
        
        Write-Host "  Creating $numSplits splits"
        Write-Host ""
        
        # Split files into chunks
        $currentSplit = 1
        $currentCount = 0
        
        foreach ($file in $items) {
            # Check if we need a new split
            if ($currentCount -ge $maxPerSplit) {
                Write-Host "    $($folder.Name)$currentSplit complete: $currentCount items"
                $currentSplit++
                $currentCount = 0
            }
            
            # Create split directory if needed
            if ($currentCount -eq 0) {
                $splitDir = "split\$($folder.Name)$currentSplit\$($folder.Name)"
                New-Item -ItemType Directory -Path $splitDir -Force | Out-Null
                Write-Host "    Creating $splitDir\..."
            }
            
            # Get relative path
            $relPath = $file.FullName.Substring($folder.FullName.Length + 1)
            
            # Set destination
            $destFile = "split\$($folder.Name)$currentSplit\$($folder.Name)\$relPath"
            $destDir = Split-Path $destFile -Parent
            
            # Create directory if it doesn't exist
            if (!(Test-Path $destDir)) {
                New-Item -ItemType Directory -Path $destDir -Force | Out-Null
            }
            
            # Copy file
            try {
                Copy-Item $file.FullName $destFile -ErrorAction Stop
            } catch {
                Write-Host "    ERROR: Failed to copy $relPath"
            }
            
            $currentCount++
            
            # Show progress every 20 files
            if ($currentCount % 20 -eq 0) {
                Write-Host "      Progress: $currentCount items..."
            }
        }
        
        Write-Host "    $($folder.Name)$currentSplit complete: $currentCount items"
        Write-Host "  Split into $currentSplit folders: $($folder.Name)1, $($folder.Name)2, ..."
        Write-Host ""
        
    } else {
        Write-Host "  (Copying as-is - under 100 items)"
        
        # Copy entire folder as-is
        Write-Host "  Copying to split\$($folder.Name)\..."
        Copy-Item $folder.FullName "split\$($folder.Name)" -Recurse -ErrorAction SilentlyContinue
        Write-Host "  Done!"
        Write-Host ""
    }
}

# Create master index
Write-Host ""
Write-Host "Creating index file..."

$indexContent = @"
CELLI-REFACTOR SPLIT STRUCTURE
========================================

This folder contains:

STRUCTURE:
-----------
- root-files\ - Critical files from root (HTML, batch files, recent docs)
- Small folders (under 100 items, copied as-is)
- Large folders (100+ items, split into folder1, folder2, etc.)

ROOT FILES:
-----------
"@

# List root files
$rootFileCount = (Get-ChildItem "split\root-files" -File -ErrorAction SilentlyContinue | Measure-Object).Count
$indexContent += "`nroot-files: $rootFileCount critical files (HTML, batch, recent docs)"
$indexContent += "`n"
$indexContent += "`nSPLIT FOLDERS (>99 items):"
$indexContent += "`n---------------"

# List split folders (those with numbers)
Get-ChildItem "split" -Directory | Where-Object { $_.Name -match '\d$' } | ForEach-Object {
    $items = Get-ChildItem -Path $_.FullName -Recurse -File -ErrorAction SilentlyContinue
    $count = ($items | Measure-Object).Count
    $indexContent += "`n$($_.Name): $count items"
}

$indexContent += "`n`nREGULAR FOLDERS (<100 items):"
$indexContent += "`n---------------"

# List non-split folders
Get-ChildItem "split" -Directory | Where-Object { $_.Name -notmatch '\d$' } | ForEach-Object {
    $items = Get-ChildItem -Path $_.FullName -Recurse -File -ErrorAction SilentlyContinue
    $count = ($items | Measure-Object).Count
    $indexContent += "`n$($_.Name): $count items"
}

$indexContent += @"
`n
USAGE:
========================================

ROOT FILES:
  root-files\ contains all critical files from the project root:
  - All .html files (index.html, builder.html, etc.)
  - All .bat files (RUN_SERVER.bat, etc.)
  - All .json files (package.json, etc.)
  - Recently edited .md files (last 30 days)
  - Important docs (README, START, GUIDE, etc.)

SPLIT FOLDERS:
  Split folders (e.g., src1, src2, etc.) each contain
  their own subfolder with the original name:

    src1\src\   - First batch of src files
    src2\src\   - Second batch of src files
    src3\src\   - Third batch of src files

  All other small folders are in split\ directly.

TO RECOMBINE:
  1. Copy root-files\ contents back to project root
  2. Merge all numbered folder contents back into their parent folder names

"@

$indexContent | Out-File "split\INDEX.txt" -Encoding ASCII

Write-Host ""
Write-Host "========================================"
Write-Host "SPLITTING COMPLETE!"
Write-Host "========================================"
Write-Host ""
Write-Host "Created split folder structure in: split\"
Write-Host ""
Write-Host "Contents:"
Write-Host "  - root-files\ - All HTML files, batch files, and recent/important docs"
Write-Host "  - Small folders copied as-is (under 100 items)"
Write-Host "  - Large folders split into foldername1, foldername2, etc."
Write-Host "    (each containing foldername\ subfolder)"
Write-Host ""
Write-Host "Check split\INDEX.txt for details"
Write-Host ""
Write-Host "Done!"
Write-Host ""

Read-Host "Press Enter to continue"
