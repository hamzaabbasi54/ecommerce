$word = New-Object -ComObject Word.Application
$word.Visible = $false
$doc = $word.Documents.Open("c:\Users\hamza\Desktop\ecommerce\Full Stack E-Commerce Web Application (1).docx")
$text = $doc.Content.Text
$doc.Close()
$word.Quit()
Write-Output $text
