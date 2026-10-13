param([string]$SourceFolder = 'C:/Users/mbc/Downloads')
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$assetFolder = Join-Path $PSScriptRoot 'assets/icons'
[System.IO.Directory]::CreateDirectory($assetFolder) | Out-Null
$manifest = @()
$sheets = @(
  @{file='손그림풍 웹·UI 포트폴리오 아이콘 36종-1.png';prefix='ui';cols=@(18,224,422,628,830,1056,1254);rows=@(40,245,450,650,835,1013,1230)},
  @{file='웹디자인 포트폴리오 아이콘 시트-2.png';prefix='studio';boxes=@(@(15,40,515,510),@(515,40,869,510),@(869,40,1254,510),@(10,510,465,883),@(465,510,850,883),@(850,510,1254,883),@(0,883,512,1254),@(512,883,850,1254),@(850,883,1254,1254))}
)
foreach($sheet in $sheets) {
  $source = [System.Drawing.Bitmap]::new((Join-Path $SourceFolder $sheet.file))
  $boxes = @()
  if($sheet.cols) { for($r=0;$r -lt 6;$r++){ for($c=0;$c -lt 6;$c++){ $boxes += ,@($sheet.cols[$c],$sheet.rows[$r],$sheet.cols[$c+1],$sheet.rows[$r+1]) } } } else { $boxes=$sheet.boxes }
  $index=0
  foreach($box in $boxes) {
    $index++
    if($sheet.prefix -eq 'ui' -and $index -eq 29){$box[2]=1068}
    if($sheet.prefix -eq 'ui' -and $index -eq 30){$box[0]=1068}
    if($sheet.prefix -eq 'studio' -and $index -eq 4){$box[2]=485}
    if($sheet.prefix -eq 'studio' -and $index -eq 5){$box[0]=430}
    $tile=[System.Drawing.Bitmap]::new($box[2]-$box[0],$box[3]-$box[1])
    $left=$box[2];$top=$box[3];$right=$box[0];$bottom=$box[1]
    for($y=$box[1];$y -lt $box[3];$y++){ for($x=$box[0];$x -lt $box[2];$x++){
      $pixel=$source.GetPixel($x,$y)
      if($sheet.prefix -eq 'studio' -and ($index -eq 4 -or $index -eq 5)){
        $split=if($y -lt 620){465-($y-510)*30/110}elseif($y -lt 710){435+($y-620)*18/90}else{453+($y-710)*29/100}
        if(($index -eq 4 -and $x -ge $split) -or ($index -eq 5 -and $x -lt $split)){continue}
      }
      $tile.SetPixel($x-$box[0],$y-$box[1],$pixel)
      if($pixel.A -gt 0){$left=[Math]::Min($left,$x);$top=[Math]::Min($top,$y);$right=[Math]::Max($right,$x);$bottom=[Math]::Max($bottom,$y)}
    }}
    $rect=[System.Drawing.Rectangle]::new($left,$top,$right-$left+1,$bottom-$top+1)
    $localRect=[System.Drawing.Rectangle]::new($left-$box[0],$top-$box[1],$rect.Width,$rect.Height)
    $crop=$tile.Clone($localRect,[System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $name='{0}-{1:00}.png' -f $sheet.prefix,$index
    $crop.Save((Join-Path $assetFolder $name),[System.Drawing.Imaging.ImageFormat]::Png)
    $manifest += [ordered]@{file=$name;source=$sheet.file;sourceBounds=@($left,$top,$rect.Width,$rect.Height);width=$rect.Width;height=$rect.Height}
    $crop.Dispose();$tile.Dispose()
  }
  $source.Dispose()
}
$manifest | ConvertTo-Json -Depth 4 | Set-Content -Encoding UTF8 (Join-Path $assetFolder 'manifest.json')
Write-Output ('Extracted {0} transparent PNGs without recoloring or resampling.' -f $manifest.Count)
