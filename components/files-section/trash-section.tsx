'use client'
import { RefreshCcw, RotateCcw, Trash2 } from "lucide-react"
import { Button } from "../ui/button"
import { useCallback, useEffect, useState } from "react"
import { BreadCrumbItem, FileItem } from "@/lib/types"
import FilesTable from "./files-table"
import { toast } from "sonner"
import PermanentDeletebutton from "./permanent-delete-button"

const TrashSection = () => {
  const [page, setPage] = useState<number>(1);
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [trashedFiles, setTrashedFiles] = useState<FileItem[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadCrumbItem[]>([{
    _id: null, name: "Trash"
  }]);
  
  const currentFolderId = breadcrumbs[breadcrumbs.length - 1]._id;
  const handleFolderClick = useCallback(({_id, name}: BreadCrumbItem) => {
    setBreadcrumbs(prev => [...prev, {_id, name}]);
  }, []);

  const handleBreadcrumbClick = useCallback((index: number) => {
    setBreadcrumbs(prev => prev.slice(0, index + 1));
  }, []);

  const onPageChange = useCallback((page: number) => setPage(page), []);

  useEffect(() => {
    const fetchTrashFiles = async () => {
      setLoading(true);
      setPage(1);
      try {
        const res = await fetch(`/api/files/trash${currentFolderId? `?parentId=${currentFolderId}`:''}`);
        const body = await res.json();
        if(!res.ok) throw new Error(body.message);
        setTrashedFiles(body.files);
      } catch (err: any) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchTrashFiles();
  }, [currentFolderId, refreshKey]);

  const handleRestore = async(file: FileItem) => {
    try {
      const res = await fetch(`/api/files/${file._id}/trash`, {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({parent_folder_id: file.parent_folder_id || null})
      });
      const body = await res.json();
      if(!res.ok) throw new Error(body.message);
      setTrashedFiles(prev => prev.filter(f => f._id !== file._id));
      toast.success(body.message);
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  const handlePermanentDelete = async(file: FileItem) => {
    try {
      const res = await fetch(`/api/files/${file._id}/trash`, {
        method: "DELETE",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({parent_folder_id: file.parent_folder_id || null})
      });
      const body = await res.json();
      if(!res.ok) throw new Error(body.message);
      setTrashedFiles(prev => prev.filter(f => f._id !== file._id));
      toast.success(body.message);
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  return (
    <div className="flex flex-col justify-start items-start w-full">
      <div className='flex justify-between items-center w-full border-b border-border py-5 mb-4'>
        <span className="text-xl text-primary font-bold">Trash</span>
        <Button
          type="button"
          variant={"secondary"}
          size={"lg"}
          className={"cursor-pointer"}
          onClick={() => setRefreshKey(k => k + 1)}
        >
          <RefreshCcw className="w-3 h-3"/> Refresh
        </Button>
      </div>
      <FilesTable
        files={trashedFiles}
        loading={loading}
        breadcrumbs={breadcrumbs}
        emptyMessage="Trash is empty"
        emptySubMessage="Deleted files/folders will appear here"
        page={page}
        setPage={onPageChange}
        handleFolderClick={handleFolderClick}
        handleBreadcrumbClick={handleBreadcrumbClick}
        renderActions={(file: FileItem) => (
          <div className="flex items-center gap-2">
            {breadcrumbs.length === 1 && <Button
              type="button"
              variant={"ghost"}
              size={"icon"}
              className={"w-8 h-8 cursor-pointer"}
              onClick={() => handleRestore(file)}
            >
              <RotateCcw className="w-4 h-4 text-green-500"/>
            </Button>}
            <PermanentDeletebutton
              handlePermanentDelete={() => handlePermanentDelete(file)}
            />
          </div>
        )}
      />
    </div>
  )
}

export default TrashSection