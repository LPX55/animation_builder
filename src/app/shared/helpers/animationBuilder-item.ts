import { guid } from './helper-functions';
enum allDirections {
    'Top',
    'Right',
    'Bottom',
    'Left',
    'None'
}
export class AnimationBuilderItem {
    public name = '';
    public folderPath = '';
    public category = '';
    public types: AnimationBuilderItemType[] = [];
    public id: string;
    constructor(folderPath: string) {
        this.folderPath = folderPath;
        this.name = path.basename(this.folderPath);
        this.id = guid();
        this.category = path.basename(path.dirname(folderPath));
    }
    public addTypeToItem(type: AnimationBuilderItemType): void {
        this.types.push(type);
    }

}
export class AnimationBuilderItemType {
    public static types = {
        'In': 0,
        'Out': 1,
        'Both': 2,
        'Effect': 3
    };
    public static directions = allDirections;
    public type = -1;
    public direction = -1;
    public previewPath = '';
    public presetPath = '';
    constructor(type: number, direction: number, previewPath: string) {
        this.type = type;
        this.direction = direction;
        // this.previewPath = this.presetPath.substr(0, this.presetPath.lastIndexOf('_')) + '.gif';
        this.previewPath = previewPath.replace(/\\/g, '//');
        // type Bouth doesnt have preset
        if (type !== AnimationBuilderItemType.types.Both) {
            this.presetPath = this.previewPath.substr(0, this.previewPath.lastIndexOf('.')) + '.ffx';
        }
    }
}



