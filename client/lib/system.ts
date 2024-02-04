import "@azure/core-asynciterator-polyfill";
import {
  AbstractPowerSyncDatabase,
  RNQSPowerSyncDatabaseOpenFactory,
} from "@journeyapps/powersync-sdk-react-native";
import React from "react";
import "react-native-polyfill-globals/auto";
import { AppSchema } from "./AppSchema";
import { ExpressConnector } from "./express/Connector";

export class System {
  expressConnector: ExpressConnector;
  powersync: AbstractPowerSyncDatabase;

  constructor() {
    const factory = new RNQSPowerSyncDatabaseOpenFactory({
      schema: AppSchema,
      dbFilename: "sqlite.db",
    });

    this.expressConnector = new ExpressConnector();
    this.powersync = factory.getInstance();
  }

  async init() {
    await this.powersync.init();
    await this.powersync.connect(this.expressConnector);
  }
}

export const system = new System();

export const SystemContext = React.createContext(system);
export const useSystem = () => React.useContext(SystemContext);
