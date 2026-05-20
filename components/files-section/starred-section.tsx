import { useCallback, useEffect, useState } from 'react'
import { Button } from '../ui/button'
import { RefreshCcw, Star } from 'lucide-react'
import { BreadCrumbItem, FileItem } from '@/lib/types'
import FilesTable from './files-table'
import { toast } from 'sonner'

const StarredSection = () => {
  const [starredFiles, setStarredFiles]= useState<FileItem[]>([]);
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadCrumbItem[]>([{
    _id: null, name: "Star"
  }]);

  const currentFolderId = breadcrumbs[breadcrumbs.length - 1]._id;
  const handleFolderClick = useCallback(({ _id, name }: BreadCrumbItem) => {
    setBreadcrumbs(prev => [...prev, {_id, name}]);
  }, []);
  const handleBreadcrumbClick = useCallback((index: number) => {
    setBreadcrumbs(prev => prev.slice(0, index + 1));
  }, []);

  const onPageChange = useCallback((page: number) => setPage(page), []);

  useEffect(() => {
    const fetchStarred = async () => {
      setLoading(true);
      setPage(1);
      try {
        const res = await fetch(`/api/files/star${currentFolderId? `?parentId=${currentFolderId}`:''}`);
        const body = await res.json();
        if(!res.ok) throw new Error(body.message);
        setStarredFiles(body.files);
      } catch (err: any) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchStarred();
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
      setStarredFiles(prev =>
        prev.map(f => f._id === file._id ? {...f, is_starred: !f.is_starred}:f)
      );
      
      toast.success(body.message);
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  return (
    <div className='flex flex-col justify-start items-start w-full'>
      <div className='flex items-center justify-between w-full py-5 mb-4 border-b border-border'>
        <span className='text-xl text-primary text-left font-bold'>Starred</span>
        <Button
          type='button'
          variant={"secondary"}
          size={"lg"}
          className={"cursor-pointer"}
          onClick={() => setRefreshKey(k => k + 1)}
        >
          <RefreshCcw className='w-3 h-3'/> Refresh
        </Button>
      </div>
      <FilesTable
        files={starredFiles}
        loading={loading}
        breadcrumbs={breadcrumbs}
        emptyMessage='No starred files yet'
        emptySubMessage='Star files to find them quickly later'
        page={page}
        setPage={onPageChange}
        handleFolderClick={handleFolderClick}
        handleBreadcrumbClick={handleBreadcrumbClick}
        renderActions={(file: FileItem) => (
          <div className='flex justify-center'>
            <Button
              type='button'
              variant={'ghost'}
              size={'icon'}
              className={'w-8 h-8 cursor-pointer'}
              onClick={() => handleStar(file)}
            >
              <Star className={`w-4 h-4 ${file.is_starred? "fill-amber-500 text-amber-500":""}`}/>
            </Button>
          </div>
        )}
      />
    </div>
  )
}

export default StarredSection