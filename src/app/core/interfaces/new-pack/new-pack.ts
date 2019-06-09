// this interface use for new pack added
export interface NewPack {
    packName: string;
    packPath: string;
    packViewMode: string;
    packCover: string;
    itemsCount: number;
    removedItems: any[];
    addedItems: any[];
}
