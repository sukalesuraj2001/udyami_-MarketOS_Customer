/** Column definition for an editable `mk-repeat-list`. */
export type RepeatColumnType = 'text' | 'number' | 'date' | 'textarea' | 'lines';

export interface RepeatColumn {
  key: string;
  label: string;
  type?: RepeatColumnType;
  placeholder?: string;
  /** Spans the full row instead of half. */
  full?: boolean;
}

export type RepeatRow = Record<string, string | number | null>;
