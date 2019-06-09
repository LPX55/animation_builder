export default interface HostImage {
    // name of adobe project that extension currently running in
    hostName: string;
    // path of jsx file that should execute as extension opened
    scriptPath: string;
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
   * converts a number into hex
   * @param {number} number - value of number
   * @return  {string} converted number to hex
   */
    numberToHex(number: number): string;
   /**
   * converts a number to rgbArray
   * @param {number} number - value of number
   * @return  {number[]} converted number array
   */
    numberToRgbArray(number: number): number[];
}
