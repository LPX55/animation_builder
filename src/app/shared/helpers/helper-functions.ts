/**
* Generates API URL for different actions
*
* @param String subdirectory
* @return String - generated API URL.
*/
export const generateAPI = (subdirectory: string): string => {
    const rootAPI = 'http://webservice.pixflow.co/services/api/';
    const generatedAPI = rootAPI + subdirectory;
    return generatedAPI;
};

/**
   * Changes a boolean to number.
   * @since 0.0.1
   * @param {boolean} value
   * @return {number} - True will be 1 and False will be 0.
   */
export const booleanToNumber = (value: boolean): number => {
    return value ? 1 : 0;
};

export const guid = () => {
    const s4 = () => {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    };
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
};
