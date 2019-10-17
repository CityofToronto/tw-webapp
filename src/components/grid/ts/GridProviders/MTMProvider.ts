// import apolloClient from '@/apollo';
// import { dispatchError } from '@/apollo/lib/utils';
// import { GridFilterModel, RowData } from '@/types/grid';
// import gql from 'graphql-tag';
// import BaseGridProvider from './BaseGridProvider';
// import GridInstance from '../../GridInstance';

// export class MTMProvider extends BaseGridProvider {
//   private relatedData: {
//     tableName: string;
//     rowId: number;
//   };

//   private linkingTableName: string;

//   public constructor(
//     tableName: string,
//     relatedData: {
//       tableName: string;
//       rowId: number;
//     },
//   ) {
//     super(tableName);
//     this.relatedData = relatedData;
//     this.linkingTableName = `${this.relatedData.tableName}_${this.tableName}`;
//   }

//   public async subscribeToData(gridInstance: GridInstance): Promise<void> {}

//   public async getData(): Promise<RowData[]> {
//     return [];
//   }

//   // Row to add in this case is just an ID
//   // We create a link in the linking table
//   // @ts-ignore
//   public async addData(rowToAdd: RowData): Promise<void> {
//     apolloClient
//       .mutate({
//         mutation: gql`
//         mutation {
//           insert_${this.linkingTableName} (
//             objects: {
//               ${this.relatedData.tableName}_id: ${this.relatedData.rowId},
//               ${this.tableName}_id: ${rowToAdd.id},
//             }
//           ) {
//             affected_rows
//           }
//         }
//       `,
//       })
//       .then(
//         (response): void =>
//           response.data[`insert_${this.tableName}`].returning[0],
//       )
//       .catch((error): never => dispatchError(error));
//   }

//   // Opposite of adding a row, filter for where ids match and delete entry'
//   // @ts-ignore
//   public removeData(
//     idToDelete: string,
//     successCallback: () => void = (): void => {},
//     failCallback: () => void = (): void => {},
//   ): Promise<RowData> {
//     return apolloClient
//       .mutate({
//         mutation: gql`
//         mutation {
//           delete_${this.linkingTableName} (
//             where: {
//               ${this.relatedData.tableName}_id: {_eq: ${this.relatedData.rowId}},
//               ${this.tableName}_id: {_eq: ${idToDelete}},
//             }
//           ) {
//             affected_rows
//           }
//         }
//       `,
//       })
//       .then((response): RowData => response)
//       .catch((error): void => {
//         failCallback();
//         dispatchError(error);
//       });
//   }

//   // @ts-ignore
//   public updateData(
//     rowToUpdate: RowData,
//     // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   ): void {}
// }
