export function downloadFile(fileName: string, mimeType: string, blob: Blob) {
  const link = document.createElement('a')
  link.href = URL.createObjectURL(new Blob([blob], { type: mimeType }))
  link.download = fileName

  link.click()
}
