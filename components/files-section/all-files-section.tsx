'use client'
import { Button } from "../ui/button"
import { BreadCrumbItem, FileItem } from "@/lib/types";
import { RefreshCcw, Star, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import FilesTable from "./files-table";

type Props = {
    refreshKey: number;
    onRefresh: () => void;
    breadcrumbs: BreadCrumbItem[];
    currentFolderId: string|null;
    handleFolderClick: ({_id, name}: BreadCrumbItem) => void;
    handleBreadcrumbClick: (index: number) => void;
}

const AllFilesSection = ({
        refreshKey, 
        onRefresh, 
        breadcrumbs, 
        currentFolderId, 
        handleFolderClick, 
        handleBreadcrumbClick 
    }: Props) => {
    const [files, setFiles] = useState<FileItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [page, setPage] = useState<number>(1);
    const onPageChange = useCallback((page: number) => setPage(page), []);
    useEffect(() => {
        const fetchFiles = async() => {
            setLoading(true);
            setPage(1);
            try {
                const res = await fetch(`/api/files${currentFolderId? `?parentId=${currentFolderId}`:''}`);
                const body = await res.json();
                if(!res.ok) throw new Error(body.message);
                setFiles(body.files);
            } catch (err: any) {
                toast.error(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchFiles();
    }, [currentFolderId, refreshKey]);

    const handleStar = async(file: FileItem) => {
        try {
            const res = await fetch(`/api/files/${file._id}/star`, {
                method: "PATCH",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({parent_folder_id: file.parent_folder_id || null})
            });
            const body = await res.json();
            if(!res.ok) throw new Error(body.message);
            setFiles(prev => 
                prev.map<FileItem>(f => f._id === file._id? {...f, is_starred: !f.is_starred} : f)
            )
            toast.success(body.message);
        } catch (err: any) {
            toast.error(err.message);
        }
    }

    const handleTrash = async(file: FileItem) => {
        try {
            const res = await fetch(`/api/files/${file._id}/trash`, {
                method: "PATCH",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({parent_folder_id: file.parent_folder_id || null})
            });
            const body = await res.json();
            if(!res.ok) throw new Error(body.message);
            setFiles(prev => prev.filter(f => f._id !== file._id));
            toast.success(body.message);
        } catch (err: any) {
            toast.error(err.message);
        }
    }

    return (
        <div className="flex flex-col justify-start items-start w-full">
            <div className="flex justify-between items-center w-full border-b py-5 mb-4">
                <span className="text-xl text-primary font-bold">All Files</span>
                <Button
                    type="button"
                    variant={"secondary"}
                    size={"lg"}
                    className={"cursor-pointer"}
                    onClick={onRefresh}
                >
                    <RefreshCcw className="w-3 h-3"/> Refresh
                </Button>
            </div>
            <FilesTable
                files={files}
                loading={loading}
                breadcrumbs={breadcrumbs}
                emptyMessage="No files uploaded yet"
                emptySubMessage="Upload or create a folder to start your journey!"
                page={page}
                setPage={onPageChange}
                renderActions={(file) => (
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant={"ghost"}
                            size={"icon"}
                            className={"cursor-pointer w-8 h-8"}
                            onClick={() => handleStar(file)}
                        >
                            <Star className={`w-4 h-4 ${file.is_starred ? "fill-amber-400 text-amber-400":""}`}/>
                        </Button>
                        <Button
                            type="button"
                            variant={"ghost"}
                            size={"icon"}
                            className={"cursor-pointer w-8 h-8"}
                            onClick={() => handleTrash(file)}
                        >
                            <Trash2 className="w-4 h-4 text-destructive hover:text-destructive"/>
                        </Button>
                    </div>
                )}
                handleFolderClick={handleFolderClick}
                handleBreadcrumbClick={handleBreadcrumbClick}
            />
        </div>
  )
}

export default AllFilesSection