export type Device = {
  id: number;
  name: string;
  address: string;
  connected: boolean;
  iconData: any;
  batteryLevelString: string;
  batteryLevel: number;
  status: string;
  connecting: boolean;
};
