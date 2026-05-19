import { posix } from "path";

export const buildCloudinaryPath = (
    user_id: string,
    parent_folder_path: string,
    parent_folder_name: string
): string => posix.join("droply", user_id, parent_folder_path, parent_folder_name);

export const buildMongodbPath = (
    parent_folder_path: string,
    parent_folder_name: string
): string => posix.join("/", parent_folder_path, parent_folder_name, "/");

export const escapeRegex = (str: string) =>
    str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");