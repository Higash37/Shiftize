

export type SampleSlot = {
  name: string;
  start: string;
  end: string;
  task: string;
  date: string;
  color?: string;

  type?: "user" | "class";

};

export type SampleScheduleColumn = {
  position: string;
  slots: SampleSlot[];
  status?: string;
};
