// Method to remove eveything before the last slash in a path, used to convert from absolute paths in the route definitions to relative paths in the router config
export const cleanPath = (path: string) => {
    const lastSlashIndex = path.lastIndexOf('/');
    return lastSlashIndex !== -1 ? path.substring(lastSlashIndex + 1) : path;
};