export type FileItem = {
    _id: string;
    name: string;
    path: string;
    size: number;
    type: string;
    file_url: string;
    thumbnail_url: string;
    cloudinary_public_id: string;
    user_id: string;
    parent_folder_id: string|null;
    is_folder: boolean;
    is_starred: boolean;
    is_trash: boolean;
    createdAt: string;
    updatedAt: string;
};