export default class General {
  public JSONLibraryPath = 'hosts/general/json.jsx';
  public ddHelperPath = 'hosts/general/ddHelper.jsx';
  /**
* Converts decimal number to RGB array
* @param {number} number - decimal number
*
* @return {Array} - RGB color array
*/
  numberToRgbArray(number: number): number[] {
    const red = Math.floor(number / (256 * 256)),
      green = Math.floor(number / 256) % 256,
      blue = number % 256;
    const redGreenBlue = [red, green, blue];
    return redGreenBlue;
  }
  /**
   * Converts decimal number to hex CSS syntax
   * @param {number} number - decimal number
   *
   * @return {string} - hex CSS syntax
   */
  numberToHex(number: number): string {
    /* tslint:disable:no-bitwise */
    let red = ((0xff0000 & number) >> 16).toString(16),
      green = ((0x00ff00 & number) >> 8).toString(16),
      blue = (0x0000ff & number).toString(16);
    /* tslint:enable:no-bitwise */
    if (red.length === 1) { red = `0${red}`; }
    if (green.length === 1) { green = `0${green}`; }
    if (blue.length === 1) { blue = `0${blue}`; }
    return `#${red}${green}${blue}`;
  }
  /**
 * Converts color value that is between 0-1 to 0-255
 * @param {number|number[]} number - decimal number
 *
 * @return  {number|number[]} converted number
 */
  convertColorRelativeValueToBase255(number: number | number[]): number | number[] {
    if (Array.isArray(number)) {
      return number.map((num) => {
        return num * 255;
      });
    }
    return number * 255;
  }
  /**
 * Converts color value that is between 0-255 to 0-1
 * @param {number|number[]} number - decimal number
 *
 * @return  {number|number[]} converted number
 */
  convertColorBase255RelativeValueToBase1(number: number | number[]): number | number[] {
    if (Array.isArray(number)) {
      return number.map((num) => {
        return num / 255.0;
      });
    }
    return number / 255.0;
  }
  roundToTwo(num: any): number {
    return Math.round(num * 100) / 100;
  }

  /**
* converts an absolute value to realive
* @param {Array} value array of absolute values
* @param {Object} frameSize framesize object for exampe {x:500, y:680}
* @example convertAbsoluteValueToRelativeValue([789,265], {x:1920,y:1080})
* @return {Array} converted values
*/
  convertAbsoluteValueToRelativeValue(value: number[], frameSize: object): number[] {
    return value.map((item, index) => {
      return item / (Object.values(frameSize)[index]);
    });
  }
  /**
  * converts an relative value to absolute
  * @param {Array} value array of relative values
  * @param {Object} frameSize framesize object for example {x:500, y:680}
  * @example convertRelativeValueToAbsoluteValue([0.5,0.9], {x:1920,y:1080})
  * @return {Array} converted values
  */
  convertRelativeValueToAbsoluteValue(value: number[], frameSize: object): number[] {
    return value.map((item, index) => {
      return item * (Object.values(frameSize)[index]);
    });
  }

  /**
* make a json ready for send to host application
* @param jsonString stringified object
* @return {string} escaped json
*/
  escape(jsonString): string {
    if (typeof (jsonString) !== 'string') { return jsonString; }
    return jsonString.replace(/[\\]/g, '\\\\')
      .replace(/[\/]/g, '\\/')
      .replace(/[\b]/g, '\\b')
      .replace(/[\f]/g, '\\f')
      .replace(/[\n]/g, '\\n')
      .replace(/[\r]/g, '\\r')
      .replace(/[\t]/g, '\\t')
      .replace(/\\'/g, '\\\'');
  }

  /**
* Converts rgb color to adobe hex value
* @param {number[]} rgb - rgb color
*
* @return  {string} hex color
*/
  rgbToHex(rgb): string {
    /* tslint:disable:no-bitwise */
    return '0x' + ((1 << 24) + (rgb[0] << 16) + (rgb[1] << 8) + rgb[2]).toString(16).slice(1);
    /* tslint:enable:no-bitwise */
  }
}
