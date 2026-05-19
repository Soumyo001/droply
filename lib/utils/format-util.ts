export const formatType = (type: string): string => {
    if(type === "folder") return "Folder";
    if(type === "image/jpeg") return "JPEG";
    if(type === "image/png") return "PNG";
    if(type === "image/webp") return "WEBP";
    return type;
}

export const formatSize = (size: number, isFolder: boolean): string => {
    if(isFolder) return "—";
    if(size <= 1024) return `${String(size)} B`;
    if(size <= 1024 * 1024) return `${(size/1024).toFixed(1)} KB`;
    return `${(size / (1024*1024)).toFixed(1)} MB`;
}

export const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString("en-US", {
        month:'short', day: 'numeric', year: 'numeric'
    });
}