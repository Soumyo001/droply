import Image from "next/image";
import { 
    Pagination, 
    PaginationContent, 
    PaginationItem, 
    PaginationNext, 
    PaginationPrevious 
} from "../ui/pagination";
import { cn } from "@/lib/utils";
import { formatDate, formatSize, formatType } from "@/lib/utils/format-util";
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from "../ui/table"
import { Loader, Folder, ChevronRight, Home, FolderDown } from "lucide-react"
import React, { useMemo } from "react";
import { BreadCrumbItem, FileItem } from "@/lib/types";

const ITEMS_PER_PAGE: number = 10;

type Props = {
    files: FileItem[];
    loading: boolean;
    breadcrumbs: BreadCrumbItem[];
    emptyMessage: string;
    emptySubMessage: string;
    page: number;
    setPage: (page: number) => void;
    renderActions: (file: FileItem) => React.ReactNode;
    handleFolderClick: ({_id, name}: BreadCrumbItem) => void;
    handleBreadcrumbClick: (index: number) => void;
}

const FilesTable = ({
    files,
    loading,
    breadcrumbs,
    emptyMessage,
    emptySubMessage,
    page,
    setPage,
    renderActions,
    handleFolderClick,
    handleBreadcrumbClick
  }: Props) => {
  

  const total_pages = Math.max(1, Math.ceil(files.length / ITEMS_PER_PAGE));
  const paginated = useMemo<FileItem[]>(() => {
    return files.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  }, [files, page]);

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 w-full py-2 mb-2">
          {breadcrumbs.map((crumb, index) => (
              <span key={index} className="flex items-center gap-1">
                  {index === 0
                      ? <Home className="w-3.5 h-3.5 text-primary"/>
                      : <ChevronRight className="w-4 h-4 text-primary"/>}
                  <button
                      type="button"
                      disabled={index === breadcrumbs.length - 1}
                      onClick={() => handleBreadcrumbClick(index)}
                      className={cn(
                          "text-xs text-muted-foreground cursor-pointer hover:text-primary",
                          index === breadcrumbs.length - 1 && "text-primary font-semibold cursor-default"
                      )}
                  >
                      {crumb.name}
                  </button>
              </span>
          ))}
      </div>
      <div className="block w-full border border-border p-2 rounded-xl overflow-hidden">
          <Table>
              <TableHeader>
                  <TableRow className="bg-accent/70 hover:bg-accent/60 border-none">
                      <TableHead className="rounded-tl-lg rounded-bl-lg font-semibold pl-7">Name</TableHead>
                      <TableHead className="font-semibold">Type</TableHead>
                      <TableHead className="font-semibold">Size</TableHead>
                      <TableHead className="font-semibold">Added</TableHead>
                      <TableHead className="rounded-tr-lg rounded-br-lg font-semibold">Actions</TableHead>
                  </TableRow>
              </TableHeader>
              <TableBody>
                  {loading && (<TableRow>
                      <TableCell colSpan={5}>
                          <div className="relative min-h-24 w-full">
                              <div className="absolute inset-0 flex justify-center items-center w-full font-bold text-muted-foreground">
                                  <Loader className="mr-1 h-4 w-4 animate-spin"/>
                                  Fetching data...
                              </div>
                          </div>
                      </TableCell>
                  </TableRow>)}
                  {!loading && paginated.length === 0 && <TableRow className="hover:bg-accent/10">
                      <TableCell colSpan={5} className="p-0 pt-2">
                          <div className="flex flex-col justify-center items-center w-full py-20 bg-muted/20 rounded-lg border border-dashed border-muted-foreground/40">
                              <FolderDown className="w-8 h-8 text-muted-foreground"/>
                              <p className="text-base text-primary text-center mt-1">
                                  {emptyMessage}
                              </p>
                              <p className="text-xs text-muted-foreground text-center font-medium">
                                  {emptySubMessage}
                              </p>
                          </div>
                      </TableCell>
                  </TableRow>}
                  {!loading && paginated.map((file) => (
                      <TableRow key={file._id} className="hover:bg-accent/40">
                          <TableCell>
                              <div className="flex items-center gap-3 pl-1">
                                  {file.is_folder ? (
                                      <Folder className="w-8 h-8 text-blue-400 shrink-0"/>
                                  ):(
                                      <div className="relative w-8 h-8 rounded overflow-hidden shrink-0">
                                          <Image
                                              src={file.thumbnail_url ?? file.file_url}
                                              alt={file.name}
                                              fill
                                              sizes="100px"
                                              className="object-cover"
                                          />
                                      </div>
                                  )}
                                  <span 
                                      className={file.is_folder
                                                  ? "font-medium text-primary hover:text-blue-500 cursor-pointer"
                                                  : "font-medium text-primary truncate max-w-45"}
                                      onDoubleClick={() => {
                                          if(file.is_folder) {
                                              handleFolderClick({_id: file._id, name: file.name});
                                          }
                                      }}
                                  >
                                      {file.name}
                                  </span>
                              </div>
                          </TableCell>
                          <TableCell>
                              <span className="font-medium text-xs text-muted-foreground">
                                  {formatType(file.type)}
                              </span>
                          </TableCell>
                          <TableCell>
                              <span className="font-medium text-xs text-muted-foreground">
                                  {formatSize(file.size, file.is_folder)}
                              </span>
                          </TableCell>
                          <TableCell>
                              <span className="text-xs text-muted-foreground">
                                  {formatDate(file.createdAt)}
                              </span>
                          </TableCell>
                          <TableCell>
                              {renderActions(file)}
                          </TableCell>
                      </TableRow>
                  ))}
              </TableBody>
          </Table>
          {paginated.length > 0 && <p className="text-xs text-left text-muted-foreground pl-1 mt-2">
              {`${paginated.filter(file => file.is_folder).length} folder(s) · ${paginated.filter(file => !file.is_folder).length} image(s)`}
          </p>}
          {total_pages > 1 && <Pagination className="mt-4">
              <PaginationContent>
                  <PaginationItem>
                      <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                              e.preventDefault();
                              if(page > 1) setPage(page - 1);
                          }}
                          className={page === 1? "pointer-events-none opacity-50":""}
                      />
                  </PaginationItem>
                  <PaginationItem>
                      <span className="text-xs text-center text-muted-foreground px-3">
                          {`Page ${page} of ${total_pages}`}
                      </span>
                  </PaginationItem>
                  <PaginationItem>
                      <PaginationNext
                          href="#"
                          onClick={(e) => {
                              e.preventDefault();
                              if(page < total_pages) setPage(page + 1);
                          }}
                          className={page === total_pages? "pointer-events-none opacity-50":""}
                      />
                  </PaginationItem>
              </PaginationContent>
          </Pagination>}
      </div>
    </>
  )
}

export default FilesTable