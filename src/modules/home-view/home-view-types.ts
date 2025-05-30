export type SampleSlot = {
  time: string;
  name: string;
  task: string;
};

export type SampleScheduleColumn = {
  position: string;
  slots: SampleSlot[];
};
