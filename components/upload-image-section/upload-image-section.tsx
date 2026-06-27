'use client'
import { FileUp, X, Upload } from "lucide-react"
import { Button } from "../ui/button"
import React, { useRef, useState } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Loader } from "lucide-react"
import NewFolderButton from "./new-folder-button"

type Props = {
    currentFolderId: string|null;
    onSuccess: () => void;
}

const UploadImageSection = ({currentFolderId, onSuccess}: Props) => {
    const [cover, setCover] = useState<string>("");
    const [file, setFile] = useState<File|null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        const file = e.target.files?.[0];
        if(!file) return;
        if(file.size > 5*1024*1024) {
            toast.error("File size must be less than 5MB");
            return;
        }
        setCover(URL.createObjectURL(file));
        setFile(file);
    }

    const handleUpload = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("file", file!);
            if(currentFolderId) formData.append("parent_folder_id", currentFolderId);

            const res = await fetch('/api/files/upload', {
                method: "POST",
                body: formData
            });
            const body = await res.json();
            if(!res.ok) throw new Error(body.message);
            toast.success(body.message);
            onSuccess();
            setCover("");
            setFile(null);
            if(inputRef.current) inputRef.current.value = "";
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    }

    const handleNewFolderCreate = async(folderName: string) => {
        setLoading(true);
        try {
            const res = await fetch('/api/files/create-folder', {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({name: folderName, parent_folder_id: currentFolderId ?? null}),
            });
            const body = await res.json();
            if(!res.ok) throw new Error(body.message);
            toast.success(body.message);
            onSuccess();
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className='flex flex-col gap-4 items-start md:max-w-md w-full border border-border rounded-xl p-4'>
            <p className="flex gap-2 items-center text-xl text-primary text-left font-bold">
                <FileUp className="w-5 h-5"/>
                Upload
            </p>
            <div className="flex flex-row gap-2 w-full">
                <NewFolderButton
                    loading={loading}
                    handleNewFolderCreate={handleNewFolderCreate}
                />
                <Button
                  type="button"
                  variant={"secondary"}
                  size={"lg"}
                  className={"p-4 flex-1/2 cursor-pointer"}
                  onClick={() => inputRef.current?.click()}
                >
                  <FileUp className="w-2 h-2"/>  Add Image
                </Button>
            </div>
            <label 
                htmlFor="image-upload"
                className={cn(
                  "flex h-52 max-sm:h-40 w-full max-sm:px-2 justify-center items-center cursor-pointer border border-dashed border-muted-foreground/40 hover:border-muted-foreground/70 transition-colors duration-300 rounded-xl",
                  cover && file && "h-fit hover:border-muted-foreground/40 max-sm:p-0 max-sm:h-30"
                )}
            >
                {!cover && !file && <div className="flex flex-col justify-center items-center">
                    <FileUp className="w-8 h-8 mb-2"/>
                    <p className="text-base text-primary text-center font-bold">
                        Drag and drop your image here or{" "}
                        <span
                            className="text-blue-500 underline underline-offset-1 hover:text-blue-600 transition-colors duration-200"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                inputRef.current?.click();
                            }}
                        >
                            browse
                        </span>
                    </p>
                    <p className="text-xs text-muted-foreground text-center font-semibold">Image up to 5MB</p>
                </div>}
                {cover && file && <div className="flex flex-col items-start w-full gap-2 p-4">
                    <div className="flex items-center gap-2 w-full">
                        <FileUp className="w-5 h-5"/>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs text-left text-muted-foreground font-semibold truncate">{file.name}</p>
                            <p className="text-xs text-left text-muted-foreground font-light">
                                {`${String((file.size/1024).toFixed(2))} KB`}
                            </p>
                        </div>
                        <X
                            className="w-4 h-4 text-primary opacity-70 hover:opacity-100 transition-all duration-200"
                            onClick={(e) => {
                                e.preventDefault();
                                setCover("");
                                setFile(null);
                                if(inputRef.current) inputRef.current.value = "";
                            }}
                        />
                    </div>
                    <Button
                        type="button"
                        variant={"outline"}
                        className={"w-full cursor-pointer"}
                        disabled={loading}
                        onClick={handleUpload}
                    >
                        {loading? (
                            <>
                                <Loader className="mr-2 w-4 h-4 animate-spin"/>
                                Uploading...
                            </>
                        ):(
                            <><Upload className="w-3 h-3"/> Upload Image</>
                        )}
                    </Button>
                </div>}
                <input
                    id="image-upload"
                    ref={inputRef}
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    className="hidden"
                    disabled={!!cover && !!file}
                    onChange={handleChange}
                />
            </label>
            <div>
                <p className="text-xl text-primary text-left font-bold">Tips</p>
                <ul className="list-disc pl-5 leading-7 tracking-tight">
                    <li>Images are private and only visible to you</li>
                    <li>Supported formats: JPG, PNG, GIF, WebP</li>
                    <li>Maximum file size: 5MB</li>
                </ul>
            </div>
        </div>
    )
}

export default UploadImageSection