export type FootballTeam = {
  id: number;
  name: string;
  mono: string;
  logo: string | null;
  color: string;
};

export type PickFixture = {
  id: string;
  home: FootballTeam;
  away: FootballTeam;
  kickoffIso: string;
  kickoffLabel: string;
  venue: string;
  lockSeconds: number;
  locked: boolean;
  flag: boolean;
  def: [number, number];
  dist: [number, number, number];
  round: string | null;
  status: string;
};

export type LiveEvent = {
  min: string;
  kind: "Goal" | "Yellow card" | "Red card" | "Var";
  teamId: number;
  teamName: string;
};

export type LiveMatch = {
  id: string;
  home: FootballTeam;
  away: FootballTeam;
  score: string;
  homeGoals: number | null;
  awayGoals: number | null;
  minute: number;
  status: string;
  statusShort: string;
  venue: string;
  events: LiveEvent[];
  isLive: boolean;
  isFinished: boolean;
};

export type Wc26Team = {
  id: string;
  name: string;
  displayName: string;
  abbreviation: string;
  logo?: string;
  color?: string;
};

export type Wc26Competitor = {
  id: string;
  homeAway: "home" | "away";
  score: string;
  team: Wc26Team;
};

export type Wc26StatusType = {
  name: string;
  state: "pre" | "in" | "post";
  completed: boolean;
  description: string;
  detail: string;
  shortDetail: string;
};

export type Wc26Status = {
  clock: number;
  displayClock: string;
  period: number;
  type: Wc26StatusType;
};

export type Wc26Detail = {
  type: { id: string; text: string };
  clock: { value: number; displayValue: string };
  team: { id: string };
  scoringPlay: boolean;
  redCard: boolean;
  yellowCard: boolean;
};

export type Wc26Competition = {
  id: string;
  date: string;
  startDate: string;
  status: Wc26Status;
  venue: { fullName?: string; address?: { city?: string } };
  competitors: Wc26Competitor[];
  details?: Wc26Detail[];
};

export type Wc26Event = {
  id: string;
  date: string;
  name: string;
  competitions: Wc26Competition[];
};

export type Wc26FixturesResponse = {
  league: {
    calendar: string[];
    season: { year: number; display_name: string };
  };
  count: number;
  pageIndex: number;
  pageSize: number;
  pageCount: number;
  events: Wc26Event[];
};

export type Wc26ScoreboardResponse = {
  events: Wc26Event[];
};

export type Wc26PlaysResponse = {
  items: Array<{
    type: { text: string };
    clock: { displayValue: string };
    team: { name: string; source_id?: string };
    scoringPlay: boolean;
    redCard: boolean;
    yellowCard: boolean;
  }>;
};
