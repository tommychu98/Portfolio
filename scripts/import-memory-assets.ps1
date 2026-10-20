param(
  [string]$PhotoDirectory = 'C:\Users\mbc\Downloads\la-20261020T012625Z-1-001\la',
  [string]$ReferenceDirectory = 'C:\Users\mbc\Downloads'
)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$workspaceRoot = if ($PSScriptRoot) { Split-Path $PSScriptRoot -Parent } else { (Get-Location).Path }
$destination = Join-Path $workspaceRoot 'public\media\images\about\memories'
$frameDestination = Join-Path $destination 'frames'
New-Item -ItemType Directory -Path $frameDestination -Force | Out-Null
$encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -eq 'image/jpeg'

# Web derivatives only: normalize EXIF orientation, resize, and encode.
# Original downloads remain untouched. No filters or color grading are applied.
function Export-WebImage([string]$source, [string]$target, [int]$maxSize, [bool]$transparent) {
  $original = [System.Drawing.Image]::FromFile($source)
  try {
    if ($original.PropertyIdList -contains 274) {
      $orientation = [BitConverter]::ToUInt16($original.GetPropertyItem(274).Value, 0)
      if ($orientation -eq 6) { $original.RotateFlip([System.Drawing.RotateFlipType]::Rotate90FlipNone) }
      elseif ($orientation -eq 3) { $original.RotateFlip([System.Drawing.RotateFlipType]::Rotate180FlipNone) }
      elseif ($orientation -eq 8) { $original.RotateFlip([System.Drawing.RotateFlipType]::Rotate270FlipNone) }
    }
    $scale = [Math]::Min(1.0, [double]$maxSize / [double][Math]::Max($original.Width, $original.Height))
    $width = [int][Math]::Round($original.Width * $scale)
    $height = [int][Math]::Round($original.Height * $scale)
    $bitmap = [System.Drawing.Bitmap]::new($width, $height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    try {
      $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
      $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
      $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
      $graphics.DrawImage($original, 0, 0, $width, $height)
      if ($transparent) { $bitmap.Save($target, [System.Drawing.Imaging.ImageFormat]::Png) }
      else {
        $parameters = New-Object System.Drawing.Imaging.EncoderParameters(1)
        $parameters.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]90)
        try { $bitmap.Save($target, $encoder, $parameters) } finally { $parameters.Dispose() }
      }
    } finally { $graphics.Dispose(); $bitmap.Dispose() }
    Get-Item -LiteralPath $target | Select-Object Name, Length
  } finally { $original.Dispose() }
}

@('la3.jpg','fine_me2.jpg','fine3.jpg','fine_me4.jpg','starlights_2.jpg','fine_crew1.jpg','fine2.jpg','stage_2.jpg','shooting_me.jpg','shooting_7.jpg') | ForEach-Object {
  Export-WebImage (Join-Path $PhotoDirectory $_) (Join-Path $destination $_) 1600 $false
}
$frames = @(
  @('ChatGPT 이미지 2026년 10월 20일 오전 10_37_46-1.png', 'portrait-clean.png'),
  @('ChatGPT 이미지 2026년 10월 20일 오전 10_37_49-2.png', 'portrait-soft.png'),
  @('ChatGPT 이미지 2026년 10월 20일 오전 10_37_51-3.png', 'landscape-clean.png'),
  @('ChatGPT 이미지 2026년 10월 20일 오전 10_37_53-4.png', 'landscape-square.png'),
  @('빈티지 투명 폴라로이드 프레임-1.png', 'landscape-teal.png'),
  @('빈티지 투명 폴라로이드 프레임-2.png', 'portrait-teal.png')
)
foreach ($frame in $frames) {
  Export-WebImage (Join-Path $ReferenceDirectory $frame[0]) (Join-Path $frameDestination $frame[1]) 1000 $true
}
$propDestination = Join-Path $destination 'props'
New-Item -ItemType Directory -Path $propDestination -Force | Out-Null
$props = @(
  @('ChatGPT 이미지 2026년 10월 20일 오전 11_50_16-1.png', 'palms.png'),
  @('ChatGPT 이미지 2026년 10월 20일 오전 11_50_19-2.png', 'film.png'),
  @('ChatGPT 이미지 2026년 10월 20일 오전 11_50_20-3.png', 'camera.png'),
  @('ChatGPT 이미지 2026년 10월 20일 오전 11_50_22-4.png', 'clapper.png'),
  @('ChatGPT 이미지 2026년 10월 20일 오전 11_50_24-5.png', 'script.png'),
  @('ChatGPT 이미지 2026년 10월 20일 오전 11_50_26-6.png', 'light.png'),
  @('ChatGPT 이미지 2026년 10월 20일 오전 11_50_28-7.png', 'car.png'),
  @('ChatGPT 이미지 2026년 10월 20일 오전 11_50_30-8.png', 'mask.png')
)
foreach ($prop in $props) {
  Export-WebImage (Join-Path $ReferenceDirectory $prop[0]) (Join-Path $propDestination $prop[1]) 720 $true
}
