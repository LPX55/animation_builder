import { guid } from './helper-functions';
export class AnimationBuilderCategory {
    public static types = {
        normal: 0,
        container: 1
    };
    public id = '';
    public title = '';
    public categoryPath: string;
    public type = 0;
    public innerCategories: AnimationBuilderCategory[];
    public opened = false;
    constructor(title: string, open= false, categoryPath: string, type = 0, innerCategories = []) {
        this.title = title;
        this.categoryPath = categoryPath;
        this.id = guid();
        this.type = type;
        this.innerCategories = innerCategories;
    }
}
