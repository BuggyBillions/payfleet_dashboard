export const getDownloadUrl = (originalUrl: string, fileName?: string) => {
  // If fileName exists, use fl_attachment:name. If not, just use fl_attachment.
  const attachmentFlag = fileName 
    ? `fl_attachment:${fileName.replace(/[^a-zA-Z0-9]/g, '_')}` 
    : 'fl_attachment';

  return originalUrl.replace('/upload/', `/upload/${attachmentFlag}/`);
};
