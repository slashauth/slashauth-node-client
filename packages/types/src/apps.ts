export type GetInfoResponse = {
  data: App;
};

export type App = {
  clientID: string;
  name: string;
  description?: string;
};
