//const https = require('https');
import * as https from 'https';

export class Foobot {

  public readonly BASE_HREF: string = 'https://api.foobot.io/v2';

  constructor(
    public readonly apiKey: string,
  ) {
    return;
  }

  /**
   * List devices associated with user
   */
  async getDevices(userName: string) : Promise<any[]> {

    userName = encodeURIComponent(userName);

    const url = `${this.BASE_HREF}/owner/${userName}/devices`;

    return this.request(url);

  }

  /**
   * List devices associated with user
   */
  async getLastDataPoints(uuid: string, period?: number, averageBy?: number, sensorList?: string) : Promise<any> {

    if (!uuid) {
      throw new Error('UUID required');
    }

    uuid = encodeURIComponent(uuid);
    const encodedPeriod = encodeURIComponent(period || 0);
    const encodedAverageBy = encodeURIComponent(averageBy || 0);

    let url = `${this.BASE_HREF}/device/${uuid}/datapoint/${encodedPeriod}/last/${encodedAverageBy}/`;
    if (typeof sensorList !== 'undefined') {

      sensorList = encodeURIComponent(sensorList);
      url += `?sensorList=${sensorList}`;

    }

    return this.request(url);

  }

  async request(url: string, options?: any) : Promise<any> {

    return new Promise((resolve, reject) => {

      if (typeof options === 'undefined') {

        options = {};

      }

      if (typeof options.headers === 'undefined') {

        options.headers = {};

      }

      options.headers['accept'] = 'application/json;charset=UTF-8';
      options.headers['x-api-key-token'] = this.apiKey;

      https.get(url, options, (res) => {

        const { statusCode } = res;
        const contentType = res.headers['content-type'];

        let err;
        if (statusCode && (statusCode < 200 || statusCode >= 300)) {

          err = new Error(`Request Failed ${statusCode} ${url}`);

        } else if (!/^application\/json/.test(contentType as string)) {

          err = new Error(`Invalid content-type; Expected application/json; Received ${contentType}; ${url}`);

        }
        if (err) {
          // Consume response data to free up memory
          res.resume();
          reject(err);
          return;
        }

        res.setEncoding('utf8');
        let rawData = '';
        res.on('data', (chunk) => {
          rawData += chunk;
        });
        res.on('end', () => {
          try {
            const parsedData = JSON.parse(rawData);
            resolve(parsedData);
          } catch (err: any) {
            reject(err);
          }
        });

      }).on('error', (err) => {
        reject(err);
      });

    });

  }

}
