import { run } from "@jxa/run";
import React, { createContext, useContext, useEffect, useState } from "react";
import { ToothFairy } from "./ToothFairy";
import { Device } from "./types";

export async function isRunning() {
  return await run<boolean>(() => {
    const app = Application("ToothFairy");
    return app.running();
  });
}

async function getDevices() {
  return await run<Device[]>(() => {
    const app = Application<ToothFairy>("ToothFairy");
    return app.devices().map((device: ToothFairy.Device): Device => {
      return {
        id: device.id(),
        name: device.name(),
        address: device.address(),
        connected: device.connected(),
        iconData: device.iconData(),
        batteryLevelString: device.batteryLevelString(),
        batteryLevel: device.batteryLevel(),
        status: device.status(),
        connecting: false,
      };
    });
  });
}

type ToothFairyApi = {
  devices: Device[];
  isLoading: boolean;
  refresh: () => void;
  connect: (id: number, connect: boolean) => void;
};

type ConnectionRequest = {
  timeoutId: NodeJS.Timeout;
  previous: boolean;
};

export const ToothFairyContext = createContext<ToothFairyApi>({
  devices: [],
  isLoading: true,
  refresh: () => {},
  connect: () => {},
});

export const ToothFairyProvider = ({ children }: React.PropsWithChildren<{}>) => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [connectionRequests, setConnectionRequests] = useState<{ [id: number]: ConnectionRequest }>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refresh = async () => {
    const devices = await getDevices();
    setDevices(devices);
    setIsLoading(false);
  };

  for (let device of devices) {
    if (device.id in connectionRequests) {
      const connectionRequest = connectionRequests[device.id];
      if (device.connected == connectionRequest.previous) {
        device.connecting = true;
      } else {
        setConnectionRequests((prev) => {
          // Remove the id from connection requests
          const { [device.id]: value, ...next } = prev;
          return next;
        });
      }
    }
  }

  const connect = async (id: number, connect: boolean) => {
    if (
      await run(
        (id: number, connect: boolean) => {
          const app = Application<ToothFairy>("ToothFairy");
          const device: ToothFairy.Device = app.devices.byId(id);
          const previous = device.connected();
          if (connect == previous) {
            return false;
          }
          device.connected.set(connect);
          return true;
        },
        id,
        connect
      )
    ) {
      setConnectionRequests((prev) => ({
        ...prev,
        [id]: {
          previous: !connect,
          timeoutId: setTimeout(() => {
            setConnectionRequests((prev) => {
              // Remove the id from connection requests
              const { [id]: value, ...next } = prev;
              return next;
            });
          }, 40000),
        },
      }));
      refresh();
    }
  };

  useEffect(() => {
    refresh();
    const interval = setInterval(() => {
      refresh();
    }, 2500);
    return () => {
      clearInterval(interval);
      for (let id in connectionRequests) {
        clearTimeout(connectionRequests[id].timeoutId);
      }
    };
  }, []);

  return <ToothFairyContext.Provider value={{ devices, isLoading, refresh, connect }} children={children} />;
};

export const useDevices = (): [boolean, Device[]] => {
  const toothFairyApi = useContext(ToothFairyContext);
  return [toothFairyApi.isLoading, toothFairyApi.devices];
};

export const useRefresh = () => {
  const toothFairyApi = useContext(ToothFairyContext);
  return toothFairyApi.refresh;
};
