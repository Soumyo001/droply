
import { relations } from "drizzle-orm";
import { integer, text, boolean, pgTable, uuid, timestamp } from "drizzle-orm/pg-core";

export const files = pgTable("files", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    path: text("path").notNull(),
    size: integer("size").notNull(),
    type: text("type").notNull(),

    // storage information
    fileUrl: text("file_url").notNull(),
    thumbnailUrl: text("thumbnail_url"),

    // ownership information
    userId: text("user_id").notNull(),
    parentId: uuid("parent_id"),

    // file/folder tags
    isFolder: boolean("is_folder").default(false).notNull(),
    isStarred: boolean("is_starred").default(false).notNull(),
    isTrash: boolean("is_trash").default(false).notNull(),

    // timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const fileRelations = relations(files, ({one, many}) => ({
    parent: one(files, {
        fields: [files.parentId],
        references: [files.id],
    }),
    children: many(files)
}));

export const File = typeof files.$inferSelect;