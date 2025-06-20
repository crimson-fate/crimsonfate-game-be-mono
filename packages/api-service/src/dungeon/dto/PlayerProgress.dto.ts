export class PlayerProgressDto {
  player: {
    address: string;
    username: string;
  };
  gameId: string;
  wave: number;
  season: {
    id: string;
    name: string;
    startDate: number;
    endDate: number;
  } | null;
  startTime: number;
  endTime: number;
  isCompleted: boolean;
}
