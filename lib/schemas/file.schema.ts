import { Schema, models, model } from "mongoose";

const FileSchema = new Schema(
    {
        name: {type: String, required: true, trim: true},
        path: {type: String, required: true},
        size: {type: Number, required: true, default: 0},
        type: {type: String, required: true},
        
        file_url: {type: String, default: null},
        thumbnail_url: {type: String, default: null},
        cloudinary_public_id: {type: String, default: null},

        user_id: {type: String, required: true},
        parent_folder_id: {type: Schema.Types.ObjectId, ref: "File", default: null},

        is_folder: {type: Boolean, default: false},
        is_starred: {type: Boolean, default: false},
        is_trash: {type: Boolean, default: false},
    },
    {
        timestamps: true,
        collection: "files"
    }
);

FileSchema.index({user_id: 1});
FileSchema.index({user_id: 1, parent_folder_id: 1});
FileSchema.index({user_id: 1, is_starred: 1});
FileSchema.index({user_id: 1, is_trash: 1});


const File = models.File || model("File", FileSchema);
export default File;