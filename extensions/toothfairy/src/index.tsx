import { ActionPanel, Detail, List, Action, Color, Icon, Image } from "@raycast/api";
import { Fragment, useContext, useEffect, useState } from "react";
import "@jxa/global-type";
import Jimp from "jimp";
import { Device } from "./types";
import { isRunning, ToothFairyContext, ToothFairyProvider, useDevices } from "./api";

export default () => {
  try {
    if (!isRunning()) {
      return <Detail markdown="Not Running" />;
    }
  } catch (error) {
    // Probably not installed
    return <Detail markdown="Not installed" />;
  }

  return (
    <ToothFairyProvider>
      <Command />
    </ToothFairyProvider>
  );
};

const Command = () => {
  const [isLoading, devices] = useDevices();

  const connected = devices.filter((device) => device.connected);
  const disconnected = devices.filter((device) => !device.connected);

  return (
    <List isLoading={isLoading}>
      <List.Section title="Connected">
        {connected.map((device) => {
          return <DeviceItem device={device} />;
        })}
      </List.Section>
      <List.Section title="Disconnected">
        {disconnected.map((device) => {
          return <DeviceItem device={device} />;
        })}
      </List.Section>
    </List>
  );
};

const DeviceItem = ({ device }: { device: Device }) => {
  const [iconData, setIconData] = useState<Image.Source>("");

  useEffect(() => {
    if (device.iconData == null) {
      setIconData("");
      return;
    }
    Jimp.read(Buffer.from(device.iconData.slice(8, -2), "hex"))
      .then((image) => {
        return image.autocrop({ leaveBorder: 1 }).resize(64, Jimp.AUTO).getBase64Async("image/png");
      })
      .then((image) => setIconData(image || Icon.TwoArrowsClockwise));
  }, [device.iconData]);

  const accessories = [];
  if (device.batteryLevel != null) {
    accessories.push({ text: device.batteryLevelString });
  }
  // TODO: add information about connection scripts etc

  return (
    <List.Item
      icon={{ source: device.connecting ? Icon.TwoArrowsClockwise : iconData, tintColor: Color.PrimaryText }}
      title={device.name}
      accessories={accessories}
      actions={
        <ActionPanel>
          <ConnectionActions device={device} />
          {/* TODO: add option to open ToothFairy */}
        </ActionPanel>
      }
    />
  );
};

const ConnectionActions = ({ device }: { device: Device }) => {
  const toothFairyApi = useContext(ToothFairyContext);

  if (!device.connecting) {
    if (device.connected) {
      return (
        <Action
          title="Disconnect"
          onAction={() => {
            toothFairyApi.connect(device.id, false);
          }}
        />
      );
    } else {
      return (
        <Action
          title="Connect"
          onAction={() => {
            toothFairyApi.connect(device.id, true);
          }}
        />
      );
    }
  }
  return null;
};
