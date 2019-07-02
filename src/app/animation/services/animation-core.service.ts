import { JsxInjectorService } from './../../core/services/jsx-injector/jsx-injector.service';
import { AnimationBuilderItem, AnimationBuilderItemType } from './../../shared/helpers/animationBuilder-item';
import { AnimationBuilderCategory } from './../../shared/helpers/animationBuilder-category';
import { OsInfoService } from './../../core/services/operating-system/os-info.service';
import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class AnimationCoreService {
  public svgHtml: SafeHtml;
  public animationTypeFilter = 0;
  public showDropArea = new BehaviorSubject(false);
  public dropAreaOptions = { activeType: null, allTypes: [] };
  public showCategory = new BehaviorSubject(this.getAllCategories(this.textBuilderSourceFolder)[0]);
  public isAnyPackInstalled = new BehaviorSubject(false);
  constructor(
    private router: Router,
    private _osInfoService: OsInfoService,
    private _jsxInjectorService: JsxInjectorService
  ) { }




  getAllCategories(sourceFolder): AnimationBuilderCategory[] {
    const folders = this.getDirectories(sourceFolder);
    return folders.map(source => {
      let folderName = path.basename(source);
      folderName = folderName.substr(folderName.indexOf('_') + 1, folderName.length);
      return folderName.indexOf('&') > -1 ?
        new AnimationBuilderCategory(folderName, false, source, AnimationBuilderCategory.types.container, this.getAllCategories(source))
        : new AnimationBuilderCategory(folderName, false, source);
    });
  }

  get textBuilderSourceFolder(): string {
    return this._osInfoService.gettextanimatorAppDataFolder() + '/packs/premium';
  }
  get textBuilderPath(): string {
    return this._osInfoService.gettextanimatorAppDataFolder() + '/packs';
  }


  getCategoryItems(categoryPath, categoryType = 0): AnimationBuilderItem[] {
    if (!categoryPath) { return []; }
    const items = this.getDirectories(categoryPath);
    if (categoryType === 0) {
      return items.map(item => {
        const animationItem = new AnimationBuilderItem(item);
        this.processItem(animationItem);
        return animationItem;
      });
    } else {
      const innerItems = [];
      const categoryItems = items.map(item => {
        return this.getCategoryItems(item, 0);
      });
      categoryItems.forEach((itemsArray) => {
        itemsArray.forEach((item) => {
          innerItems.push(item);
        });
      });
      return innerItems;
    }

  }

  getDirectories(sourcePath): any[] {
    if(!fs.existsSync(sourcePath)) return [];
    const isDirectory = source => fs.lstatSync(source).isDirectory();
    return fs.readdirSync(sourcePath).map(name => path.join(sourcePath, name)).filter(isDirectory);
  }
  processItem(item: AnimationBuilderItem): void {
    fs.readdirSync(item.folderPath).forEach(element => {
      const regEx = /^.*\_(.+)_(.{0,2})\.gif$/gm;
      const match = regEx.exec(element);
      if (match) {
        let type;
        let direction;

        // check type
        switch (match[1]) {
          case 'In':
            type = AnimationBuilderItemType.types.In;
            break;
          case 'Both':
            type = AnimationBuilderItemType.types.Both;
            break;
          case 'Out':
            type = AnimationBuilderItemType.types.Out;
            break;
          case 'Effect':
            type = AnimationBuilderItemType.types.Effect;
            break;
          default:
            type = -1;
            break;
        }

        // check direction
        switch (match[2]) {
          case 'R':
            direction = AnimationBuilderItemType.directions.Right;
            break;
          case 'T':
            direction = AnimationBuilderItemType.directions.Top;
            break;
          case 'L':
            direction = AnimationBuilderItemType.directions.Left;
            break;
          case 'B':
            direction = AnimationBuilderItemType.directions.Bottom;
            break;
          case 'N':
            direction = AnimationBuilderItemType.directions.None;
            break;
          default:
            direction = -1;
            break;
        }
        if (type !== -1) {
          item.addTypeToItem(new AnimationBuilderItemType(type, direction, path.join(item.folderPath, element),
          this._jsxInjectorService.hostEnvironment.appId === 'PPRO'));
        }
      }
    });
  }

  applyPreset(presetPath: string[], presetType: number): void {
    let command = '';
    switch (presetType) {
      case AnimationBuilderItemType.types.In: {
        command = `$._TextAnimator.applyIn("${presetPath[0]}")`;
        break;
      }
      case AnimationBuilderItemType.types.Out: {
        command = `$._TextAnimator.applyOut("${presetPath[0]}")`;
        break;
      }
      case AnimationBuilderItemType.types.Both: {
        command = `$._TextAnimator.applyBoth('${JSON.stringify(presetPath)}')`;
        break;
      }
      case AnimationBuilderItemType.types.Effect: {
        command = `$._TextAnimator.applyEffect('${presetPath[0]}')`;
        break;
      }
      default: break;

    }
    this._jsxInjectorService.evalScript(command,()=>{
      setTimeout(()=>this._jsxInjectorService.evalScript("TextAnimatorObject.fixExpressions()"),300);
    });
  }
  checkAnyPackInstalled(){
    !fs.existsSync(this.textBuilderPath) && fs.mkdirSync(this.textBuilderPath);
    if(fs.existsSync(this.textBuilderSourceFolder)){
      this.isAnyPackInstalled.next(true);
      this.showCategory.next(this.getAllCategories(this.textBuilderSourceFolder)[0]);
    }
    else{
      this.isAnyPackInstalled.next(false);
    }
  }

}
