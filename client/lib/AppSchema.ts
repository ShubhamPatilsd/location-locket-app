import {
  Column,
  ColumnType,
  Index,
  IndexedColumn,
  Schema,
  Table,
} from "@journeyapps/powersync-sdk-react-native";

export const AppSchema = new Schema([
  new Table({
    name: "users",
    columns: [
      new Column({ name: "id", type: ColumnType.TEXT }),
      new Column({ name: "firstName", type: ColumnType.TEXT }),
      new Column({ name: "lastName", type: ColumnType.TEXT }),
      new Column({ name: "email", type: ColumnType.TEXT }),
      new Column({ name: "profilePicture", type: ColumnType.TEXT }),
      new Column({ name: "lastKnownLocation", type: ColumnType.TEXT }),
      new Column({ name: "createdAt", type: ColumnType.TEXT }),
      new Column({ name: "updatedAt", type: ColumnType.TEXT }),
    ],
    indexes: [new Index({ name: "user_id", columns: [new IndexedColumn({ name: "id" })] })],
  }),
  new Table({
    name: "groups",
    columns: [
      new Column({ name: "id", type: ColumnType.TEXT }),
      new Column({ name: "name", type: ColumnType.TEXT }),
      new Column({ name: "code", type: ColumnType.INTEGER }),
      new Column({ name: "createdAt", type: ColumnType.TEXT }),
      new Column({ name: "updatedAt", type: ColumnType.TEXT }),
    ],
    indexes: [new Index({ name: "group_id", columns: [new IndexedColumn({ name: "id" })] })],
  }),
  new Table({
    name: "group_to_user",
    columns: [
      new Column({ name: "group_id", type: ColumnType.TEXT }),
      new Column({ name: "user_id", type: ColumnType.TEXT }),
    ],
    indexes: [
      new Index({
        name: "group_to_user_group_id",
        columns: [new IndexedColumn({ name: "group_id" })],
      }),
      new Index({
        name: "group_to_user_user_id",
        columns: [new IndexedColumn({ name: "user_id" })],
      }),
    ],
  }),
  new Table({
    name: "posts",
    columns: [
      new Column({ name: "id", type: ColumnType.TEXT }),
      new Column({ name: "frontImage", type: ColumnType.TEXT }),
      new Column({ name: "backImage", type: ColumnType.TEXT }),
      new Column({ name: "caption", type: ColumnType.TEXT }),
      new Column({ name: "location", type: ColumnType.TEXT }),
      new Column({ name: "authorId", type: ColumnType.TEXT }),
      new Column({ name: "groupId", type: ColumnType.TEXT }),
      new Column({ name: "createdAt", type: ColumnType.TEXT }),
      new Column({ name: "updatedAt", type: ColumnType.TEXT }),
    ],
    indexes: [
      new Index({ name: "post_id", columns: [new IndexedColumn({ name: "id" })] }),
      new Index({ name: "post_author_id", columns: [new IndexedColumn({ name: "authorId" })] }),
      new Index({ name: "post_group_id", columns: [new IndexedColumn({ name: "groupId" })] }),
    ],
  }),
]);
