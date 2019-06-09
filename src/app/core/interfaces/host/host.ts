export default interface Host {
  // name of adobe project that extension currently running in
  hostName: string;
  // path of jsx file that should execute as extension opened
  scriptPath: string;
  // version of adobe app that extension currently running in
  hostVersion: string;
  // allowed file formats in import
  allowedExtensions: string[];
  /**
 * executes when an item drops in host application
 * @param {string} path - path of item
 * @param {string} data - option data for import most of the time its in json format
 * @return  {void}
 */
  import(path: string, data: string, asSequence): void;

  /**
 * executes when a parameter changes in setting
 * @param {number} parameterIndex - index of parameter
 * @param {number} parameterValue - value of paramter
 * @param {boolean} key - should add key or not
 * @param {object} controller - object of controller
 * @return  {void}
 */
  setParameter(parameterIndex, parameterValue, key, controller): void;

  /**
* executes when a color parameter changes in setting
* @param {number} controllerIndex - index of controller
* @param {number} red - red value
* @param {number} green - green value
* @param {number} blue - blue value
* @return  {void}
**/
  setColorParameter(controllerIndex, { red, green, blue }): void;

  /**
 * converts a number into hex
 * @param {number} number - value of number
 * @return  {string} converted number to hex
 */
  numberToHex(number: number): string;
  /**
 * round a number to two floating point
 * @param {number} number - value of number
 * @return  {string} rounded number
 */
  roundToTwo(num: any): number;
  /**
 * converts a number to rgbArray
 * @param {number} number - value of number
 * @return  {number[]} converted number array
 */
  numberToRgbArray(number: number): number[];

  /**
* function that executes when setting data come from Adobe host Application to customize arrived data
* @param {any[]} settingData - data that came from adobe host application
* @return  {any[]} restructured data
*/
  settingHandler(settingData: any[]): any[];

  /**
* if host supports keys, it will delete all keys of the property
* @param {number} controllerIndex index of controller
* @return  {void}
*/
  removeAllKeys?(controllerIndex: number): void;

  /**
  * delete effect
  * @param {number} groupIndex group index
  * @return  {void}
  */
  removeEffect?(groupIndex: number): void;

  /**
   * Open AEP file or premiere file in destination host
   * @param {string} filePath - Project path
   * @return  {void}
   */
  openProject(filePath): void;
  /**
     * open color picker in host
     * @param {number[]} rgbColor - colors array rgb
     * @return  {void}
     */
  openColorPicker(rgbColor): void;
}
