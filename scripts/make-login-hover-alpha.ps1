Add-Type -AssemblyName System.Drawing

$pairs = @(
  @{
    Input = "assets/images/ui/buttons/btn-login-primary-hover.webp"
    Output = "assets/images/ui/buttons/btn-login-primary-hover-alpha.png"
  },
  @{
    Input = "assets/images/ui/buttons/btn-login-secondary-hover.webp"
    Output = "assets/images/ui/buttons/btn-login-secondary-hover-alpha.png"
  }
)

function Convert-BlackToAlpha {
  param(
    [string]$InputPath,
    [string]$OutputPath
  )

  $sourcePath = (Resolve-Path $InputPath).Path
  $bitmap = [System.Drawing.Bitmap]::new($sourcePath)
  $output = [System.Drawing.Bitmap]::new($bitmap.Width, $bitmap.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

  for ($y = 0; $y -lt $bitmap.Height; $y++) {
    for ($x = 0; $x -lt $bitmap.Width; $x++) {
      $pixel = $bitmap.GetPixel($x, $y)
      $luminance = (0.2126 * $pixel.R) + (0.7152 * $pixel.G) + (0.0722 * $pixel.B)

      if ($luminance -le 10) {
        $alpha = 0
      } elseif ($luminance -lt 58) {
        $alpha = [Math]::Round((($luminance - 10) / 48) * $pixel.A)
      } else {
        $alpha = $pixel.A
      }

      $output.SetPixel($x, $y, [System.Drawing.Color]::FromArgb([int]$alpha, $pixel.R, $pixel.G, $pixel.B))
    }
  }

  $targetPath = Join-Path (Get-Location) $OutputPath
  $output.Save($targetPath, [System.Drawing.Imaging.ImageFormat]::Png)
  $output.Dispose()
  $bitmap.Dispose()
}

foreach ($pair in $pairs) {
  Convert-BlackToAlpha -InputPath $pair.Input -OutputPath $pair.Output
  Write-Output "Generated $($pair.Output)"
}
