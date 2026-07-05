$root = 'C:\Users\sutha\SyncMatch'
$prefix = 'http://127.0.0.1:8000/'
$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add($prefix)
$listener.Start()
Write-Host "Serving $root at $prefix"

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $path = $context.Request.Url.AbsolutePath
        if ($path -eq '/' -or $path -eq '') { $path = '/index.html' }
        $filePath = Join-Path $root ($path.TrimStart('/'))

        if (-not (Test-Path $filePath)) {
            $filePath = Join-Path $root 'index.html'
        }

        if (Test-Path $filePath -PathType Leaf) {
            $content = [System.IO.File]::ReadAllBytes($filePath)
            $ext = [System.IO.Path]::GetExtension($filePath)
            $mime = switch ($ext) {
                '.html' { 'text/html; charset=utf-8' }
                '.css' { 'text/css; charset=utf-8' }
                '.js' { 'application/javascript; charset=utf-8' }
                '.png' { 'image/png' }
                '.jpg' { 'image/jpeg' }
                '.jpeg' { 'image/jpeg' }
                '.svg' { 'image/svg+xml' }
                default { 'application/octet-stream' }
            }

            $response = $context.Response
            $response.ContentType = $mime
            $response.ContentLength64 = $content.Length
            $response.OutputStream.Write($content, 0, $content.Length)
            $response.OutputStream.Close()
        }
        else {
            $response = $context.Response
            $response.StatusCode = 404
            $response.Close()
        }
    }
    catch {
        break
    }
}
