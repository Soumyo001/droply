'use client'
import UploadImageSection from '@/components/upload-image-section/upload-image-section'
import { FileText, File, Star, Trash } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import AllFilesSection from '@/components/files-section/all-files-section'
import StarredSection from '@/components/files-section/starred-section'
import TrashSection from '@/components/files-section/trash-section'
import { BreadCrumbItem } from '@/lib/types'
import { useCallback, useState } from 'react'

const FilesPage = () => {
  const [breadcrumbs, setBreadcrumbs] = useState<BreadCrumbItem[]>([
    {_id: null, name: "Home"}
  ]);
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const currentFolderId = breadcrumbs[breadcrumbs.length - 1]._id;

  const handleFolderClick = useCallback(({_id, name}: BreadCrumbItem) => {
    setBreadcrumbs(prev => [...prev, {_id, name}]);
  }, []);
  
  const handleBreadcrumbClick = useCallback((index: number) => {
    setBreadcrumbs(prev => prev.slice(0, index + 1 ));
  }, []);

  const triggerRefresh = useCallback(() => setRefreshKey(prev => prev + 1), []);

  return (
    <div className='flex md:flex-row flex-col w-full justify-start items-start gap-6'>
      <UploadImageSection 
        currentFolderId={currentFolderId}
        onSuccess={triggerRefresh}
      />
      <div className='border border-border flex-1 rounded-xl p-4 w-full'>
        <p className='flex gap-2 items-center text-xl text-left text-primary font-bold mb-6'>
          <FileText className='w-6 h-6'/> Your Files
        </p>
        <Tabs
          className={"shrink-0"}
          defaultValue={"all_files"}
        >
          <TabsList variant={"line"} className={"mb-4 pl-0 w-full"}>
            <TabsTrigger value={"all_files"} className={"cursor-pointer text-md font-semibold"}>
              <File className='w-5 h-5'/> All Files
            </TabsTrigger>
            <TabsTrigger value={"starred"} className={"cursor-pointer text-md font-semibold"}>
              <Star className='w-5 h-5'/> Starred
            </TabsTrigger>
            <TabsTrigger value={"trash"} className={"cursor-pointer text-md font-semibold"}>
              <Trash className='w-5 h-5'/> Trash
            </TabsTrigger>
          </TabsList>
          <TabsContent value={"all_files"}>
            <AllFilesSection
              refreshKey={refreshKey}
              onRefresh={triggerRefresh}
              breadcrumbs={breadcrumbs}
              currentFolderId={currentFolderId}
              handleBreadcrumbClick={handleBreadcrumbClick}
              handleFolderClick={handleFolderClick}
            />
          </TabsContent>
          <TabsContent value={"starred"}><StarredSection/></TabsContent>
          <TabsContent value={"trash"}><TrashSection/></TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default FilesPage