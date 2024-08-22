export function downloadAsPdf(fileName: string, blob: Blob) {
  const link = document.createElement('a')
  link.href = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }))
  link.download = `${fileName}.pdf`

  link.click()
}
