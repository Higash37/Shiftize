

import { MD3ColorScheme } from "./MD3Colors";
import { MD3TypeScale } from "./MD3Typography";
import { MD3ShapeScale } from "./MD3Shape";
import { MD3ElevationScale } from "./MD3Elevation";
import { MD3SpacingScale } from "./MD3Spacing";

export interface MD3Theme {

  colorScheme: MD3ColorScheme;

  typography: MD3TypeScale;

  shape: MD3ShapeScale;

  elevation: MD3ElevationScale;

  spacing: MD3SpacingScale;
}
