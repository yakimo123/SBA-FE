/**
 * Helper function to decode a Base64 string and trigger an Excel file download.
 * 
 * @param base64String The Base64 encoded string of the Excel file.
 * @param fileName The desired name for the downloaded file (e.g., "Report.xlsx").
 */
export const downloadExcelFileFromBase64 = (base64String: string, fileName: string) => {
  // Decode base64 
  const byteCharacters = atob(base64String);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  
  // Create Blob data for Excel file
  const blob = new Blob([byteArray], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
  
  // Create a hidden link and trigger download
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
