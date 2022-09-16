import { Service, PlatformAccessory, CharacteristicValue } from "homebridge";

import { FoobotHomebridgePlatform } from "./platform";
import { Foobot } from "./foobot";

const REQUESTS_PER_DEVICE_PER_DAY = 200;

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class FoobotPlatformAccessory {
  private airQualitySensor: Service;
  private carbonDioxideSensor: any;
  private humiditySensor: Service;
  private temperatureSensor: Service;
  private accessoryInformation: any;
  private timeout: any;
  private delay: number;
  private active: boolean;

  constructor(
    private readonly platform: FoobotHomebridgePlatform,
    private readonly accessory: PlatformAccessory,
  ) {

    const mac = accessory.context.device.mac.match(/[A-F0-9]{2}/gi).join(":");

    // initialize persistent data
    if (typeof accessory.context.data === "undefined") {

      accessory.context.data = {
        airquality: this.platform.Characteristic.AirQuality.UNKNOWN,
        pm25density: 0,
        vocdensity: 0,
        currentTemperature: 0,
        currentRelativeHumidity: 0,
        carbonDioxideLevel: 0,
        carbonDioxidePeakLevel: 0,
        time: 0
      };

    }

    // set initial delay
    this.active = false;
    this.delay = 10 * 60 * 1000;

    // set accessory information
    this.accessoryInformation = this.accessory.getService(this.platform.Service.AccessoryInformation);
    this.accessoryInformation!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, "Airboxlab SA")
      .setCharacteristic(this.platform.Characteristic.SerialNumber, accessory.context.device.uuid)
      .setCharacteristic(this.platform.Characteristic.Model, "Foobot")
      .setCharacteristic(this.platform.Characteristic.FirmwareRevision, this.platform.version)
      .setCharacteristic(this.platform.Characteristic.AppMatchingIdentifier, "id909284570");

    // get the AirQualitySensor service if it exists, otherwise create a new AirQualitySensor service
    // you can create multiple services for each accessory
    this.airQualitySensor = this.accessory.getService(this.platform.Service.AirQualitySensor) || this.accessory.addService(this.platform.Service.AirQualitySensor);
    this.temperatureSensor = this.accessory.getService(this.platform.Service.TemperatureSensor) || this.accessory.addService(this.platform.Service.TemperatureSensor);
    this.humiditySensor = this.accessory.getService(this.platform.Service.HumiditySensor) || this.accessory.addService(this.platform.Service.HumiditySensor);
    this.carbonDioxideSensor = this.accessory.getService(this.platform.Service.CarbonDioxideSensor) || this.accessory.addService(this.platform.Service.CarbonDioxideSensor);

    // set the service name, this is what is displayed as the default name on the Home app
    // in this example we are using the name we stored in the `accessory.context` in the `discoverDevices` method.
    this.airQualitySensor.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.name + " Air Quality");
    this.temperatureSensor.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.name + " Temperature");
    this.humiditySensor.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.name + " Humidity");
    this.carbonDioxideSensor.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.name + " Carbon Dioxide");

    // create handlers for required characteristics
    this.airQualitySensor.getCharacteristic(this.platform.Characteristic.AirQuality)
      .onGet(this.handleAirQualityGet.bind(this));
    this.temperatureSensor.getCharacteristic(this.platform.Characteristic.CurrentTemperature)
      .onGet(this.handleCurrentTemperatureGet.bind(this));
    this.humiditySensor.getCharacteristic(this.platform.Characteristic.CurrentRelativeHumidity)
      .onGet(this.handleCurrentRelativeHumidityGet.bind(this));
    this.carbonDioxideSensor.getCharacteristic(this.platform.Characteristic.CarbonDioxideDetected)
      .onGet(this.handleCarbonDioxideDetectedGet.bind(this));

    // create handlers for optional characteristics
    this.airQualitySensor.getCharacteristic(this.platform.Characteristic.PM2_5Density)
      .onGet(this.handlePM2_5DensityGet.bind(this));
    this.airQualitySensor.getCharacteristic(this.platform.Characteristic.VOCDensity)
      .onGet(this.handleVOCDensityGet.bind(this));
    this.carbonDioxideSensor.getCharacteristic(this.platform.Characteristic.CarbonDioxideLevel)
      .onGet(this.handleCarbonDioxideLevelGet.bind(this));
    this.carbonDioxideSensor.getCharacteristic(this.platform.Characteristic.CarbonDioxidePeakLevel)
      .onGet(this.handleCarbonDioxidePeakLevelGet.bind(this));

    // remove CO2 service
    if (this.platform.config.co2off) {
      this.accessory.removeService(this.carbonDioxideSensor);
    }

    this.platform.log.debug("Finished initializing accessory:", accessory.context.device.name);

    /**
     * Updating characteristics values asynchronously.
     * Setup an interval to run based on Foobot API quotas
     * also, always update at startup
     */
    const MINUTES_PER_REQUEST = 24 * 60 / REQUESTS_PER_DEVICE_PER_DAY;
    this.updatecharacteristics();

  }

  /**
   * Handle requests to get the current value of the "Air Quality" characteristic
   */
  handleAirQualityGet() {

    // set this to a valid value for AirQuality
    const currentValue = this.accessory.context.data.airquality;

    return currentValue;

  }

  /**
   * Handle requests to get the current value of the "PM2.5 Density" characteristic
   */
  handlePM2_5DensityGet() {

    // set this to a valid value for PM2.5 Density
    const currentValue = this.accessory.context.data.pm25density;

    return currentValue;

  }

  /**
   * Handle requests to get the current value of the "VOC Density" characteristic
   */
  handleVOCDensityGet() {

    // set this to a valid value for VOC Density
    const currentValue = this.accessory.context.data.vocdensity;

    return currentValue;

  }

  /**
   * Handle requests to get the current value of the "Current Temperature" characteristic
   */
  handleCurrentTemperatureGet() {

    // set this to a valid value for CurrentTemperature
    const currentValue = this.accessory.context.data.currentTemperature;

    return currentValue;

  }

  /**
   * Handle requests to get the current value of the "Current Relative Humidity" characteristic
   */
  handleCurrentRelativeHumidityGet() {

    // set this to a valid value for CurrentRelativeHumidity
    const currentValue = this.accessory.context.data.currentRelativeHumidity;

    return currentValue;

  }

  /**
   * Handle requests to get the current value of the "Carbon Dioxide Detected" characteristic
   */
  handleCarbonDioxideDetectedGet() {

    // set this to a valid value for CarbonDioxideDetected
    const currentValue = this.detectCO2(this.accessory.context.data.carbonDioxideLevel);

    return currentValue;

  }

  /**
   * Handle requests to get the current value of the "Carbon Dioxide Level" characteristic
   */
  handleCarbonDioxideLevelGet() {

    // set this to a valid value for CarbonDioxideLevel
    const currentValue = this.accessory.context.data.carbonDioxideLevel;

    return currentValue;

  }

  /**
   * Handle requests to get the current value of the "Carbon Dioxide Peak Level" characteristic
   */
  handleCarbonDioxidePeakLevelGet() {

    // set this to a valid value for CarbonDioxidePeakLevel
    const currentValue = this.accessory.context.data.carbonDioxidePeakLevel;

    return currentValue;

  }

  async updatecharacteristics() {

    // fetch new data from the Foobot API
    this.platform.log.info("Updating datapoints for " + this.accessory.context.device.name);
    let datapoints;
    try {

      const foobot = new Foobot(this.platform.config.apiKey);
      const uuid = this.accessory.context.device.uuid;
      let sensorList = "pm,voc,tmp,hum,allpollu";
      if (!this.platform.config.co2off) {

        sensorList += ",co2";

      }
      datapoints = await foobot.getLastDataPoints(uuid, 0, 0, sensorList);
      this.setActive(true);

    } catch (err: any) {

      this.platform.log.error(err.message);
      this.setActive(false);

      // try again in a few minutes
      const delay = Math.round(10 * 60 * 1000 * Math.random());
      clearTimeout(this.timeout);
      this.timeout = setTimeout(this.updatecharacteristics.bind(this), delay);
      this.platform.log.info(`Waiting ${delay}ms to try again`);

      return;

    }

    this.platform.log.debug(datapoints);

    // push the new values to HomeKit
    const pmIndex = datapoints.sensors.indexOf("pm");
    if (pmIndex >= 0) {

      // constrain value to characteristic limits
      let pmValue = datapoints.datapoints[0][pmIndex];
      pmValue = (pmValue < 0) ? 0 : pmValue;
      pmValue = (pmValue > 1000) ? 1000 : pmValue;

      // update value in the dynamic platform persistent storage
      this.accessory.context.data.pm25density = pmValue;

      this.airQualitySensor.updateCharacteristic(
        this.platform.Characteristic.PM2_5Density,
        this.accessory.context.data.pm25density
      );

    }

    const tmpIndex = datapoints.sensors.indexOf("tmp");
    if (tmpIndex >= 0) {

      // constrain value to characteristic limits
      let tmpValue = datapoints.datapoints[0][tmpIndex];
      tmpValue = (tmpValue < -270) ? -270 : tmpValue;
      tmpValue = (tmpValue > 100) ? 100 : tmpValue;

      // update value in the dynamic platform persistent storage
      this.accessory.context.data.currentTemperature = tmpValue;

      this.temperatureSensor.updateCharacteristic(
        this.platform.Characteristic.CurrentTemperature,
        this.accessory.context.data.currentTemperature
      );

    }

    const humIndex = datapoints.sensors.indexOf("hum");
    if (humIndex >= 0) {

      // constrain value to characteristic limits
      let humValue = datapoints.datapoints[0][humIndex];
      humValue = (humValue < 0) ? 0 : humValue;
      humValue = (humValue > 100) ? 100 : humValue;

      // update value in the dynamic platform persistent storage
      this.accessory.context.data.currentRelativeHumidity = humValue;

      this.humiditySensor.updateCharacteristic(
        this.platform.Characteristic.CurrentRelativeHumidity,
        this.accessory.context.data.currentRelativeHumidity
      );

    }

    const co2Index = datapoints.sensors.indexOf("co2");
    if (co2Index >= 0) {

      // constrain value to characteristic limits
      let co2Value = datapoints.datapoints[0][co2Index];
      co2Value = (co2Value < 0) ? 0 : co2Value;
      co2Value = (co2Value > 100000) ? 100000 : co2Value;

      // update value in the dynamic platform persistent storage
      this.accessory.context.data.carbonDioxideLevel = co2Value;
      this.accessory.context.data.carbonDioxidePeakLevel = this.peakCO2(co2Value);

      this.carbonDioxideSensor.updateCharacteristic(
        this.platform.Characteristic.CarbonDioxideDetected,
        this.detectCO2(this.accessory.context.data.carbonDioxideLevel)
      );
      this.carbonDioxideSensor.updateCharacteristic(
        this.platform.Characteristic.CarbonDioxideLevel,
        this.accessory.context.data.carbonDioxideLevel
      );
      this.carbonDioxideSensor.updateCharacteristic(
        this.platform.Characteristic.CarbonDioxidePeakLevel,
        this.accessory.context.data.carbonDioxidePeakLevel
      );

    }

    const vocIndex = datapoints.sensors.indexOf("voc");
    if (vocIndex >= 0) {

      // update value in the dynamic platform persistent storage
      this.accessory.context.data.vocdensity = this.convertVOCppb2ugm3(datapoints.datapoints[0][vocIndex]);

      this.airQualitySensor.updateCharacteristic(
        this.platform.Characteristic.VOCDensity,
        this.accessory.context.data.vocdensity
      );

    }

    const allpolluIndex = datapoints.sensors.indexOf("allpollu");
    if (allpolluIndex >= 0) {

      // update value in the dynamic platform persistent storage
      this.accessory.context.data.airquality = this.convertAllpollu2AirQuality(datapoints.datapoints[0][allpolluIndex]);

      this.airQualitySensor.updateCharacteristic(
        this.platform.Characteristic.AirQuality,
        this.accessory.context.data.airquality
      );

    }

    const timeIndex = datapoints.sensors.indexOf("time");
    if (timeIndex >= 0) {

      const timeValue = datapoints.datapoints[0][timeIndex];

      // update value in the dynamic platform persistent storage
      this.accessory.context.data.time = timeValue;

    }

    this.platform.log.debug("Finished updating datapoints for " + this.accessory.context.device.name);

    // setup next call to the foobot API
    // alternate between 5 minute delays and 10 minute delays
    if (this.delay > 7.5 * 60 * 1000) {
      this.delay = 5 * 60 * 1000;
    } else {
      this.delay = 10 * 60 * 1000;
    }

    // Foobot updates data every five minutes
    // subtract the time delta from the delay
    // to try to get our calls aligned with theirs
    let delta = Date.now() - (this.accessory.context.data.time * 1000);
    this.platform.log.debug(`Delta between now and the time in the data: ${this.prettyPrintDuration(delta)}`);
    if (delta > 5 * 60 * 1000) {

      // unexpected, the delta should not exceed 5 minutes
      this.platform.log.warn(`Time delta of ${this.prettyPrintDuration(delta)} exceeds 5 minutes.`);
      delta = 0;

    }
    if (delta < (5 / 2 * 60 * 1000)) {

      // delta is small, so let us try to hit the next update
      this.delay = this.delay - delta;

    } else {

      // delta is larger, so add some time to wait for the update after next
      this.delay = this.delay + (5 * 60 * 1000) - delta;

    }

    // make sure multiple devices do not call the api at the same time
    // by adding an offset to the delay based on the index of each device
    this.delay = this.delay - (this.accessory.context.device.offset * 1000);
    this.platform.log.debug(`Waiting ${this.prettyPrintDuration(this.delay)} for next call...`);

    // clear any remaining timeouts and start a new one
    clearTimeout(this.timeout);
    this.timeout = setTimeout(this.updatecharacteristics.bind(this), this.delay);

  }

  prettyPrintDuration(milliseconds: number) {

    let result = "";
    let remainder = milliseconds;

    if (remainder > 365.2525 * 24 * 60 * 60 * 1000) {

      const years = Math.floor(remainder / 1000 / 60 / 60 / 24 / 365.2525);
      remainder = remainder - (years * 365.2525 * 24 * 60 * 60 * 1000);
      result = `${years}y `;

    }
    if (remainder > 7 * 24 * 60 * 60 * 1000) {

      const weeks = Math.floor(remainder / 1000 / 60 / 60 / 24 / 7);
      remainder = remainder - (weeks * 7 * 24 * 60 * 60 * 1000);
      result = `${weeks}w `;

    }
    if (remainder > 24 * 60 * 60 * 1000) {

      const days = Math.floor(remainder / 1000 / 60 / 60 / 24);
      remainder = remainder - (days * 24 * 60 * 60 * 1000);
      result = `${days}d `;

    }
    if (remainder > 60 * 60 * 1000) {

      const hours = Math.floor(remainder / 1000 / 60 / 60);
      remainder = remainder - (hours * 60 * 60 * 1000);
      result = `${hours}h `;

    }
    if (remainder > 60 * 1000) {

      const minutes = Math.floor(remainder / 1000 / 60);
      remainder = remainder - (minutes * 60 * 1000);
      result = `${minutes}m `;

    }
    if (remainder > 1000) {

      const seconds = Math.floor(remainder / 1000);
      remainder = remainder - (seconds * 1000);
      result += `${seconds}s `;

    }

    result += `${remainder}ms`

    return result;

  }

  /**
   * convert CO2 ppm values to normal/abnormal values
   */
  detectCO2(value: number) {

    const CarbonDioxideDetected = this.platform.Characteristic.CarbonDioxideDetected;

    let limit = this.platform.config.co2limit;
    if (value > limit) {
      return CarbonDioxideDetected.CO2_LEVELS_ABNORMAL;
    } else {
      return CarbonDioxideDetected.CO2_LEVELS_NORMAL;
    }

  }

  /**
   * convert CO2 ppm values to normal/abnormal values
   */
  peakCO2(value: number) {

    let peakLevel = this.accessory.context.data.carbonDioxidePeakLevel;

    if (value > peakLevel) {
      peakLevel = value;
    }

    return peakLevel;

  }

  /**
   * convert parts-per-billion to micrograms per cubic meter
   * for VOC density
   * Foobot is very sensitive to CO
   * therefore convert VOCs in ppb to ug/m3 based on mostly CO
   * https://uk-air.defra.gov.uk/assets/documents/reports/cat06/0502160851_Conversion_Factors_Between_ppb_and.pdf
   */
  convertVOCppb2ugm3(ppb: number) {

    const CO_AT_20C_AND_1013MB = 1.1642;
    let ugm3 = ppb * CO_AT_20C_AND_1013MB;

    // Homekit Characteristic Limited to 1000 micrograms per cubic meter
    if (ugm3 > 1000) {
      ugm3 = 1000;
    }

    return ugm3;

  }

  /**
   * convert Foobot `allpullu` values to HomeKit AirQuality values
   * problem is Foobot shows six air quality levels
   * and HomeKit has five air quality levels
   * Fooboot    | Homekit
   * All Blue   | EXCELLENT
   * 2/3 Blue   | GOOD
   * 1/3 Blue   | FAIR
   * 1/3 Orange | INFERIOR (Homekit alerts)
   * 2/3 Orange | ???
   * All Orange | POOR
   * values from gchokov
   *  0 -  25  EXCELLENT
   * 26 -  50  GOOD
   * 51 -  70  FAIR
   * 71 -  90  INFERIOR
   * 91 - 100  POOR
   * values from keithws (bellcurve)
   *  0 -  10  EXCELLENT (10%)
   * 10 -  30  GOOD (20%)
   * 30 -  70  FAIR (40%)
   * 70 -  90  INFERIOR (20%)
   * 90 - 100+ POOR (10%)
   * values from keithws (aligned inferior to 1/3 orange)
   *  0 -  17  EXCELLENT
   * 17 -  33  GOOD
   * 33 -  50  FAIR
   * 50 -  67  INFERIOR
   * 67 -  83  (missing)
   * 83 - 100+ POOR
   */
  convertAllpollu2AirQuality(allpollu: number) {

    let result = this.platform.Characteristic.AirQuality.UNKNOWN;

    if (allpollu && !isNaN(allpollu)) {

      if (allpollu <= (50 / 3)) {

        result = this.platform.Characteristic.AirQuality.EXCELLENT;

      } else if (allpollu <= (50 / 3 * 2)) {

        result = this.platform.Characteristic.AirQuality.GOOD;

      } else if (allpollu <= 50) {

        result = this.platform.Characteristic.AirQuality.FAIR;

      } else if (allpollu <= (50 / 3 * 4)) {

        result = this.platform.Characteristic.AirQuality.INFERIOR;

      } else if (allpollu <= (50 / 3 * 5)) {

        // deliberate reuse of inferior
        result = this.platform.Characteristic.AirQuality.INFERIOR;

      } else {

        result = this.platform.Characteristic.AirQuality.POOR;

      }

    }

    return result;

  }

  public setActive(isActive?: boolean) {

    if (typeof isActive !== "boolean") {
      isActive = isActive || true;
    }

    this.active = isActive;

    // set all services to active/inactive
    this.airQualitySensor.updateCharacteristic(
      this.platform.Characteristic.StatusActive,
      isActive
    );

    this.temperatureSensor.updateCharacteristic(
      this.platform.Characteristic.StatusActive,
      isActive
    );

    this.humiditySensor.updateCharacteristic(
      this.platform.Characteristic.StatusActive,
      isActive
    );

    if (!this.platform.config.co2off) {
      this.carbonDioxideSensor.updateCharacteristic(
        this.platform.Characteristic.StatusActive,
        isActive
      );
    }

  }

}


